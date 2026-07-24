-- Transportation Management (Phase 1, Step 4)
-- Minimal Fleet stub (vehicles/drivers) plus Transport Orders, Trips, and
-- Trip Expenses feeding the job ledger. Full Fleet/EAM (Ch.11) and live GPS
-- provider integration are later phases; vehicles/drivers here carry just
-- enough fields to assign and run a trip, and location fields exist on the
-- vehicle so a GPS integration can populate them later without a schema
-- change.

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  plate_number text not null,
  vehicle_type text, -- e.g. 'truck', 'trailer', 'flatbed'
  capacity_tons numeric,
  status text not null default 'available', -- available | assigned | maintenance | out_of_service
  current_lat numeric,
  current_lng numeric,
  location_updated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (company_id, plate_number)
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id),
  name text not null,
  phone text,
  license_number text,
  license_expiry date,
  status text not null default 'available', -- available | driving | off_duty | suspended
  created_at timestamptz not null default now()
);

create sequence if not exists public.transport_order_number_seq start 1;

create table if not exists public.transport_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.companies(id) on delete cascade,
  order_number text unique,
  customer_id uuid references public.customers(id),
  purchase_order_id uuid references public.purchase_orders(id), -- set when transport is subcontracted (Ch.11.1/14.18)
  pickup_location text,
  delivery_address text,
  cargo_description text,
  weight numeric,
  priority text not null default 'normal', -- normal | high | urgent | critical
  status text not null default 'awaiting_assignment', -- draft | awaiting_assignment | assigned | in_transit | delivered | completed | cancelled
  target_delivery_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.generate_transport_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'TO-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.transport_order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger transport_orders_set_number before insert on public.transport_orders
  for each row execute function public.generate_transport_order_number();
create trigger transport_orders_set_updated_at before update on public.transport_orders
  for each row execute function public.set_updated_at();
create trigger transport_orders_audit after insert or update on public.transport_orders
  for each row execute function public.log_audit_change();

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  transport_order_id uuid not null references public.transport_orders(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id),
  driver_id uuid not null references public.drivers(id),
  status text not null default 'assigned', -- assigned | loading | in_transit | delivered | completed | cancelled
  started_at timestamptz,
  delivered_at timestamptz,
  pod_notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists trips_transport_order_idx on public.trips (transport_order_id);

create table if not exists public.trip_expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  category text not null, -- fuel | toll | driver_allowance | repairs | other
  amount numeric not null,
  currency_code text not null default 'GNF' references public.currencies(code),
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.vehicles enable row level security;
alter table public.drivers enable row level security;
alter table public.transport_orders enable row level security;
alter table public.trips enable row level security;
alter table public.trip_expenses enable row level security;

create policy vehicles_select on public.vehicles for select to authenticated
  using (public.has_permission(auth.uid(), 'transport.view'));
create policy vehicles_write on public.vehicles for all to authenticated
  using (public.has_permission(auth.uid(), 'transport.manage'))
  with check (public.has_permission(auth.uid(), 'transport.manage'));

create policy drivers_select on public.drivers for select to authenticated
  using (public.has_permission(auth.uid(), 'transport.view'));
create policy drivers_write on public.drivers for all to authenticated
  using (public.has_permission(auth.uid(), 'transport.manage'))
  with check (public.has_permission(auth.uid(), 'transport.manage'));

create policy transport_orders_select on public.transport_orders for select to authenticated
  using (public.has_permission(auth.uid(), 'transport.view'));
create policy transport_orders_write on public.transport_orders for all to authenticated
  using (public.has_permission(auth.uid(), 'transport.manage'))
  with check (public.has_permission(auth.uid(), 'transport.manage'));

create policy trips_select on public.trips for select to authenticated
  using (public.has_permission(auth.uid(), 'transport.view'));
create policy trips_write on public.trips for all to authenticated
  using (public.has_permission(auth.uid(), 'transport.manage'))
  with check (public.has_permission(auth.uid(), 'transport.manage'));

create policy trip_expenses_select on public.trip_expenses for select to authenticated
  using (public.has_permission(auth.uid(), 'transport.view'));
create policy trip_expenses_write on public.trip_expenses for all to authenticated
  using (public.has_permission(auth.uid(), 'transport.manage'))
  with check (public.has_permission(auth.uid(), 'transport.manage'));
