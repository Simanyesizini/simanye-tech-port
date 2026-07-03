
-- 1) Restrict contact_info reads to authenticated users
DROP POLICY IF EXISTS "Public read contact_info" ON public.contact_info;
REVOKE SELECT ON public.contact_info FROM anon;

CREATE POLICY "Authenticated read contact_info"
  ON public.contact_info
  FOR SELECT
  TO authenticated
  USING (true);

-- 2) Lock down SECURITY DEFINER functions from direct execution
REVOKE EXECUTE ON FUNCTION public.handle_first_user_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- has_role must remain executable by authenticated so RLS policies that call it work
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
