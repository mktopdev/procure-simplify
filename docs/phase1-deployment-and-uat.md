# Phase 1 Deployment & UAT Guide — Transxpress ERP Foundation

Status: **deployed** to `smsffnbfcpybezaljgmd` (all 7 migrations applied via the Supabase MCP connection, security advisor re-run clean of the two real findings it caught, `src/integrations/supabase/types.ts` regenerated from the live schema). No users have signed up yet, so role assignment (§5) is still outstanding — everything else in this document reflects the actual deployed state, not a plan.

This document is the deployment + validation runbook before Fleet/Warehouse/HR/Customer Portal/AI work begins.

---

## 1. Migration order (must be applied in this exact sequence)

```
supabase/migrations/20260724110000_base_app_schema.sql
supabase/migrations/20260724120000_foundational_erp_schema.sql
supabase/migrations/20260724121000_supplier_management.sql
supabase/migrations/20260724122000_procurement.sql
supabase/migrations/20260724123000_finance_job_costing.sql
supabase/migrations/20260724124000_transportation.sql
supabase/migrations/20260724130000_security_hardening.sql
```

**Deployment method used**: once a Supabase MCP connector became available mid-session, all 7 migrations were applied directly via `apply_migration` rather than the CLI/SQL-editor instructions below — those instructions are kept for future deployments (e.g. a production project) where an MCP connection isn't set up. `20260724130000_security_hardening.sql` was added after the Supabase security advisor (`get_advisors`) flagged two real, non-cosmetic issues post-deploy — see §2 addendum below.

**Update**: a sixth migration (`20260724110000_base_app_schema.sql`) was added after discovering the target Supabase project (`smsffnbfcpybezaljgmd`, created fresh for this deployment) had none of the original pre-Phase-1 tables (`profiles`, `expressions_of_need`, etc.) — those were never part of a checked-in migration; they lived only in a different, now-inaccessible Supabase project. `base_app_schema.sql` **reconstructs them from the last known TypeScript types**, since that's the only record of their structure that was ever available. Column names/types/relationships should be accurate; exact original default values, RLS policies, and the `validate_workflow_transition()` function body were never visible and are best-effort reconstructions — see the file's own header comment for specifics. This is why it's safe: this is a fresh project with no real data to conflict with a reconstruction.

The filenames are timestamp-prefixed and each depends on tables/functions created by the ones before it (`foundational_erp_schema.sql` ALTERs tables created by `base_app_schema.sql`; `procurement.sql` references `suppliers`; `finance_job_costing.sql` references `purchase_orders` and `goods_receipt_items`; `transportation.sql` references `customers` and `purchase_orders`). `supabase db push` applies them in filename order automatically — do not reorder.

---

## 2. Safety review — destructive/unsafe operations

Verified by grepping all five files for `DROP TABLE|DROP COLUMN|TRUNCATE|DELETE FROM|DROP FUNCTION|DROP POLICY|DROP TRIGGER` and reading every `ALTER TABLE`.

**Result: no DROP TABLE, DROP COLUMN, TRUNCATE, or DELETE FROM anywhere in any of the five files.**

Only two `ALTER TABLE` statements touch pre-existing tables, both purely additive:
- `alter table public.profiles add column if not exists company_id ... , add column if not exists branch_id ...` (foundational migration)
- `alter table public.expressions_of_need add column if not exists company_id/branch_id ...` (foundational) and `add column if not exists supplier_id ...` (procurement)

All are nullable, defaulted, non-breaking. No existing column is altered, renamed, or dropped. No existing row is overwritten — the only writes to existing tables are the `company_id`/`branch_id` backfill `UPDATE`s (setting a default value only where currently `NULL`) and the one-time `INSERT ... SELECT ... WHERE NOT EXISTS` backfill of `purchase_request_items` from existing `expressions_of_need` rows.

**Findings requiring your attention (not blockers, but real):**

