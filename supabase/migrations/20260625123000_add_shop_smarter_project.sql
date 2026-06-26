-- Add featured marketplace project to the existing admin-managed projects table.
INSERT INTO public.projects (
  id,
  title,
  description,
  technologies,
  link,
  image_path,
  image_url,
  display_order
)
VALUES (
  '74c7d9ef-cc36-490f-a9ef-9d6ce6370732',
  'Shop Smarter with Reliable',
  'A modern AI-powered online marketplace designed to provide a seamless and intelligent shopping experience. The platform features smart product discovery, AI-powered customer support, efficient order management, and a user-friendly interface. The system helps customers find products quickly while enabling administrators to manage inventory, orders, and customer interactions effectively. Key features include AI-powered customer support, smart product recommendations, online shopping and checkout, product catalog management, order tracking, secure user authentication, responsive mobile-friendly design, and an admin dashboard for store management. Status: Completed.',
  'React, TypeScript, Tailwind CSS, Supabase, AI Integration',
  NULL,
  NULL,
  NULL,
  -100
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  technologies = EXCLUDED.technologies,
  link = COALESCE(public.projects.link, EXCLUDED.link),
  image_path = COALESCE(public.projects.image_path, EXCLUDED.image_path),
  image_url = COALESCE(public.projects.image_url, EXCLUDED.image_url),
  display_order = LEAST(public.projects.display_order, EXCLUDED.display_order),
  updated_at = now();
