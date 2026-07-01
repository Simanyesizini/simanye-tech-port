REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.handle_first_user_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_first_user_admin() TO service_role;