-- Base application schema — reconstruction of the ORIGINAL pre-Phase-1
-- tables (Expression of Need / procurement-intake app) that this project
-- was built around before any ERP work began.
--
-- IMPORTANT CONTEXT: these tables were never created by a checked-in
-- migration — they were provisioned directly against a different Supabase
-- project that the team no longer has access to (see the deployment doc).
-- This file reconstructs them from the last known TypeScript types
-- (src/integrations/supabase/types.ts, as captured before any Phase 1
-- changes), which accurately reflects column names/types/relationships,
-- but a few things are best-effort reconstructions rather than a guaranteed
-- match to the original database, specifically:
--   - Exact default values where the original only showed "optional in
--     Insert" (implying *some* default existed, but not which one).
--   - Row Level Security policies (never visible via generated types).
--     Reconstructed here as permissive-for-authenticated-users, matching
--     the app's own client code, which never filters queries by owner
--     (e.g. ExpressionSubmissions.tsx does a plain `select('*')`).
--   - The body of validate_workflow_transition() — never seen called from
--     any app code, so reconstructed to do the obviously-intended check
--     (does an allowed transition row exist for the current stage/status
--     and requesting role) rather than copied from a real source.
--   - handle_new_user(): the app's Auth page uses Supabase's stock
--     <Auth /> UI component with no client-side profile-creation call, so a
--     trigger populating `profiles` on signup must have existed; this is
--     the standard Supabase pattern, reconstructed accordingly.
--
-- This must run BEFORE 20260724120000_foundational_erp_schema.sql, which
-- ALTERs these tables.

create type public.workflow_stage_enum as enum ('demande', 'en_attente', 'approbation', 'paiement', 'livraison', 'termine');
create type public.workflow_status_enum as enum ('pending', 'approved', 'rejected', 'in_progress', 'completed');

create table public.item_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table public.item_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  business_unit text,
  location text,
  role text not null default 'user',
  updated_at timestamptz default now()
);

