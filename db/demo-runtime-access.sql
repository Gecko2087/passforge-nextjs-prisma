-- Run as the schema/table owner only AFTER an administrator has created the
-- dedicated LOGIN role passforge_runtime. This file creates no role or password.
-- It grants server-side CRUD on the nine PassForge tables, not API-user access.
-- Run once after demo-bootstrap.sql. Never use this role for Supabase Data API.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'passforge_runtime') THEN
    RAISE EXCEPTION 'Create the dedicated passforge_runtime role before granting access';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = 'passforge_runtime'
      AND (rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole
           OR rolreplication OR NOT rolcanlogin)
  ) THEN
    RAISE EXCEPTION 'passforge_runtime must be LOGIN without elevated role attributes';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_auth_members AS m
    JOIN pg_roles AS r ON r.oid = m.member
    WHERE r.rolname = 'passforge_runtime'
  ) THEN
    RAISE EXCEPTION 'passforge_runtime must not be a member of another role';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_class AS t
    JOIN pg_namespace AS n ON n.oid = t.relnamespace
    JOIN pg_roles AS r ON r.oid = t.relowner
    WHERE n.nspname = 'passforge_demo' AND t.relkind = 'r'
      AND r.rolname = 'passforge_runtime'
  ) THEN
    RAISE EXCEPTION 'passforge_runtime must not own PassForge tables';
  END IF;
  IF (
    SELECT count(*) FROM pg_class AS t
    JOIN pg_namespace AS n ON n.oid = t.relnamespace
    WHERE n.nspname = 'passforge_demo' AND t.relkind = 'r'
      AND t.relname IN (
        'user', 'DemoUsage', 'DemoBudget', 'rateLimit', 'session',
        'account', 'verification', 'category', 'password'
      )
      AND t.relrowsecurity AND t.relforcerowsecurity
  ) <> 9 THEN
    RAISE EXCEPTION 'All nine PassForge tables must have ENABLE and FORCE RLS';
  END IF;
END $$;

GRANT USAGE ON SCHEMA "passforge_demo" TO passforge_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  "passforge_demo"."user", "passforge_demo"."DemoUsage",
  "passforge_demo"."DemoBudget", "passforge_demo"."rateLimit",
  "passforge_demo"."session", "passforge_demo"."account",
  "passforge_demo"."verification", "passforge_demo"."category",
  "passforge_demo"."password"
TO passforge_runtime;

CREATE POLICY passforge_runtime_crud ON "passforge_demo"."user"
  FOR ALL TO passforge_runtime USING (true) WITH CHECK (true);
CREATE POLICY passforge_runtime_crud ON "passforge_demo"."DemoUsage"
  FOR ALL TO passforge_runtime USING (true) WITH CHECK (true);
CREATE POLICY passforge_runtime_crud ON "passforge_demo"."DemoBudget"
  FOR ALL TO passforge_runtime USING (true) WITH CHECK (true);
CREATE POLICY passforge_runtime_crud ON "passforge_demo"."rateLimit"
  FOR ALL TO passforge_runtime USING (true) WITH CHECK (true);
CREATE POLICY passforge_runtime_crud ON "passforge_demo"."session"
  FOR ALL TO passforge_runtime USING (true) WITH CHECK (true);
CREATE POLICY passforge_runtime_crud ON "passforge_demo"."account"
  FOR ALL TO passforge_runtime USING (true) WITH CHECK (true);
CREATE POLICY passforge_runtime_crud ON "passforge_demo"."verification"
  FOR ALL TO passforge_runtime USING (true) WITH CHECK (true);
CREATE POLICY passforge_runtime_crud ON "passforge_demo"."category"
  FOR ALL TO passforge_runtime USING (true) WITH CHECK (true);
CREATE POLICY passforge_runtime_crud ON "passforge_demo"."password"
  FOR ALL TO passforge_runtime USING (true) WITH CHECK (true);

COMMIT;