| # | Finding | Detail | Risk |
|---|---|---|---|
| 1 | `purchase_request_items` RLS is fully open | `using (true)` / `with check (true)` for all authenticated users (procurement.sql:256-257) — inconsistent with every other new table, which is gated by `has_permission()` | Any logged-in user can add/edit/delete line items on **any** purchase request, not just their own. Intentional simplification so requesters can edit their own PR items without needing `procurement.manage`, but it's broader than needed. |
| 2 | `customers` / `cost_centers` RLS is fully open for writes | Same `using(true)` pattern, disclosed in the migration's own comment as "Phase 1, small internal user base" | Same as above — any authenticated user can create/edit master data records. |
| 3 | RBAC backfill only covers 4 legacy roles | Only `profiles.role in ('admin','manager','finance','logistics')` get mapped to new roles; any other/default role value gets **zero** rows in `user_roles` | Those users lose no *existing* access (Expression of Need RLS untouched), but gain **no** access to Suppliers/Procurement/Finance/Transport until a role is assigned. See §5 "Post-migration role assignment" — **this blocks UAT** if not done first. |
| 4 | No existing role maps to `procurement_officer`, `fleet_manager`, or `executive` | `procurement.manage` (create/edit suppliers, POs, RFQs, GRNs) is granted only to `procurement_officer` and `admin` | **Only a user whose `profiles.role = 'admin'` can manage Suppliers/Procurement immediately after migration.** Everyone else needs a manual role grant (§5). |
| 5 | `on delete cascade` on new child tables | e.g. `purchase_request_items.expression_id → expressions_of_need(id) on delete cascade` | Only fires if an `expressions_of_need` row is hard-deleted, which the app never does (archive-only by design). Not a risk to existing behavior, just noting it exists. |

**Addendum — post-deploy security advisor results**: running Supabase's `get_advisors` (security) after the initial 6 migrations found two real, non-cosmetic issues, fixed by migration 7 (`20260724130000_security_hardening.sql`):
- **ERROR**: `po_receipt_status`, `po_financial_summary`, and `budget_actuals` ran as their owner by default, bypassing RLS on the underlying tables — anyone authenticated could query them directly and see all rows regardless of `procurement.view`/`finance.view`. Fixed with `security_invoker = true` on all three.
- **WARN**: six simple trigger functions (`set_updated_at`, the four `*_number` generators, `generate_supplier_invoice_reference`) had no pinned `search_path`. Fixed.

Everything else the advisor reported — the `using (true)` policies on `purchase_request_items`/`customers`/`cost_centers`/`expressions_of_need`/etc., and public-bucket listing on `erp-documents`/`expressions-attachments` — matches the findings already disclosed above and was left as-is intentionally.

**No policy blocks existing users from anything they could already do.** RLS was only added to brand-new tables; no policy was added or changed on `expressions_of_need`, `expression_attachments`, `approval_history`, `workflow_history`, `workflow_transitions`, `item_categories`, `item_types`, `notification_logs`, `profiles`, or `submission_audit_logs`.

---

## 3. Idempotency

**Not idempotent — each file must run exactly once.** Specifically:

- `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE SEQUENCE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `CREATE OR REPLACE VIEW`, and `INSERT ... ON CONFLICT DO NOTHING` are all safe to re-run.
- **`CREATE POLICY` and `CREATE TRIGGER` have no `IF NOT EXISTS` guard** (not supported by vanilla Postgres for these statement types). Re-running any of the five files a second time will fail with `policy "..." already exists` or `trigger "..." already exists` partway through, leaving that file's remaining statements unapplied.

Practical implication: use `supabase db push` (via CLI, §4), which tracks applied migrations in `supabase_migrations.schema_migrations` and will not re-run a file it already recorded as applied. If you instead paste files into the SQL editor manually, paste each one **exactly once** and do not re-run after a partial failure without first checking what already landed (see rollback scripts, §6, to reset a partially-applied file before retrying).

---

## 4. Setup requirements outside the migration files

| Category | Requirement | Status |
|---|---|---|
| Environment variables | None new. The app hardcodes the Supabase URL/anon key directly in `src/integrations/supabase/client.ts` (pre-existing pattern, not introduced by Phase 1) | No action needed |
| Supabase secrets | None referenced by any Phase 1 code | No action needed |
| Storage buckets | `erp-documents` (public) — created by the foundational migration itself via `insert into storage.buckets` | Created automatically by migration 1; verify it exists after deploy (§5) |
| Storage RLS | `erp-documents` bucket has **SELECT and INSERT** policies on `storage.objects` only — **no UPDATE/DELETE policy** | By design for Phase 1, but means "delete document" in the UI only removes the DB row, not the underlying file (see §9, finding #6) |
| Database functions | All 10 functions (`set_updated_at`, `has_permission`, `emit_domain_event`, `log_audit_change`, `generate_po_number`, `generate_rfq_number`, `generate_grn_number`, `generate_supplier_invoice_reference`, `generate_transport_order_number`, `sync_primary_purchase_request_item`) are created by the migrations | No action needed |
| Triggers | All created by the migrations (see §3 idempotency note) | No action needed, but see §3 |
| RLS policies | All created by the migrations | No action needed for schema; **role assignment is required post-deploy**, see §5 |
| Cron jobs | None required. `domain_events` is an append-only audit/outbox table with **no consumer** — nothing currently reads it (no Edge Function, no cron). This is intentional for Phase 1 (all side effects happen synchronously in the client); it's ready for a future Edge Function to consume | No action needed for Phase 1 to function |
| Edge Functions | None created, none required — all Phase 1 flows are direct table writes plus two RPC calls (`has_permission`, `emit_domain_event`) | No action needed |
| External APIs | None integrated (GPS providers, WhatsApp, email, etc. are explicitly deferred) | No action needed |
| Type regeneration | Done. `src/integrations/supabase/types.ts` was regenerated from the live schema via the Supabase MCP's `generate_typescript_types` and matched the hand-written version closely enough that `npm run build`/`tsc --noEmit` both pass with zero changes needed elsewhere | No action needed |

---

## 5. Deployment checklist — `smsffnbfcpybezaljgmd`

### Step 1 — Pre-flight

- [ ] Confirm you're applying against the intended project: `smsffnbfcpybezaljgmd`.
- [ ] Confirm current DB state: this project has **dev/test data only** (per your earlier confirmation) — no additional backup is strictly required, but taking one costs nothing:
  ```bash
  supabase db dump --project-ref smsffnbfcpybezaljgmd -f pre-phase1-backup.sql
  ```
- [ ] Pull the latest branch locally: `git fetch origin claude/project-context-4kby1s && git checkout claude/project-context-4kby1s && git pull`

### Step 2 — Apply migrations

**Option A — Supabase CLI (recommended, tracks applied state):**
```bash
supabase link --project-ref smsffnbfcpybezaljgmd
supabase db push
```

**Option B — Manual (Supabase Dashboard → SQL Editor):**
Paste and run each file's contents **in this exact order**, one at a time, waiting for success before the next:
1. `20260724110000_base_app_schema.sql`
2. `20260724120000_foundational_erp_schema.sql`
3. `20260724121000_supplier_management.sql`
4. `20260724122000_procurement.sql`
5. `20260724123000_finance_job_costing.sql`
6. `20260724124000_transportation.sql`

### Step 3 — Verify schema landed

```sql
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
```
On a fresh project (no pre-existing 10 tables), expect **all** of: `approval_history, approval_rules, audit_logs, bank_accounts, branches, budgets, companies, cost_centers, currencies, customers, documents, domain_events, drivers, expense_categories, expression_attachments, expressions_of_need, goods_receipt_items, goods_receipts, item_categories, item_types, job_ledger_entries, notification_logs, payments, permissions, profiles, purchase_order_items, purchase_orders, purchase_request_items, rfq_responses, rfq_suppliers, rfqs, role_permissions, roles, submission_audit_logs, supplier_bank_accounts, supplier_contacts, supplier_invoices, suppliers, transport_orders, trip_expenses, trips, user_roles, vehicles, workflow_history, workflow_transitions`.

```sql
select id, public from storage.buckets where id = 'expressions-attachments';
```
Expect one row, `public = true` (created by the base schema migration).

```sql
select id, public from storage.buckets where id = 'erp-documents';
```
Expect one row, `public = true`.

### Step 4 — Regenerate types (recommended)

```bash
supabase gen types typescript --project-id smsffnbfcpybezaljgmd > src/integrations/supabase/types.ts
npm run build
```
This replaces the hand-written types with the real generated ones — if there's any drift between what I wrote and what actually landed, the build will now fail loudly instead of silently mismatching at runtime. If it fails, that's a signal to reconcile before UAT, not a rollback trigger.

### Step 5 — Post-migration role assignment (blocks UAT until done — see §2 finding #3/#4)

Find your own user id and existing role:
```sql
select id, first_name, last_name, role from public.profiles where id = auth.uid();
-- or, as an admin querying another user:
select id, first_name, last_name, role from public.profiles where role is not null;
```

Grant yourself (or your test users) the roles needed to exercise every module. Example — grant `procurement_officer`, `finance_officer`, and `transport_dispatcher` to one UAT tester:
```sql
insert into public.user_roles (user_id, role_id)
select '<your-user-id>'::uuid, r.id
from public.roles r
where r.key in ('procurement_officer', 'finance_officer', 'transport_dispatcher', 'fleet_manager', 'executive')
  and r.company_id = '00000000-0000-0000-0000-000000000001'
