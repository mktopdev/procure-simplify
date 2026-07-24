-- Foundational ERP schema (Phase 1, Step 0)
-- Multi-tenancy scaffold, RBAC, shared event/audit/document plumbing, and
-- minimal master data shared by every Phase 1 module (Suppliers, Procurement,
-- Finance, Transportation) and every module that follows.
--
-- Single-company bootstrap: a fixed Transxpress company/branch row is seeded
-- below so every new record has a valid company_id/branch_id from day one,
-- without requiring a company picker in the UI yet. Multi-company UI is a
-- later phase; the schema is ready for it now.

-- ============================================================================
-- Utility: updated_at trigger, reused by every table below and beyond.
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- Multi-tenancy scaffold
-- ============================================================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  default_currency text not null default 'GNF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  name text not null,
  city text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code)
);

create table if not exists public.currencies (
  code text primary key,
  name text not null,
  symbol text not null
);

-- Fixed bootstrap IDs so every FK default below can point at a real row.
insert into public.companies (id, code, name, default_currency)
values ('00000000-0000-0000-0000-000000000001', 'TRANSXPRESS', 'Transxpress SARL', 'GNF')
on conflict (id) do nothing;

insert into public.branches (id, company_id, code, name, city, country)
values ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'CKY-HQ', 'Conakry HQ', 'Conakry', 'Guinea')
on conflict (id) do nothing;

insert into public.currencies (code, name, symbol) values
  ('GNF', 'Guinean Franc', 'GNF'),
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('XOF', 'West African CFA Franc', 'CFA')
on conflict (code) do nothing;

-- Retrofit existing tables with company/branch scope (nullable-with-default,
-- non-breaking for existing rows since this project only has dev data).
alter table public.profiles
  add column if not exists company_id uuid references public.companies(id) default '00000000-0000-0000-0000-000000000001',
  add column if not exists branch_id uuid references public.branches(id) default '00000000-0000-0000-0000-000000000002';

alter table public.expressions_of_need
  add column if not exists company_id uuid references public.companies(id) default '00000000-0000-0000-0000-000000000001',
  add column if not exists branch_id uuid references public.branches(id) default '00000000-0000-0000-0000-000000000002';

update public.profiles set company_id = '00000000-0000-0000-0000-000000000001' where company_id is null;
update public.profiles set branch_id = '00000000-0000-0000-0000-000000000002' where branch_id is null;
update public.expressions_of_need set company_id = '00000000-0000-0000-0000-000000000001' where company_id is null;
update public.expressions_of_need set branch_id = '00000000-0000-0000-0000-000000000002' where branch_id is null;

-- ============================================================================
-- RBAC foundation
-- ============================================================================
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (company_id, key)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  description text
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- Generic, configurable approval matrix. Reused by Procurement (PR/PO),
-- Finance (invoice/payment), and every later module's approval workflow
-- instead of each module hardcoding its own role-based switch statement.
create table if not exists public.approval_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  module text not null, -- e.g. 'procurement', 'finance', 'transport'
  entity_type text not null, -- e.g. 'purchase_request', 'purchase_order', 'supplier_invoice'
  sequence int not null default 1, -- ordering when multiple approvals are required
  min_amount numeric, -- null = no lower bound
  max_amount numeric, -- null = no upper bound
  approver_role_id uuid not null references public.roles(id),
  created_at timestamptz not null default now()
);

create or replace function public.has_permission(p_user_id uuid, p_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = p_user_id
      and p.key = p_permission_key
  );
$$;

-- ============================================================================
-- Shared plumbing: documents, audit trail, domain events
-- ============================================================================

-- Generalized attachment store. expression_attachments is left untouched
-- (Expression of Need keeps working unchanged); every new module (Suppliers,
-- Purchase Orders, Goods Receipts, Vehicles, Trips, ...) attaches files here
-- instead of each getting its own bespoke *_attachments table.
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null, -- e.g. 'supplier', 'purchase_order', 'goods_receipt', 'trip'
  owner_id uuid not null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size int,
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamptz not null default now()
);
create index if not exists documents_owner_idx on public.documents (owner_type, owner_id);

-- Shared storage bucket backing the documents table above, reused by every
-- module (expressions-attachments remains its own separate bucket).
insert into storage.buckets (id, name, public)
values ('erp-documents', 'erp-documents', true)
on conflict (id) do nothing;

create policy "erp_documents_select" on storage.objects for select to authenticated
  using (bucket_id = 'erp-documents');
create policy "erp_documents_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'erp-documents');

-- Generalized field-level audit trail (submission_audit_logs is left
-- untouched for Expression of Need). Populated by log_audit_change() below,
-- attached per-table by each module's own migration.
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  field_name text not null,
  old_value text,
  new_value text,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);
create index if not exists audit_logs_record_idx on public.audit_logs (table_name, record_id);

