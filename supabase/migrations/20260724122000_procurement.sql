-- Procurement (Phase 1, Step 2): multi-line Purchase Requests, RFQs,
-- Purchase Orders, Goods Receipts, and a PO/GRN reconciliation view.
--
-- expressions_of_need is the existing Purchase Request entity (kept as-is,
-- terminology unchanged). It was single-line-item per row; this migration
-- adds purchase_request_items as children and backfills one line item per
-- existing row from its current part_name/quantity/part_reference fields,
-- so the existing form/list/PDF keep working unchanged while new PRs
-- support multiple lines going forward.

alter table public.expressions_of_need
  add column if not exists supplier_id uuid references public.suppliers(id);

create table if not exists public.purchase_request_items (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid not null references public.expressions_of_need(id) on delete cascade,
  description text not null,
  category text,
  quantity numeric not null default 1,
  unit text,
  estimated_unit_price numeric,
  warehouse text,
  required_date date,
  created_at timestamptz not null default now()
);
create index if not exists purchase_request_items_expression_idx on public.purchase_request_items (expression_id);

insert into public.purchase_request_items (expression_id, description, category, quantity, required_date)
select e.id, e.part_name, e.item_type, e.quantity, e.delivery_date::date
from public.expressions_of_need e
where not exists (
  select 1 from public.purchase_request_items pri where pri.expression_id = e.id
);

-- Keep new PRs symmetric with the backfill above: every expressions_of_need
-- insert automatically gets a mirrored line item from its single-item
-- fields, so the existing single-item form keeps working unchanged. The new
-- multi-line UI adds further purchase_request_items rows on top of this one.
create or replace function public.sync_primary_purchase_request_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.purchase_request_items (expression_id, description, category, quantity, required_date)
  values (new.id, new.part_name, new.item_type, new.quantity, new.delivery_date::date);
  return new;
end;
$$;

create trigger expressions_of_need_sync_primary_item after insert on public.expressions_of_need
  for each row execute function public.sync_primary_purchase_request_item();

-- ============================================================================
-- Request for Quotation (Ch.14.8-14.10)
-- ============================================================================
create sequence if not exists public.rfq_number_seq start 1;

create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  rfq_number text unique,
  expression_id uuid references public.expressions_of_need(id),
  title text not null,
  status text not null default 'draft', -- draft | sent | closed | awarded
  technical_specifications text,
  evaluation_criteria text,
  submission_deadline date,
  closing_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.generate_rfq_number()
returns trigger
language plpgsql
as $$
begin
  if new.rfq_number is null then
    new.rfq_number := 'RFQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.rfq_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger rfqs_set_number before insert on public.rfqs
  for each row execute function public.generate_rfq_number();
create trigger rfqs_set_updated_at before update on public.rfqs
  for each row execute function public.set_updated_at();

create table if not exists public.rfq_suppliers (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id),
  status text not null default 'invited', -- invited | responded | declined
  invited_at timestamptz not null default now(),
  unique (rfq_id, supplier_id)
);

create table if not exists public.rfq_responses (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id),
  quoted_price numeric,
  currency_code text references public.currencies(code),
  delivery_time_days int,
  notes text,
  is_selected boolean not null default false,
  submitted_at timestamptz not null default now(),
  unique (rfq_id, supplier_id)
);

-- ============================================================================
-- Purchase Order (Ch.14.11)
-- ============================================================================
create sequence if not exists public.purchase_order_number_seq start 1;

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  po_number text unique,
  supplier_id uuid not null references public.suppliers(id),
  expression_id uuid references public.expressions_of_need(id),
  rfq_id uuid references public.rfqs(id),
  cost_center_id uuid references public.cost_centers(id),
  status text not null default 'draft', -- draft | issued | accepted | partially_delivered | delivered | cancelled | closed
  currency_code text not null default 'GNF' references public.currencies(code),
  payment_terms text,
  delivery_address text,
  expected_delivery date,
  notes text,
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.generate_po_number()
returns trigger
language plpgsql
as $$
begin
  if new.po_number is null then
    new.po_number := 'PO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.purchase_order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger purchase_orders_set_number before insert on public.purchase_orders
  for each row execute function public.generate_po_number();
create trigger purchase_orders_set_updated_at before update on public.purchase_orders
  for each row execute function public.set_updated_at();
create trigger purchase_orders_audit after insert or update on public.purchase_orders
  for each row execute function public.log_audit_change();

create table if not exists public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  purchase_request_item_id uuid references public.purchase_request_items(id),
  description text not null,
  quantity numeric not null default 1,
  unit text,
  unit_price numeric not null default 0,
  tax_rate numeric not null default 0,
  line_total numeric generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);
create index if not exists purchase_order_items_po_idx on public.purchase_order_items (purchase_order_id);

-- ============================================================================
-- Goods Receipt (Ch.14.12)
-- ============================================================================
create sequence if not exists public.grn_number_seq start 1;

create table if not exists public.goods_receipts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  grn_number text unique,
  purchase_order_id uuid not null references public.purchase_orders(id),
  status text not null default 'pending', -- pending | completed | discrepancy
  notes text,
  received_by uuid references auth.users(id),
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create or replace function public.generate_grn_number()
returns trigger
language plpgsql
as $$
begin
  if new.grn_number is null then
    new.grn_number := 'GRN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.grn_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger goods_receipts_set_number before insert on public.goods_receipts
  for each row execute function public.generate_grn_number();

