
CREATE POLICY "Public read profile-images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Admins write profile-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update profile-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-images' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete profile-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public read cv" ON storage.objects FOR SELECT USING (bucket_id = 'cv');
CREATE POLICY "Admins write cv" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cv' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update cv" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'cv' AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete cv" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cv' AND public.has_role(auth.uid(), 'admin'::app_role));