create table public.expressions_of_need (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  part_name text not null,
  part_reference text,
  item_type text not null,
  category_id uuid references public.item_categories(id),
  quantity integer not null default 1,
  department text not null,
  business_unit text not null,
  location text not null,
  priority text not null,
  description text,
  supplier text,
  additional_comments text,
  attachment_url text,
  status text default 'pending',
  status_progress integer default 0,
  workflow_stage text not null default 'demande',
  workflow_status text not null default 'pending',
  current_department text not null default 'initiator',
  next_allowed_statuses text[],
  transition_allowed_roles text[],
  requires_comment boolean default false,
  approval_status text not null default 'pending',
  approval_comments text,
  approval_date timestamptz,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  finance_approval_status text,
  payment_status text,
  payment_details jsonb,
  logistics_status text,
  delivery_status text,
  delivery_date date,
  reception_status text,
  view_count integer default 0,
  last_modified_by uuid references auth.users(id),
  last_modified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.expression_attachments (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid references public.expressions_of_need(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text not null,
  file_size integer not null,
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamptz default now()
);

create table public.approval_history (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid references public.expressions_of_need(id) on delete cascade,
  status text not null,
  comment text,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create table public.workflow_history (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid references public.expressions_of_need(id) on delete cascade,
  previous_stage text not null,
  new_stage text not null,
  previous_status text not null,
  new_status text not null,
  previous_department text not null,
  new_department text not null,
  modified_by uuid references auth.users(id),
  comments text,
  created_at timestamptz default now()
);

create table public.workflow_transitions (
  id uuid primary key default gen_random_uuid(),
  current_stage public.workflow_stage_enum not null,
  current_status public.workflow_status_enum not null,
  next_stage public.workflow_stage_enum not null,
  next_status public.workflow_status_enum not null,
  allowed_roles text[] not null,
  requires_comment boolean default false,
  created_at timestamptz default now()
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  expression_id uuid references public.expressions_of_need(id) on delete cascade,
  user_id uuid references auth.users(id),
  type text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table public.submission_audit_logs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.expressions_of_need(id) on delete cascade,
  field_name text not null,
  old_value text,
  new_value text,
  modified_by uuid not null references auth.users(id),
  created_at timestamptz default now()
);

-- Best-effort reconstruction: validates a requested stage/status transition
-- against the workflow_transitions table for the requesting role. Not
-- currently called from any app code (the frontend enforces transitions
-- client-side in WorkflowSection.tsx), but declared here since the original
-- generated types included it as a callable RPC.
create or replace function public.validate_workflow_transition(
  p_expression_id uuid,
  p_new_stage public.workflow_stage_enum,
  p_new_status public.workflow_status_enum,
  p_user_role text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_stage text;
  v_current_status text;
  v_allowed boolean;
begin
  select workflow_stage, workflow_status into v_current_stage, v_current_status
  from public.expressions_of_need where id = p_expression_id;

  select exists (
    select 1 from public.workflow_transitions
    where current_stage::text = v_current_stage
      and current_status::text = v_current_status
      and next_stage = p_new_stage
      and next_status = p_new_status
      and p_user_role = any(allowed_roles)
  ) into v_allowed;

  return coalesce(v_allowed, false);
end;
$$;

-- Standard Supabase pattern: auto-create a profile row when a new user
-- signs up via the Auth UI (the app itself never inserts into profiles).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket used by AdditionalInfoSection.tsx for PR attachments.
insert into storage.buckets (id, name, public)
values ('expressions-attachments', 'expressions-attachments', true)
on conflict (id) do nothing;

create policy "expressions_attachments_select" on storage.objects for select to authenticated
  using (bucket_id = 'expressions-attachments');
create policy "expressions_attachments_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'expressions-attachments');

-- Seed data the app's dropdowns depend on to be usable at all
-- (PartDetailsSection.tsx queries item_types for the "Type d'Article" select).
insert into public.item_types (name, description) values
  ('pieces_detachees', 'Pièces Détachées'),
  ('consommables', 'Consommables'),
  ('equipement', 'Équipement'),
  ('fournitures_bureau', 'Fournitures de Bureau'),
  ('services', 'Services'),
  ('autre', 'Autre');

insert into public.item_categories (name, description) values
  ('mecanique', 'Mécanique'),
  ('electrique', 'Électrique'),
  ('informatique', 'Informatique'),
  ('general', 'Général');

-- ============================================================================
-- RLS — reconstructed as permissive-for-authenticated, matching the app's
-- own client code (no owner-based filtering exists anywhere in the
-- frontend queries against these tables).
-- ============================================================================
alter table public.item_categories enable row level security;
alter table public.item_types enable row level security;
alter table public.profiles enable row level security;
alter table public.expressions_of_need enable row level security;
alter table public.expression_attachments enable row level security;
alter table public.approval_history enable row level security;
alter table public.workflow_history enable row level security;
alter table public.workflow_transitions enable row level security;
alter table public.notification_logs enable row level security;
alter table public.submission_audit_logs enable row level security;

create policy item_categories_all on public.item_categories for all to authenticated using (true) with check (true);
create policy item_types_all on public.item_types for all to authenticated using (true) with check (true);

create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy expressions_of_need_all on public.expressions_of_need for all to authenticated using (true) with check (true);
create policy expression_attachments_all on public.expression_attachments for all to authenticated using (true) with check (true);
create policy approval_history_all on public.approval_history for all to authenticated using (true) with check (true);
create policy workflow_history_all on public.workflow_history for all to authenticated using (true) with check (true);
create policy workflow_transitions_select on public.workflow_transitions for select to authenticated using (true);
create policy notification_logs_all on public.notification_logs for all to authenticated using (true) with check (true);
create policy submission_audit_logs_all on public.submission_audit_logs for all to authenticated using (true) with check (true);
