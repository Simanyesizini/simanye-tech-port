import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ImageIcon, LogOut, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Manage Certificates" }] }),
  component: AdminPage,
});

type Certificate = {
  id: string;
  title: string;
  institution: string;
  date_issued: string;
  description: string | null;
  file_url: string;
  file_path: string;
  file_type: string;
  created_at: string;
};

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [dateIssued, setDateIssued] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      setIsAdmin(Boolean(data));
    })();
    refresh();
  }, []);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function refresh() {
    const { data } = await supabase
      .from("certificates")
      .select("*")
      .order("date_issued", { ascending: false });
    setCerts((data as Certificate[]) ?? []);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (f && !ACCEPTED.includes(f.type)) {
      setError("Only PDF, JPG, or PNG files are accepted.");
      setFile(null);
      e.target.value = "";
      return;
    }
    if (f && f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(f);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMessage(null);
    if (!file) { setError("Please choose a file."); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("certificates")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(path);
      const { error: insErr } = await supabase.from("certificates").insert({
        title: title.trim(),
        institution: institution.trim(),
        date_issued: dateIssued,
        description: description.trim() || null,
        file_url: urlData.publicUrl,
        file_path: path,
        file_type: file.type,
      });
      if (insErr) throw insErr;
      setMessage("Certificate uploaded.");
      setTitle(""); setInstitution(""); setDateIssued(""); setDescription(""); setFile(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(cert: Certificate) {
    if (!confirm(`Delete "${cert.title}"?`)) return;
    await supabase.storage.from("certificates").remove([cert.file_path]);
    await supabase.from("certificates").delete().eq("id", cert.id);
    await refresh();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isAdmin === false) {
    return (
      <SiteLayout>
        <Container className="max-w-xl">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h1 className="text-xl font-semibold">Not authorized</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account does not have admin privileges. Contact the portfolio owner.
            </p>
            <Button onClick={handleSignOut} variant="outline" className="mt-5">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </Container>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin"
        title="Manage Certificates"
        description="Upload, preview, and remove certificates that appear on the public Certifications page."
      />
      <Container>
        <div className="mb-6 flex justify-end">
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={handleUpload} className="space-y-4 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Upload new certificate</h2>
            <div>
              <Label htmlFor="title">Certificate title</Label>
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input id="institution" required value={institution} onChange={(e) => setInstitution(e.target.value)} maxLength={150} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="date">Date issued</Label>
              <Input id="date" type="date" required value={dateIssued} onChange={(e) => setDateIssued(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="desc">Description (optional)</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="file">Certificate file (PDF, JPG, PNG)</Label>
              <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={onFileChange} className="mt-1.5" />
            </div>

            {previewUrl && file && (
              <div className="rounded-md border border-border bg-surface p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
                {file.type === "application/pdf" ? (
                  <iframe src={previewUrl} title="Preview" className="h-64 w-full rounded" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-h-64 rounded object-contain" />
                )}
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}

            <Button type="submit" disabled={uploading} className="w-full">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Save certificate"}
            </Button>
          </form>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Existing certificates ({certs.length})</h2>
            {certs.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No certificates uploaded yet.
              </p>
            )}
            {certs.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  {c.file_type === "application/pdf" ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.institution} · {new Date(c.date_issued).toLocaleDateString()}</p>
                </div>
                <Button onClick={() => handleDelete(c)} variant="ghost" size="icon" aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </SiteLayout>
  );
}