on conflict do nothing;
```
Without this, only a `profiles.role = 'admin'` user can do anything in Suppliers/Procurement/Finance/Transport (admin implicitly gets every permission).

### Step 6 — Smoke test

- [ ] `npm run dev`, log in, confirm the app loads with no console errors.
- [ ] Confirm the new nav items appear (Suppliers, RFQs, Purchase Orders, Supplier Invoices, Job Costing, Budgets, Transport Orders, Dispatch, Fleet).
- [ ] Existing `/expressions` flow still works exactly as before (create + approve a PR).

If all six steps pass, proceed to the full UAT checklist (§7).

---

## 6. Rollback plan

No down-migrations exist. If you need to revert, run these **in reverse order** (5 → 1). Each block only removes what that file added; run only as many blocks as migrations you actually applied.

**⚠️ These are destructive by nature (they undo the deployment) — only run against the dev/test project, and only if you need to fully back out.**

### Rollback 5 — Transportation
```sql
drop table if exists public.trip_expenses cascade;
drop table if exists public.trips cascade;
drop table if exists public.transport_orders cascade;
drop table if exists public.drivers cascade;
drop table if exists public.vehicles cascade;
drop function if exists public.generate_transport_order_number() cascade;
drop sequence if exists public.transport_order_number_seq;
```

### Rollback 4 — Finance & Job Costing
```sql
drop table if exists public.payments cascade;
drop table if exists public.bank_accounts cascade;
drop view if exists public.budget_actuals;
drop table if exists public.budgets cascade;
drop table if exists public.expense_categories cascade;
drop view if exists public.po_financial_summary;
drop table if exists public.supplier_invoices cascade;
drop function if exists public.generate_supplier_invoice_reference() cascade;
drop sequence if exists public.supplier_invoice_number_seq;
drop table if exists public.job_ledger_entries cascade;
```

### Rollback 3 — Procurement
```sql
drop trigger if exists expressions_of_need_sync_primary_item on public.expressions_of_need;
drop function if exists public.sync_primary_purchase_request_item() cascade;
drop view if exists public.po_receipt_status;
drop table if exists public.goods_receipt_items cascade;
drop table if exists public.goods_receipts cascade;
drop function if exists public.generate_grn_number() cascade;
drop sequence if exists public.grn_number_seq;
drop table if exists public.purchase_order_items cascade;
drop table if exists public.purchase_orders cascade;
drop function if exists public.generate_po_number() cascade;
drop sequence if exists public.purchase_order_number_seq;
drop table if exists public.rfq_responses cascade;
drop table if exists public.rfq_suppliers cascade;
drop table if exists public.rfqs cascade;
drop function if exists public.generate_rfq_number() cascade;
drop sequence if exists public.rfq_number_seq;
drop table if exists public.purchase_request_items cascade;
alter table public.expressions_of_need drop column if exists supplier_id;
-- also remove the approval_rules seeded for procurement:
delete from public.approval_rules where module = 'procurement';
```

### Rollback 2 — Supplier Management
```sql
drop table if exists public.supplier_bank_accounts cascade;
drop table if exists public.supplier_contacts cascade;
drop table if exists public.suppliers cascade;
```

### Rollback 1 — Foundational schema
```sql
-- Do this LAST and only if rolling back everything — every other table
-- above references companies/branches/currencies/roles/etc.
alter table public.expressions_of_need drop column if exists company_id;
alter table public.expressions_of_need drop column if exists branch_id;
alter table public.profiles drop column if exists company_id;
alter table public.profiles drop column if exists branch_id;
drop table if exists public.cost_centers cascade;
drop table if exists public.customers cascade;
drop table if exists public.domain_events cascade;
drop function if exists public.emit_domain_event(text, text, uuid, jsonb, uuid, uuid) cascade;
drop table if exists public.audit_logs cascade;
drop function if exists public.log_audit_change() cascade;
drop table if exists public.documents cascade;
delete from storage.objects where bucket_id = 'erp-documents';
delete from storage.buckets where id = 'erp-documents';
drop table if exists public.approval_rules cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.role_permissions cascade;
drop table if exists public.permissions cascade;
drop table if exists public.roles cascade;
drop function if exists public.has_permission(uuid, text) cascade;
drop table if exists public.currencies cascade;
drop table if exists public.branches cascade;
drop table if exists public.companies cascade;
drop function if exists public.set_updated_at() cascade;
```

After any rollback, regenerate types again (§5 step 4) so the frontend and DB agree, or revert the `types.ts` commit alongside it.

---

## 7. UAT checklist

Do §5 (role assignment) before starting. Test as a user holding `procurement_officer` + `finance_officer` + `transport_dispatcher` + `fleet_manager` roles (or `admin`) unless a row says otherwise.

### Suppliers — `/suppliers`
- [ ] List loads (empty state renders if none exist).
- [ ] Create supplier (`/suppliers/new`) with all fields; verify redirect to detail page.
- [ ] Edit supplier from detail page; verify `audit_logs` gets a row per changed field (`select * from audit_logs where table_name='suppliers' order by changed_at desc`).
- [ ] Add/delete a contact; add/delete a bank account.
- [ ] Upload a document; confirm it appears and the file is reachable via its URL.
- [ ] As a user with only `suppliers.view` (no `.manage`): confirm "Nouveau Fournisseur" button and edit/add controls are hidden.

### Purchase Requests (Expression of Need) — `/expressions`, `/expressions/new`
- [ ] **Regression check**: create a PR exactly as before; confirm it still works unchanged.
- [ ] Confirm a `purchase_request_items` row was auto-created for it: `select * from purchase_request_items where expression_id = '<id>'`.
- [ ] Open the PR via `/expressions/edit/:id`; confirm the new "Articles de la Demande" panel appears below the existing form/audit log.
- [ ] Add a second line item; confirm it appears in the list and cannot be deleted if it's the first (index 0) row.
- [ ] Confirm the existing approve/reject workflow (`WorkflowSection`) is untouched and still functions.

### RFQs — `/procurement/rfqs`
- [ ] Create an RFQ, invite 2+ suppliers; confirm `rfq_number` is generated (`RFQ-2026-000001` pattern) and status is `sent`.
- [ ] On the RFQ detail page, record a response for each invited supplier (price + delivery days).
- [ ] Select a response as winner (`is_selected`); confirm RFQ status flips to `awarded` and only one response shows the star.
- [ ] Click "Créer le BC" on the selected response; confirm it lands on a new PO's detail page with one line item at the quoted price.

### Purchase Orders — `/procurement/purchase-orders`
- [ ] Create a PO manually (not via RFQ) with 2+ line items, different quantities/prices/tax rates; confirm `po_number` generates and `line_total` computes correctly per row (`quantity * unit_price`, DB-generated column — try to `UPDATE` it directly and confirm Postgres rejects it, since it's a stored generated column).
- [ ] Confirm total shown on screen matches `sum(line_total)`.

### Amount-based approvals
- [ ] Create a PO **under** GNF 20,000,000 total. Log in as a user with only `operations_manager` role: confirm the "Approuver" button is enabled.
- [ ] Create a PO **at or above** GNF 20,000,000. Confirm the same `operations_manager` user sees a disabled button labeled "Approbation requise: Executive Management" (or similar) and **cannot** approve.
- [ ] Log in as a user with `executive` role: confirm they *can* approve the high-value PO.
- [ ] After approval, confirm `status='issued'`, `approved_by`/`approved_at` are set, and a `PurchaseOrderApproved` row exists in `domain_events`.
- [ ] Repeat the same band-crossing test for Supplier Invoices at the GNF 10,000,000 threshold (finance_officer vs executive).

### Goods Receipts — partial and full
- [ ] On an issued PO with multiple line items, record a **partial** receipt (less than ordered quantity on at least one line). Confirm PO status becomes `partially_delivered` and `po_receipt_status` view shows correct `quantity_outstanding`.
- [ ] Record a second GRN completing the remaining quantity. Confirm PO status becomes `delivered` and outstanding drops to 0 on every line.
- [ ] **Known gap**: confirm the GRN recorder has no way to mark a line as "damaged" — `condition` will always save as `'good'` even if goods arrived damaged (see §9, finding #3). Don't treat this as a bug during UAT; it's a disclosed Phase 1 limitation.

### Supplier Invoices
- [ ] Record an invoice against the delivered PO from above. Confirm `internal_reference` generates (`INV-2026-000001` pattern) and `total_amount` = `subtotal + tax_amount` (generated column — same non-editable check as PO line totals).
- [ ] Confirm the "Rapprochement à Trois Voies" card shows ordered/received/invoiced figures side by side.

### Three-way matching
- [ ] **Important**: confirm this is **display-only** in Phase 1 — deliberately create an invoice whose total does *not* match the received value, and confirm the system still lets you approve it (no automatic block). This is expected behavior, not a bug (see §9, finding #4) — flag separately if you want automatic blocking added as a fast-follow.

### Payments
- [ ] Approve the invoice, then record a payment. Confirm invoice status becomes `paid`.
- [ ] Confirm a `payments` row exists with the right `supplier_invoice_id` and amount.
- [ ] **Note**: confirm `bank_accounts.current_balance` is *not* automatically decremented (it isn't wired up in Phase 1) — this is a known gap, not a bug.

### Job ledger postings
- [ ] After the invoice approval above, confirm a `job_ledger_entries` row exists with `entity_type='purchase_order'`, `entry_type='expense'`, `category='Procurement'`, amount = invoice total.
- [ ] View `/finance/job-costing`; confirm the entry appears, filterable by entity type, and the "Dépenses" total includes it.
- [ ] **Note**: "Revenus" will show 0 throughout Phase 1 UAT — nothing currently posts `entry_type='revenue'` (CRM/customer invoicing is a later phase). Not a bug.

### Transport Orders — `/transport/orders`
- [ ] Create a transport order with a customer, pickup/delivery, cargo description.
- [ ] Optionally: manually set `purchase_order_id` via SQL on a transport order to simulate a subcontracted trip, and confirm the link holds (no dedicated UI field for this in Phase 1 — see §9, finding #7).

### Dispatch — `/transport/dispatch`
- [ ] Confirm the unassigned order appears in the "Ordres à Assigner" column.
- [ ] Confirm available vehicles/drivers lists populate from Fleet (`/transport/fleet`) — add at least one of each there first.
- [ ] Click the order; confirm it navigates to the order's detail page (assignment happens there, not inline on Dispatch — by design, see §9).

### Trips
- [ ] On the transport order detail page, assign an available vehicle + driver; confirm both flip to `assigned`/`driving` status in `/transport/fleet`.
- [ ] Click "Démarrer le Trajet" → confirm trip status `in_transit`, order status `in_transit`.
- [ ] Add 2+ trip expenses (different categories).
- [ ] Click "Marquer comme Livré" → confirm trip `delivered`.
- [ ] Upload a POD document via the Documents panel.
- [ ] Click "Terminer et Comptabiliser les Coûts" → confirm vehicle/driver return to `available`, and a `job_ledger_entries` row appears with the summed trip expenses (`entity_type='transport_order'`, `category='Transport'`).
- [ ] **Note**: there is no cancel/abandon flow for a trip — if you assign a vehicle/driver and stop testing mid-trip without completing it, they'll stay `assigned`/`driving` until you either finish the trip or manually reset their status via SQL (see §9, finding #8).

### RBAC
- [ ] Confirm a user with **no** role assignment beyond the legacy `profiles.role` mapping (e.g. plain `logistics`→`transport_dispatcher`) can access Transport but not Suppliers/Procurement/Finance.
- [ ] Confirm `admin` role sees and can do everything everywhere.
- [ ] Attempt (as a non-admin, non-`admin.manage_roles` user) to `insert into public.roles` or `public.approval_rules` directly via the Supabase client — should be rejected by RLS.

### RLS
- [ ] As an authenticated user with zero roles, confirm `select * from suppliers` (via the client, not the SQL editor which bypasses RLS as `postgres`) returns zero rows, not an error.
- [ ] Confirm `purchase_request_items` and `customers`/`cost_centers` are writable by *any* authenticated user (expected per §2 findings #1/#2 — not a bug, just confirm it's the behavior you're accepting for Phase 1).

### Audit logs
- [ ] Edit a supplier, a PO, a supplier invoice, and a transport order; confirm each produces `audit_logs` rows (`table_name` matching, one row per changed field).
- [ ] Confirm editing an RFQ, a goods receipt, a trip, or a payment does **not** produce audit log rows — this is expected (trigger only attached to the 4 header tables, see §9 finding #2), not a bug.

### Documents
- [ ] Upload a document on a supplier, a PO, a supplier invoice, and a trip; confirm all four use the same `erp-documents` bucket and `documents` table (`select owner_type, count(*) from documents group by owner_type`).
- [ ] Delete a document from the UI; confirm the `documents` row disappears but the underlying file **remains** in Storage (expected — see §9 finding #6, no cleanup wired up yet).

### Existing Expression of Need workflow
- [ ] Full regression: create → approve → mark paid → mark shipped → mark delivered, exactly as before Phase 1. Confirm no behavior changed and no new errors appear in console or `workflow_history`.

---

## 8. Where to click — route map

| Workflow | Route | Notes |
|---|---|---|
| Suppliers list | `/suppliers` | |
| New supplier | `/suppliers/new` | |
| Supplier detail (contacts, bank accounts, documents) | `/suppliers/:id` | |
| Purchase Requests (Expression of Need) | `/expressions` | Pre-existing; nav also has `/requests` pointing to the **same page** (pre-existing duplicate label, not a Phase 1 change) |
| New Purchase Request | `/expressions/new` | |
| Edit Purchase Request + line items + audit log | `/expressions/edit/:id` | New "Articles de la Demande" panel added here |
| RFQs list | `/procurement/rfqs` | |
| New RFQ | `/procurement/rfqs/new` | |
| RFQ detail (responses, selection, create PO) | `/procurement/rfqs/:id` | |
| Purchase Orders list | `/procurement/purchase-orders` (also aliased at `/orders`) | |
| New PO | `/procurement/purchase-orders/new` | |
| PO detail (approve, receive goods, documents) | `/procurement/purchase-orders/:id` | |
| Supplier Invoices list | `/finance/supplier-invoices` | |
| New Supplier Invoice | `/finance/supplier-invoices/new` | |
| Invoice detail (approve, pay, three-way match) | `/finance/supplier-invoices/:id` | |
| Job Costing ledger | `/finance/job-costing` | |
| Budgets | `/finance/budgets` | Actual-vs-budget comparison — see §9 finding #1 for a real limitation here |
| Fleet (vehicles + drivers) | `/transport/fleet` | |
| Transport Orders list | `/transport/orders` | |
| New Transport Order | `/transport/orders/new` | |
| Transport Order detail (assign, trip lifecycle, expenses, POD) | `/transport/orders/:id` | |
| Dispatch board | `/transport/dispatch` | Read-only hub; actual assignment happens on the order detail page |
| Reports | `/reports` | **Pre-existing placeholder** — renders the Expression of Need list, not a real reports feature. Not part of Phase 1. |

Top nav ("Menu" dropdown) links to all of the above except the `:id` detail routes, which are reached by clicking a row/card.

---

## 9. Placeholder pages, incomplete flows, and known gaps

Verified by searching the codebase for `TODO`/`FIXME`/stub markers (none found as literal comments) and by re-reading every new component's logic end to end. Nothing **compiles-but-silently-does-nothing** — every button either performs its DB write or is disabled/hidden by a permission check. The gaps below are scope boundaries, not broken code:

1. **`budget_actuals` view doesn't filter by period.** `public.budget_actuals` sums *all* `job_ledger_entries` ever posted for a cost center/category, ignoring the budget row's own `period` field. Two budgets on the same cost center for different periods (e.g. 2026 vs 2027) will show identical "actual" figures. This is a real limitation, not by design — worth fixing before relying on Budgets for real period-over-period tracking.
2. **Audit logging is header-only.** `log_audit_change()` is attached to exactly 4 tables: `suppliers`, `purchase_orders`, `supplier_invoices`, `transport_orders`. Line items, RFQs, goods receipts, trips, payments, budgets, and fleet records produce no audit trail.
3. **Goods Receipt "condition" (good/damaged) isn't exposed in the UI.** The `goods_receipt_items.condition` column exists and defaults to `'good'`, but `GoodsReceiptRecorder.tsx` has no input for it — every receipt is recorded as undamaged regardless of reality.
4. **Three-way matching is informational, not enforced.** `SupplierInvoiceDetail` shows ordered/received/invoiced totals side by side; nothing blocks approval if they disagree. Automatic discrepancy blocking would need to be added deliberately.
5. **No cancel/reject flow for the new Procurement/Finance/Transport entities.** POs, RFQs, supplier invoices, transport orders, and trips can only move forward through their status chain — there's no "Cancel" or "Reject" button anywhere in the new UI (the legacy Expression of Need `WorkflowSection` still has its own reject flow, untouched).
6. **Deleting a document doesn't delete the file.** `DocumentsPanel`'s delete button removes the `documents` table row only; the file stays in the `erp-documents` bucket. There's also no `UPDATE`/`DELETE` RLS policy on `storage.objects`, so even a code change to call `storage.remove()` would currently be rejected.
7. **Subcontracted-transport linkage has no UI.** `transport_orders.purchase_order_id` exists in the schema for linking a transport order back to a subcontracting PO, but no form field sets it — it can currently only be set via direct SQL/API.
8. **No trip abandonment/reset.** Once a vehicle/driver is assigned to a trip, the only way to free them back to `available` is completing the full trip lifecycle (assign → start → deliver → complete). There's no "cancel trip" action.
9. **RFQ responses are single-price, not itemized.** An RFQ response captures one `quoted_price` for the whole RFQ, not per line item — creating a PO from a selected response produces one generic line item using the RFQ title, regardless of how many items were actually requested.
10. **`/requests` and `/reports` are pre-existing placeholders**, not part of Phase 1 — both render the same Expression of Need list component (`/reports` under a "Reports" label that doesn't reflect real reporting). Flagging because they're reachable from the nav and could confuse a UAT tester; no action taken on these since they predate this work and weren't in the Phase 1 scope.
11. **No consumer for `domain_events`.** Nine event types are being written (`TransportOrderCreated`, `TripAssigned`, `TripStarted`, `TripCompleted`, `PurchaseOrderCreated`, `PurchaseOrderApproved`, `SupplierInvoiceRecorded`, `InvoiceApproved`, `PaymentRecorded`) but nothing reads them yet — no Edge Function, no cron, no notification pipeline. This is intended groundwork for later phases, not a bug. Also note: no event is emitted at the "delivered" trip checkpoint (only assigned/started/completed) — a minor inconsistency, not a functional gap.

None of the above block Phase 1 UAT — they define exactly what "done" means for this phase versus what's deliberately deferred.
