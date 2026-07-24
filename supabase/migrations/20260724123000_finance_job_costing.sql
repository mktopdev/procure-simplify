-- Finance & Job Costing (Phase 1, Step 3)
-- Scoped deliberately narrow: Accounts Payable + Job Costing + basic
-- budgets, not a full GL/AR (AR needs customer invoicing from CRM, a later
-- phase).

-- ============================================================================
-- Job Ledger: the concrete implementation of Ch.13.4/13.5. Polymorphic so
-- every module (Procurement today, Transportation next) can post cost/
-- revenue entries against whatever entity they own.
-- ============================================================================
create table if not exists public.job_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  entity_type text not null, -- 'purchase_order' | 'transport_order' | ...
  entity_id uuid not null,
  entry_type text not null, -- 'revenue' | 'expense'
  category text not null,
  amount numeric not null,
  currency_code text not null default 'GNF' references public.currencies(code),
  cost_center_id uuid references public.cost_centers(id),
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists job_ledger_entries_entity_idx on public.job_ledger_entries (entity_type, entity_id);

-- ============================================================================
-- Accounts Payable (Ch.13.7)
-- ============================================================================
create sequence if not exists public.supplier_invoice_number_seq start 1;

create table if not exists public.supplier_invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  invoice_number text not null,
  internal_reference text unique,
  supplier_id uuid not null references public.suppliers(id),
  purchase_order_id uuid references public.purchase_orders(id),
  invoice_date date not null default current_date,
  due_date date,
  currency_code text not null default 'GNF' references public.currencies(code),
  subtotal numeric not null default 0,
  tax_amount numeric not null default 0,
  total_amount numeric generated always as (subtotal + tax_amount) stored,
  status text not null default 'pending_approval', -- pending_approval | approved | paid | rejected
  notes text,
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.generate_supplier_invoice_reference()
returns trigger
language plpgsql
as $$
begin
  if new.internal_reference is null then
    new.internal_reference := 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.supplier_invoice_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger supplier_invoices_set_reference before insert on public.supplier_invoices
  for each row execute function public.generate_supplier_invoice_reference();
create trigger supplier_invoices_set_updated_at before update on public.supplier_invoices
  for each row execute function public.set_updated_at();
create trigger supplier_invoices_audit after insert or update on public.supplier_invoices
  for each row execute function public.log_audit_change();

-- Three legs of the Ch.14.13 three-way match, surfaced for a human approver
-- to compare (automatic discrepancy detection is an AI-phase capability,
-- deferred; Phase 1 shows the numbers side by side).
create or replace view public.po_financial_summary as
select
  po.id as purchase_order_id,
  po.po_number,
  coalesce(sum(poi.line_total), 0) as ordered_total,
  coalesce((
    select sum(gri.quantity_received * poi2.unit_price)
    from public.goods_receipt_items gri
    join public.purchase_order_items poi2 on poi2.id = gri.purchase_order_item_id
    where poi2.purchase_order_id = po.id
  ), 0) as received_value,
  coalesce((
    select sum(si.total_amount)
    from public.supplier_invoices si
    where si.purchase_order_id = po.id and si.status <> 'rejected'
  ), 0) as invoiced_total
from public.purchase_orders po
left join public.purchase_order_items poi on poi.purchase_order_id = po.id
group by po.id, po.po_number;

-- ============================================================================
-- Budgets & expense categories (Ch.13.9-13.10, minimal)
-- ============================================================================
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  name text not null,
  unique (company_id, name)
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  cost_center_id uuid not null references public.cost_centers(id),
  category text,
  period text not null, -- e.g. '2026' or '2026-01'
  budget_amount numeric not null,
  created_at timestamptz not null default now()
);

create or replace view public.budget_actuals as
select
  b.id as budget_id,
  b.cost_center_id,
  b.category,
  b.period,
  b.budget_amount,
  coalesce((
    select sum(jle.amount)
    from public.job_ledger_entries jle
    where jle.cost_center_id = b.cost_center_id
      and jle.entry_type = 'expense'
      and (b.category is null or jle.category = b.category)
  ), 0) as actual_amount
