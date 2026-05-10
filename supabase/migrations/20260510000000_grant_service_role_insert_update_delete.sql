-- Grant INSERT, UPDATE, DELETE to service_role on profiles and profile_services.
-- These were missing, causing "permission denied" errors from API routes that
-- use the service role key to bypass RLS.
GRANT INSERT, UPDATE, DELETE ON TABLE profiles TO service_role;
GRANT INSERT, UPDATE, DELETE ON TABLE profile_services TO service_role;
