
CREATE TABLE public.site_assets (
  key TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_assets TO authenticated;
GRANT ALL ON public.site_assets TO service_role;

ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site assets" ON public.site_assets FOR SELECT USING (true);
CREATE POLICY "Admins can insert site assets" ON public.site_assets FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update site assets" ON public.site_assets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete site assets" ON public.site_assets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_site_assets_updated_at BEFORE UPDATE ON public.site_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
