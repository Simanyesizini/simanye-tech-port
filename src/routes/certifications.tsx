import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { BadgeCheck, FileText, ImageIcon, Search, ExternalLink, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewing, setViewing] = useState<Certificate | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const autoplayRef = useRef<number | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const pointerCurrentX = useRef<number | null>(null);

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
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (certs.length === 0) return;
    if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    autoplayRef.current = window.setInterval(() => {
      setSelectedIndex((prev) => {
        const next = (prev + 1) % filtered.length;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    };
  }, [certs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return certs;
    return certs.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.institution.toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q),
    );
  }, [certs, query]);

  useEffect(() => {
    if (selectedIndex >= filtered.length) setSelectedIndex(0);
  }, [filtered, selectedIndex]);

  const current = filtered[selectedIndex] ?? null;

  const hasResults = filtered.length > 0;

  function scrollToIndex(index: number) {
    if (!carouselRef.current) return;
    const child = carouselRef.current.children[index] as HTMLElement | undefined;
    if (!child) return;
    child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setSelectedIndex(index);
  }

  function handlePrev() {
    if (!hasResults) return;
    const next = selectedIndex === 0 ? filtered.length - 1 : selectedIndex - 1;
    scrollToIndex(next);
  }

  function handleNext() {
    if (!hasResults) return;
    const next = selectedIndex === filtered.length - 1 ? 0 : selectedIndex + 1;
    scrollToIndex(next);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    pointerStartX.current = event.clientX;
    pointerCurrentX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerStartX.current === null) return;
    pointerCurrentX.current = event.clientX;
  }

  function handlePointerUp() {
    if (pointerStartX.current === null || pointerCurrentX.current === null) {
      pointerStartX.current = null;
      pointerCurrentX.current = null;
      return;
    }
    const delta = pointerCurrentX.current - pointerStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta > 0) handlePrev(); else handleNext();
    }
    pointerStartX.current = null;
    pointerCurrentX.current = null;
  }

  function pauseAutoplay() {
    if (autoplayRef.current) {
      window.clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }

  function resumeAutoplay() {
    if (autoplayRef.current || filtered.length === 0) return;
    autoplayRef.current = window.setInterval(() => {
      setSelectedIndex((prev) => {
        const next = (prev + 1) % filtered.length;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
  }

  useEffect(() => {
    if (!hasResults) return;
    scrollToIndex(selectedIndex);
  }, [filtered]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Certifications"
        title="Qualifications and ongoing training"
        description="Formal qualifications and structured professional training that support my IT career foundation."
      />
      <Container>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search certificates…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePrev} size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleNext} size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !hasResults ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <BadgeCheck className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {certs.length === 0 ? "No certificates available yet." : "No certificates match your search."}
            </p>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-4 pt-2"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onMouseEnter={pauseAutoplay}
              onMouseLeave={resumeAutoplay}
            >
              {filtered.map((cert, index) => (
                <article
                  key={cert.id}
                  className={`min-w-[90%] sm:min-w-[45%] lg:min-w-[30%] rounded-3xl border p-6 shadow-sm transition-transform duration-300 ${selectedIndex === index ? "scale-[1.01] border-primary bg-card" : "bg-background border-border"}`}
                  onClick={() => {
                    setSelectedIndex(index);
                    scrollToIndex(index);
                  }}
                >
                  <div className="flex h-44 items-center justify-center overflow-hidden rounded-3xl bg-muted">
                    {cert.file_type === "application/pdf" ? (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12" />
                      </div>
                    ) : (
                      <img src={cert.file_url} alt={cert.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="mt-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold leading-snug">{cert.title}</h3>
                      <p className="text-sm text-muted-foreground">{cert.institution}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{new Date(cert.date_issued).toLocaleDateString(undefined, { year: "numeric" })}</span>
                      <span className="rounded-full bg-accent/30 px-2 py-1">{cert.file_type === "application/pdf" ? "PDF" : "Image"}</span>
                    </div>
                    <Button type="button" size="sm" className="w-full" onClick={() => { setViewing(cert); setIsOpen(true); }}>
                      View Certificate
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              {filtered.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${selectedIndex === idx ? "bg-primary" : "bg-border"}`}
                  aria-label={`Go to certificate ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </Container>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl w-full p-0 overflow-hidden">
          {viewing && (
            <div className="flex flex-col bg-background">
              <DialogHeader className="border-b border-border p-6">
                <DialogTitle>{viewing.title}</DialogTitle>
                <DialogDescription>{viewing.institution} · {new Date(viewing.date_issued).toLocaleDateString(undefined, { year: "numeric", month: "long" })}</DialogDescription>
              </DialogHeader>
              <div className="relative h-[75vh] bg-muted">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 top-4 z-10 rounded-full bg-background/90 p-2 text-muted-foreground transition hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
                {signedUrl ? (
                  viewing.file_type === "application/pdf" ? (
                    <iframe src={signedUrl} title={viewing.title} className="h-full w-full" />
                  ) : (
                    <img src={signedUrl} alt={viewing.title} className="h-full w-full object-contain" />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading viewer…</div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
                <div className="text-sm text-muted-foreground">Full-screen support available via browser controls.</div>
                <div className="flex gap-2">
                  {signedUrl && (
                    <>
                      <Button asChild size=\"sm\" variant=\"outline\">
                        <a href={signedUrl} target=\"_blank\" rel=\"noreferrer\" download>
                          <Download className=\"h-3.5 w-3.5\" />
                          Download
                        </a>
                      </Button>
                      <Button asChild size=\"sm\" variant=\"outline\">
                        <a href={signedUrl} target=\"_blank\" rel=\"noreferrer\">Open in new tab</a>
                      </Button>
                    </>
                  )}
                  <DialogClose asChild>
                    <Button size="sm">Close</Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