from public.budgets b;

insert into public.expense_categories (company_id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Procurement'),
  ('00000000-0000-0000-0000-000000000001', 'Fuel'),
  ('00000000-0000-0000-0000-000000000001', 'Maintenance'),
  ('00000000-0000-0000-0000-000000000001', 'Transport'),
  ('00000000-0000-0000-0000-000000000001', 'General')
on conflict (company_id, name) do nothing;

-- ============================================================================
-- Banking & Payments (Ch.13.11, minimal — enough to pay a supplier invoice)
-- ============================================================================
create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  bank_name text not null,
  account_number text,
  currency_code text not null default 'GNF' references public.currencies(code),
  opening_balance numeric not null default 0,
  current_balance numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  supplier_invoice_id uuid not null references public.supplier_invoices(id),
  bank_account_id uuid references public.bank_accounts(id),
  amount numeric not null,
  currency_code text not null default 'GNF' references public.currencies(code),
  payment_date date not null default current_date,
  reference text,
  status text not null default 'completed', -- pending | completed | cancelled
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Seed approval rules for Finance (invoice approval, Ch.13.16-style)
-- ============================================================================
insert into public.approval_rules (company_id, module, entity_type, sequence, min_amount, max_amount, approver_role_id)
select '00000000-0000-0000-0000-000000000001', 'finance', 'supplier_invoice', 1, null, 10000000, r.id
from public.roles r where r.key = 'finance_officer' and r.company_id = '00000000-0000-0000-0000-000000000001'
on conflict do nothing;

insert into public.approval_rules (company_id, module, entity_type, sequence, min_amount, max_amount, approver_role_id)
select '00000000-0000-0000-0000-000000000001', 'finance', 'supplier_invoice', 1, 10000000, null, r.id
from public.roles r where r.key = 'executive' and r.company_id = '00000000-0000-0000-0000-000000000001'
on conflict do nothing;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.job_ledger_entries enable row level security;
alter table public.supplier_invoices enable row level security;
alter table public.expense_categories enable row level security;
alter table public.budgets enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.payments enable row level security;

create policy job_ledger_entries_select on public.job_ledger_entries for select to authenticated
  using (public.has_permission(auth.uid(), 'finance.view') or public.has_permission(auth.uid(), 'procurement.view'));
create policy job_ledger_entries_insert on public.job_ledger_entries for insert to authenticated
  with check (
    public.has_permission(auth.uid(), 'finance.manage')
    or public.has_permission(auth.uid(), 'procurement.approve')
    or public.has_permission(auth.uid(), 'transport.manage')
  );

create policy supplier_invoices_select on public.supplier_invoices for select to authenticated
  using (public.has_permission(auth.uid(), 'finance.view'));
create policy supplier_invoices_write on public.supplier_invoices for all to authenticated
  using (public.has_permission(auth.uid(), 'finance.manage') or public.has_permission(auth.uid(), 'finance.approve'))
  with check (public.has_permission(auth.uid(), 'finance.manage') or public.has_permission(auth.uid(), 'finance.approve'));

create policy expense_categories_select on public.expense_categories for select to authenticated using (true);
create policy budgets_select on public.budgets for select to authenticated
  using (public.has_permission(auth.uid(), 'finance.view'));
create policy budgets_write on public.budgets for all to authenticated
  using (public.has_permission(auth.uid(), 'finance.manage'))
  with check (public.has_permission(auth.uid(), 'finance.manage'));

create policy bank_accounts_select on public.bank_accounts for select to authenticated
  using (public.has_permission(auth.uid(), 'finance.view'));
create policy bank_accounts_write on public.bank_accounts for all to authenticated
  using (public.has_permission(auth.uid(), 'finance.manage'))
  with check (public.has_permission(auth.uid(), 'finance.manage'));

create policy payments_select on public.payments for select to authenticated
  using (public.has_permission(auth.uid(), 'finance.view'));
create policy payments_write on public.payments for all to authenticated
  using (public.has_permission(auth.uid(), 'finance.manage'))
  with check (public.has_permission(auth.uid(), 'finance.manage'));
