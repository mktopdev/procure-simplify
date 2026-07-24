-- Supplier Management (Phase 1, Step 1)

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  name text not null,
  trading_name text,
  category text, -- e.g. 'shipping_line', 'trucking', 'fuel', 'equipment', 'customs_broker', 'general'
  tax_number text,
  status text not null default 'active', -- active | inactive | blocked | blacklisted
  risk_rating text not null default 'low', -- low | medium | high | critical (manual for now; AI scoring is a later phase)
  email text,
  phone text,
  address text,
  city text,
  country text,
  payment_terms text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_contacts (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  name text not null,
  job_title text,
  email text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.supplier_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  bank_name text not null,
  account_number text,
  iban text,
  currency_code text references public.currencies(code),
  created_at timestamptz not null default now()
);

create trigger suppliers_set_updated_at before update on public.suppliers
  for each row execute function public.set_updated_at();

create trigger suppliers_audit after insert or update on public.suppliers
  for each row execute function public.log_audit_change();

alter table public.suppliers enable row level security;
alter table public.supplier_contacts enable row level security;
alter table public.supplier_bank_accounts enable row level security;

create policy suppliers_select on public.suppliers for select to authenticated
  using (public.has_permission(auth.uid(), 'suppliers.view'));
create policy suppliers_write on public.suppliers for all to authenticated
  using (public.has_permission(auth.uid(), 'suppliers.manage'))
  with check (public.has_permission(auth.uid(), 'suppliers.manage'));

create policy supplier_contacts_select on public.supplier_contacts for select to authenticated
  using (public.has_permission(auth.uid(), 'suppliers.view'));
create policy supplier_contacts_write on public.supplier_contacts for all to authenticated
  using (public.has_permission(auth.uid(), 'suppliers.manage'))
  with check (public.has_permission(auth.uid(), 'suppliers.manage'));

create policy supplier_bank_accounts_select on public.supplier_bank_accounts for select to authenticated
  using (public.has_permission(auth.uid(), 'suppliers.view'));
create policy supplier_bank_accounts_write on public.supplier_bank_accounts for all to authenticated
  using (public.has_permission(auth.uid(), 'suppliers.manage'))
  with check (public.has_permission(auth.uid(), 'suppliers.manage'));
