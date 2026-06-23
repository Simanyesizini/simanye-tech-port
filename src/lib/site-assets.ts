import { supabase } from "@/integrations/supabase/client";

export async function getSignedAssetUrl(
  key: "profile_image" | "cv",
  bucket: "profile-images" | "cv",
): Promise<string | null> {
  const { data } = await supabase
    .from("site_assets")
    .select("file_path")
    .eq("key", key)
    .maybeSingle();
  if (!data?.file_path) return null;
  const { data: signed } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.file_path, 3600);
  return signed?.signedUrl ?? null;
}
