-- migration_fix_rls_hardening.sql — 2026-07-03
-- Security hardening from the technical audit (docs/audit-2026-07-tech.md).
-- ADDITIVE (targeted DROP/CREATE POLICY + REVOKE + ALTER FUNCTION). No schema rewrite.
-- Applied to the LIVE DB and verified (review submission + approval still work).

BEGIN;

-- C1 (CRITICAL): the live policy "System can update properties" was UPDATE to public with
-- USING(true)/WITH CHECK(true) + anon had UPDATE grant → anyone with the public anon key could
-- forge any property's ratings. Aggregates are maintained by the update_property_ratings trigger,
-- so make it SECURITY DEFINER (runs as owner, bypasses RLS) and then remove the public UPDATE path.
ALTER FUNCTION public.update_property_ratings() SECURITY DEFINER SET search_path = public;
DROP POLICY IF EXISTS "System can update properties" ON public.properties;

-- H1/H3 (HIGH): property creation was open to anon (spam). New-address review flow uses an
-- authenticated upsert INSERT, so restrict INSERT to authenticated only.
DROP POLICY IF EXISTS "Users can create properties" ON public.properties;
CREATE POLICY "Authenticated can create properties"
  ON public.properties FOR INSERT TO authenticated WITH CHECK (true);

-- Least privilege on the table grants (RLS also gates; belt-and-suspenders).
-- anon = read-only; authenticated keeps INSERT (create property) + SELECT, loses UPDATE/DELETE.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.properties FROM anon;
REVOKE UPDATE, DELETE, TRUNCATE ON public.properties FROM authenticated;

-- H2 (HIGH, privacy): "Reports are viewable" (SELECT to public, USING true) exposed reporter
-- identity + reason to everyone. Remove it; admins keep access via "Admins can read reports";
-- a reporter can read their own report.
DROP POLICY IF EXISTS "Reports are viewable" ON public.review_reports;
CREATE POLICY "Users read own reports"
  ON public.review_reports FOR SELECT TO authenticated USING ((select auth.uid()) = reported_by);

COMMIT;
