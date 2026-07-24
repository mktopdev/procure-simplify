-- Security hardening (Phase 1, post-deploy)
-- Fixes two ERROR/WARN-level findings from Supabase's security advisor
-- after the initial Phase 1 deploy to smsffnbfcpybezaljgmd:
--
-- 1. po_receipt_status, po_financial_summary, and budget_actuals defaulted
--    to running as their owner (the migration-applying role), which bypasses
--    RLS on the underlying tables — a user without procurement.view/
--    finance.view could query these views directly and see all rows
--    regardless of permission. security_invoker makes them run as the
--    querying user instead, so the underlying table RLS applies normally.
-- 2. Six simple trigger functions (set_updated_at, the four *_number
--    generators, generate_supplier_invoice_reference) were missing a
--    pinned search_path — standard hardening against search_path
--    injection, even though none of them do dynamic SQL.
--
-- Everything else the advisor flagged (permissive `using (true)` policies
-- on purchase_request_items/customers/cost_centers/expressions_of_need/etc.,
-- and public bucket listing on erp-documents/expressions-attachments) is an
-- intentional Phase 1 design choice, already documented in
-- docs/phase1-deployment-and-uat.md — not touched here.

alter view public.po_receipt_status set (security_invoker = true);
alter view public.po_financial_summary set (security_invoker = true);
alter view public.budget_actuals set (security_invoker = true);

alter function public.set_updated_at() set search_path = public;
alter function public.generate_rfq_number() set search_path = public;
alter function public.generate_po_number() set search_path = public;
alter function public.generate_grn_number() set search_path = public;
alter function public.generate_supplier_invoice_reference() set search_path = public;
alter function public.generate_transport_order_number() set search_path = public;