create or replace function public.log_audit_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_col text;
  v_old jsonb;
  v_new jsonb;
begin
  if tg_op = 'UPDATE' then
    v_old := to_jsonb(old);
    v_new := to_jsonb(new);
    for v_col in select jsonb_object_keys(v_new) loop
      if v_old->v_col is distinct from v_new->v_col then
        insert into public.audit_logs(table_name, record_id, field_name, old_value, new_value, changed_by)
        values (tg_table_name, new.id, v_col, v_old->>v_col, v_new->>v_col, auth.uid());
      end if;
    end loop;
    return new;
  elsif tg_op = 'INSERT' then
    insert into public.audit_logs(table_name, record_id, field_name, old_value, new_value, changed_by)
    values (tg_table_name, new.id, '__record__', null, 'created', auth.uid());
    return new;
  end if;
  return null;
end;
$$;

-- Append-only event outbox. The pragmatic, Supabase-native analog of the
-- SRS's "event bus": business events (not raw row changes) are recorded here
-- for audit + replay. Same-transaction, deterministic side effects (e.g. "PO
-- approved -> create job ledger entry") are done directly by triggers calling
-- emit_domain_event(); effects needing external calls (notifications, email)
-- are picked up later by a Supabase Edge Function polling unprocessed rows.
create table if not exists public.domain_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- e.g. 'PurchaseOrderApproved', 'GoodsReceived'
  entity_type text not null,
  entity_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  company_id uuid references public.companies(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists domain_events_entity_idx on public.domain_events (entity_type, entity_id);
create index if not exists domain_events_type_idx on public.domain_events (event_type);

create or replace function public.emit_domain_event(
  p_event_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_payload jsonb default '{}'::jsonb,
  p_company_id uuid default '00000000-0000-0000-0000-000000000001',
  p_created_by uuid default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.domain_events(event_type, entity_type, entity_id, payload, company_id, created_by)
  values (p_event_type, p_entity_type, p_entity_id, p_payload, p_company_id, coalesce(p_created_by, auth.uid()))
  returning id into v_id;
  return v_id;
end;
$$;

-- ============================================================================
-- Minimal master data needed by Phase 1 (full CRM/Fleet are later phases)
-- ============================================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  name text not null,
  customer_type text,
  email text,
  phone text,
  address text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cost_centers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (company_id, code)
);

create trigger customers_set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Seed: roles, permissions, cost centers
-- ============================================================================
insert into public.roles (company_id, key, name, description) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Administrator', 'Full platform access'),
  ('00000000-0000-0000-0000-000000000001', 'executive', 'Executive Management', 'Read-only company-wide visibility plus high-value approvals'),
  ('00000000-0000-0000-0000-000000000001', 'operations_manager', 'Operations Manager', 'Operational approvals and oversight'),
  ('00000000-0000-0000-0000-000000000001', 'procurement_officer', 'Procurement Officer', 'Manages suppliers, RFQs, and purchase orders'),
  ('00000000-0000-0000-0000-000000000001', 'finance_officer', 'Finance Officer', 'Manages invoices, payments, and job costing'),
  ('00000000-0000-0000-0000-000000000001', 'transport_dispatcher', 'Transport Dispatcher', 'Assigns vehicles/drivers and manages trips'),
  ('00000000-0000-0000-0000-000000000001', 'fleet_manager', 'Fleet Manager', 'Manages vehicles and drivers'),
  ('00000000-0000-0000-0000-000000000001', 'driver', 'Driver', 'Views assigned trips')
on conflict (company_id, key) do nothing;

insert into public.permissions (key, module, description) values
  ('admin.manage_roles', 'admin', 'Manage roles, permissions, and approval rules'),
  ('suppliers.view', 'suppliers', 'View supplier records'),
  ('suppliers.manage', 'suppliers', 'Create/edit supplier records'),
  ('procurement.view', 'procurement', 'View purchase requests, RFQs, POs, GRNs'),
  ('procurement.manage', 'procurement', 'Create/edit purchase requests, RFQs, POs, GRNs'),
  ('procurement.approve', 'procurement', 'Approve purchase requests and purchase orders'),
  ('finance.view', 'finance', 'View invoices, job costing, budgets'),
  ('finance.manage', 'finance', 'Create/edit invoices and payments'),
  ('finance.approve', 'finance', 'Approve invoices and payments'),
  ('transport.view', 'transport', 'View transport orders and trips'),
  ('transport.manage', 'transport', 'Create/edit transport orders, assign vehicles/drivers')
on conflict (key) do nothing;

-- admin gets everything
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where (r.key = 'procurement_officer' and p.key in ('suppliers.view','suppliers.manage','procurement.view','procurement.manage'))
   or (r.key = 'operations_manager' and p.key in ('suppliers.view','procurement.view','procurement.approve','transport.view','finance.view'))
   or (r.key = 'finance_officer' and p.key in ('finance.view','finance.manage','finance.approve','procurement.view','suppliers.view'))
   or (r.key = 'executive' and p.key in ('suppliers.view','procurement.view','procurement.approve','finance.view','finance.approve','transport.view'))
   or (r.key = 'transport_dispatcher' and p.key in ('transport.view','transport.manage'))
   or (r.key = 'fleet_manager' and p.key in ('transport.view','transport.manage'))
   or (r.key = 'driver' and p.key in ('transport.view'))
on conflict do nothing;

-- Backfill user_roles from the existing profiles.role text column so nobody
-- loses access once permission checks start gating new-module writes. Users
-- with an unmapped/default role get no extra permissions beyond the plain
-- authenticated read policies already granted on reference data below.
insert into public.user_roles (user_id, role_id)
select p.id, r.id
from public.profiles p
join public.roles r on r.company_id = '00000000-0000-0000-0000-000000000001'
  and r.key = case p.role
    when 'admin' then 'admin'
    when 'manager' then 'operations_manager'
    when 'finance' then 'finance_officer'
    when 'logistics' then 'transport_dispatcher'
    else null
  end
where p.role in ('admin', 'manager', 'finance', 'logistics')
on conflict do nothing;

insert into public.cost_centers (company_id, code, name) values
  ('00000000-0000-0000-0000-000000000001', 'GEN', 'General'),
  ('00000000-0000-0000-0000-000000000001', 'OPS', 'Operations'),
  ('00000000-0000-0000-0000-000000000001', 'FLEET', 'Fleet'),
  ('00000000-0000-0000-0000-000000000001', 'FIN', 'Finance'),
  ('00000000-0000-0000-0000-000000000001', 'PROC', 'Procurement'),
  ('00000000-0000-0000-0000-000000000001', 'TRANS', 'Transportation')
on conflict (company_id, code) do nothing;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.companies enable row level security;
alter table public.branches enable row level security;
alter table public.currencies enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.approval_rules enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;
alter table public.domain_events enable row level security;
alter table public.customers enable row level security;
alter table public.cost_centers enable row level security;

-- Reference/master data: any authenticated user can read.
create policy companies_select on public.companies for select to authenticated using (true);
create policy branches_select on public.branches for select to authenticated using (true);
create policy currencies_select on public.currencies for select to authenticated using (true);
create policy roles_select on public.roles for select to authenticated using (true);
create policy permissions_select on public.permissions for select to authenticated using (true);
create policy role_permissions_select on public.role_permissions for select to authenticated using (true);
create policy approval_rules_select on public.approval_rules for select to authenticated using (true);
create policy customers_select on public.customers for select to authenticated using (true);
create policy cost_centers_select on public.cost_centers for select to authenticated using (true);

-- RBAC administration: only admin.manage_roles holders can write.
create policy roles_write on public.roles for all to authenticated
  using (public.has_permission(auth.uid(), 'admin.manage_roles'))
  with check (public.has_permission(auth.uid(), 'admin.manage_roles'));
create policy permissions_write on public.permissions for all to authenticated
  using (public.has_permission(auth.uid(), 'admin.manage_roles'))
  with check (public.has_permission(auth.uid(), 'admin.manage_roles'));
create policy role_permissions_write on public.role_permissions for all to authenticated
  using (public.has_permission(auth.uid(), 'admin.manage_roles'))
  with check (public.has_permission(auth.uid(), 'admin.manage_roles'));
create policy approval_rules_write on public.approval_rules for all to authenticated
  using (public.has_permission(auth.uid(), 'admin.manage_roles'))
  with check (public.has_permission(auth.uid(), 'admin.manage_roles'));

-- user_roles: users can see their own roles; only admins manage assignments.
create policy user_roles_select_own on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_permission(auth.uid(), 'admin.manage_roles'));
create policy user_roles_write on public.user_roles for all to authenticated
  using (public.has_permission(auth.uid(), 'admin.manage_roles'))
  with check (public.has_permission(auth.uid(), 'admin.manage_roles'));

-- documents/audit_logs/domain_events: authenticated read; inserts allowed for
-- authenticated users (writes are almost always performed via a trigger or
-- server-side flow acting on behalf of the current user).
create policy documents_select on public.documents for select to authenticated using (true);
create policy documents_insert on public.documents for insert to authenticated with check (true);
create policy audit_logs_select on public.audit_logs for select to authenticated using (true);
create policy domain_events_select on public.domain_events for select to authenticated using (true);

-- customers/cost_centers: any authenticated user can manage for now (Phase 1,
-- small internal user base); tighten with has_permission() once CRM/Finance
-- admin screens exist to manage this centrally.
create policy customers_write on public.customers for all to authenticated using (true) with check (true);
create policy cost_centers_write on public.cost_centers for all to authenticated using (true) with check (true);
