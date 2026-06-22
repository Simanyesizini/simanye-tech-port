import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { BadgeCheck, FileText, ImageIcon, Search, ExternalLink, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/certifications")({
  head: () => ({
    meta: [
      { title: "Certifications — Simanye Tevin Sizini" },
      { name: "description", content: "Certifications and qualifications held by Simanye Tevin Sizini." },
    ],
  }),
  component: CertificationsPage,
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
};

function CertificationsPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<Certificate | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .order("date_issued", { ascending: false });
      setCerts((data as Certificate[]) ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!viewing) { setSignedUrl(null); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase.storage
        .from("certificates")
        .createSignedUrl(viewing.file_path, 3600);
      if (!cancelled) setSignedUrl(data?.signedUrl ?? null);
    })();
    return () => { cancelled = true; };
  }, [viewing]);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setViewing(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [viewing]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return certs;
    return certs.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.institution.toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q),
    );
  }, [certs, query]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Certifications"
        title="Qualifications and ongoing training"
        description="Formal qualifications and structured professional training that support my IT career foundation."
      />
      <Container>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search certificates…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground">Admin</Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <BadgeCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {certs.length === 0 ? "No certificates available yet." : "No certificates match your search."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <article key={c.id} className="flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    {c.file_type === "application/pdf" ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-snug">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.institution}</p>
                  </div>
                </div>
                {c.description && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{c.description}</p>
                )}
                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {new Date(c.date_issued).toLocaleDateString(undefined, { year: "numeric", month: "short" })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewing(c)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    View Certificate <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>

      {viewing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={viewing.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border p-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{viewing.title}</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {viewing.institution} · {new Date(viewing.date_issued).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {signedUrl && (
                  <Button asChild size="sm" variant="outline">
                    <a href={signedUrl} target="_blank" rel="noreferrer">Open in new tab</a>
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  aria-label="Close"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-surface">
              {!signedUrl ? (
                <p className="p-8 text-center text-sm text-muted-foreground">Loading certificate…</p>
              ) : viewing.file_type === "application/pdf" ? (
                <iframe src={signedUrl} title={viewing.title} className="h-[75vh] w-full" />
              ) : (
                <img src={signedUrl} alt={viewing.title} className="mx-auto max-h-[80vh] w-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