create table if not exists public.goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  goods_receipt_id uuid not null references public.goods_receipts(id) on delete cascade,
  purchase_order_item_id uuid not null references public.purchase_order_items(id),
  quantity_received numeric not null,
  condition text not null default 'good', -- good | damaged
  notes text
);

-- Ordered vs received reconciliation per PO line. This is the "two-way" half
-- of Ch.14.13's three-way match; the third leg (supplier invoice lines) is
-- added in the Finance/Step 3 migration once supplier_invoices exists.
create or replace view public.po_receipt_status as
select
  poi.id as purchase_order_item_id,
  poi.purchase_order_id,
  poi.description,
  poi.quantity as quantity_ordered,
  coalesce(sum(gri.quantity_received), 0) as quantity_received,
  poi.quantity - coalesce(sum(gri.quantity_received), 0) as quantity_outstanding
from public.purchase_order_items poi
left join public.goods_receipt_items gri on gri.purchase_order_item_id = poi.id
group by poi.id, poi.purchase_order_id, poi.description, poi.quantity;

-- ============================================================================
-- Seed approval rules for Procurement (Ch.14.6-style thresholds, using the
-- roles seeded in the foundational migration)
-- ============================================================================
insert into public.approval_rules (company_id, module, entity_type, sequence, min_amount, max_amount, approver_role_id)
select '00000000-0000-0000-0000-000000000001', 'procurement', 'purchase_order', 1, null, 20000000, r.id
from public.roles r where r.key = 'operations_manager' and r.company_id = '00000000-0000-0000-0000-000000000001'
on conflict do nothing;

insert into public.approval_rules (company_id, module, entity_type, sequence, min_amount, max_amount, approver_role_id)
select '00000000-0000-0000-0000-000000000001', 'procurement', 'purchase_order', 1, 20000000, null, r.id
from public.roles r where r.key = 'executive' and r.company_id = '00000000-0000-0000-0000-000000000001'
on conflict do nothing;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.purchase_request_items enable row level security;
alter table public.rfqs enable row level security;
alter table public.rfq_suppliers enable row level security;
alter table public.rfq_responses enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;
alter table public.goods_receipts enable row level security;
alter table public.goods_receipt_items enable row level security;

create policy purchase_request_items_select on public.purchase_request_items for select to authenticated using (true);
create policy purchase_request_items_write on public.purchase_request_items for all to authenticated using (true) with check (true);

create policy rfqs_select on public.rfqs for select to authenticated
  using (public.has_permission(auth.uid(), 'procurement.view'));
create policy rfqs_write on public.rfqs for all to authenticated
  using (public.has_permission(auth.uid(), 'procurement.manage'))
  with check (public.has_permission(auth.uid(), 'procurement.manage'));

create policy rfq_suppliers_select on public.rfq_suppliers for select to authenticated
  using (public.has_permission(auth.uid(), 'procurement.view'));
create policy rfq_suppliers_write on public.rfq_suppliers for all to authenticated
  using (public.has_permission(auth.uid(), 'procurement.manage'))
  with check (public.has_permission(auth.uid(), 'procurement.manage'));

create policy rfq_responses_select on public.rfq_responses for select to authenticated
  using (public.has_permission(auth.uid(), 'procurement.view'));
create policy rfq_responses_write on public.rfq_responses for all to authenticated
  using (public.has_permission(auth.uid(), 'procurement.manage'))
  with check (public.has_permission(auth.uid(), 'procurement.manage'));

create policy purchase_orders_select on public.purchase_orders for select to authenticated
  using (public.has_permission(auth.uid(), 'procurement.view'));
create policy purchase_orders_write on public.purchase_orders for all to authenticated
  using (public.has_permission(auth.uid(), 'procurement.manage') or public.has_permission(auth.uid(), 'procurement.approve'))
  with check (public.has_permission(auth.uid(), 'procurement.manage') or public.has_permission(auth.uid(), 'procurement.approve'));

create policy purchase_order_items_select on public.purchase_order_items for select to authenticated
  using (public.has_permission(auth.uid(), 'procurement.view'));
create policy purchase_order_items_write on public.purchase_order_items for all to authenticated
  using (public.has_permission(auth.uid(), 'procurement.manage'))
  with check (public.has_permission(auth.uid(), 'procurement.manage'));

create policy goods_receipts_select on public.goods_receipts for select to authenticated
  using (public.has_permission(auth.uid(), 'procurement.view'));
create policy goods_receipts_write on public.goods_receipts for all to authenticated
  using (public.has_permission(auth.uid(), 'procurement.manage'))
  with check (public.has_permission(auth.uid(), 'procurement.manage'));

create policy goods_receipt_items_select on public.goods_receipt_items for select to authenticated
  using (public.has_permission(auth.uid(), 'procurement.view'));
create policy goods_receipt_items_write on public.goods_receipt_items for all to authenticated
  using (public.has_permission(auth.uid(), 'procurement.manage'))
  with check (public.has_permission(auth.uid(), 'procurement.manage'));
