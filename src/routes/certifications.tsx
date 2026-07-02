import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Download, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const certificateAssets = import.meta.glob("@/assets/*.{pdf,jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

type CertificateItem = {
  title: string;
  institution: string;
  date: string | null;
  assetHint?: string;
};

type CertificateCategory = {
  title: string;
  description?: string;
  items: CertificateItem[];
};

const categories: CertificateCategory[] = [
  {
    title: "Candidate Professional Development",
    items: [
      { title: "Write Professional Emails in English", institution: "Coursera", date: "2024" },
      { title: "Verbal Communications and Presentation Skills", institution: "Coursera", date: "2024" },
      { title: "Active Listening: Enhancing Communication Skills", institution: "Coursera", date: "2024", assetHint: "Active Listening Enhancing Communication" },
      { title: "Developing Interpersonal Skills", institution: "Coursera", date: "2024" },
      { title: "Work Smarter, Not Harder: Time Management for Personal & Professional Productivity", institution: "Coursera", date: "2024" },
      { title: "Emotional Intelligence in the Workplace", institution: "Coursera", date: "2024" },
      { title: "Finding Your Professional Voice: Confidence & Impact", institution: "Coursera", date: "2024" },
      { title: "Introduction to Personal Branding", institution: "Coursera", date: "2024" },
      { title: "Leading with Impact: Team Dynamics, Strategy and Ethics", institution: "Coursera", date: "2024" },
      { title: "Financial Planning for Young Adults", institution: "Coursera", date: "2024" },
      { title: "Preparation for Job Interview", institution: "Coursera", date: "2024", assetHint: "Preparation for Job Interviews" },
    ],
  },
  {
    title: "AI Bootcamp",
    items: [
      { title: "Generative AI: Prompt Engineering Basics", institution: "Coursera", date: "2024", assetHint: "Generative AI Prompt Engineering Basics" },
      { title: "AI For Everyone", institution: "Coursera", date: "2024" },
      { title: "Introduction to Artificial Intelligence", institution: "Coursera", date: "2024", assetHint: "Introduction to AI" },
      { title: "Introduction to Generative AI", institution: "Coursera", date: "2024" },
      { title: "AI Essentials", institution: "Coursera", date: "2024", assetHint: "AI Essential" },
      { title: "Generative AI with Large Language Models", institution: "Coursera", date: "2024" },
      { title: "AI Foundations: Prompt Engineering with ChatGPT", institution: "Coursera", date: "2024", assetHint: "AI Foundations Prompt Engineering with ChatGPT" },
      { title: "Python for Data Science, AI and Development", institution: "Coursera", date: null },
      { title: "Supervised Machine Learning: Regression and Classification", institution: "Coursera", date: "2024", assetHint: "Supervised Machine Learning Regression and Classification" },
      { title: "Advanced Learning Algorithms", institution: "Coursera", date: "2024" },
      { title: "Unsupervised Learning, Recommenders, Reinforcement Learning", institution: "Coursera", date: "2024" },
      { title: "Trustworthy AI: Managing Bias, Ethics and Accountability", institution: "Coursera", date: "2024" },
      { title: "Introduction to Responsible AI", institution: "Coursera", date: "2024" },
    ],
  },
  {
    title: "Google AI Essentials Specialization",
    items: [
      { title: "Introduction to AI", institution: "Google", date: "2024", assetHint: "Introduction to AI" },
      { title: "Maximize Productivity with AI Tools", institution: "Google", date: "2024" },
      { title: "Discover the Art of Prompting", institution: "Google", date: "2024" },
      { title: "Use AI Responsibly", institution: "Google", date: "2024" },
      { title: "Stay Ahead of the AI Curve", institution: "Google", date: "2024" },
      { title: "Google AI Essentials", institution: "Google", date: "2024" },
    ],
  },
  {
    title: "School Certificate",
    items: [
      { title: "Higher Certificate in Information Technology", institution: "Institution not listed", date: null },
      { title: "Diploma in Information Technology", institution: "Institution not listed", date: null },
    ],
  },
  {
    title: "CCNA",
    items: [
      { title: "CCNA: Enterprise Networking, Security and Automation", institution: "Cisco Networking Academy", date: "2024", assetHint: "CCNA Enterprise Networking Security and Automation_" },
      { title: "CCNA: Introduction to Networks", institution: "Cisco Networking Academy", date: "2024" },
      { title: "Introduction to Cybersecurity", institution: "Cisco Networking Academy", date: "2024" },
    ],
  },
];

function buildAssetLookup() {
  return Object.entries(certificateAssets).reduce<Record<string, string>>((acc, [path, url]) => {
    const fileName = path.split("/").pop() ?? "";
    const basename = fileName.replace(/\.[^.]+$/, "").toLowerCase();
    acc[basename] = url;
    acc[basename.replace(/[^a-z0-9]+/g, " ").trim()] = url;
    return acc;
  }, {});
}

const assetLookup = buildAssetLookup();

function resolveAssetUrl(assetHint?: string) {
  if (!assetHint) return null;
  const normalized = assetHint.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return assetLookup[normalized] ?? null;
}

function normalizeFileType(url: string | null) {
  if (!url) return "pdf";
  const ext = (url.split(".").pop() || "pdf").toLowerCase();
  if (["jpg", "jpeg", "png"].includes(ext)) return ext;
  return "pdf";
}

function buildDownloadFilename(title: string, url: string | null) {
  const ext = normalizeFileType(url);
  const safe = title.replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/\s+/g, "_") || "certificate";
  return `${safe}.${ext}`;
}

export const Route = createFileRoute("/certifications")({
  head: () => ({
    meta: [
      { title: "Certifications — Simanye Tevin Sizini" },
      { name: "description", content: "Certifications and qualifications held by Simanye Tevin Sizini." },
    ],
  }),
  component: CertificationsPage,
});

function CertificationsPage() {
  const [viewing, setViewing] = useState<CertificateItem | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [viewingError, setViewingError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  const resolvedCategories = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          assetUrl: resolveAssetUrl(item.assetHint ?? item.title),
        })),
      })),
    [],
  );

  function closeViewer() {
    setIsOpen(false);
    setViewing(null);
    setViewingUrl(null);
    setViewingError(null);
    setZoom(1);
    window.scrollTo({ top: savedScrollPosition, behavior: "auto" });
  }

  function openViewer(item: CertificateItem & { assetUrl?: string | null }) {
    if (!item.assetUrl) {
      setViewing(item);
      setViewingUrl(null);
      setViewingError("Certificate file is not available in the local assets folder.");
      setSavedScrollPosition(window.scrollY);
      setZoom(1);
      setIsOpen(true);
      return;
    }

    setViewing(item);
    setViewingUrl(item.assetUrl);
    setViewingError(null);
    setSavedScrollPosition(window.scrollY);
    setZoom(1);
    setIsOpen(true);
  }

  async function downloadCurrent() {
    if (!viewing || !viewingUrl) return;
    const filename = buildDownloadFilename(viewing.title, viewingUrl);
    try {
      const response = await fetch(viewingUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("Failed to download certificate", error);
    }
  }

  useMemo(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Certifications"
        title="Qualifications and ongoing training"
        description="Formal qualifications and structured professional training that support my IT career foundation."
      />
      <Container className="space-y-8">
        <div className="rounded-3xl border border-border bg-card/60 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-primary">Certifications hub</p>
          <h2 className="mt-3 text-2xl font-semibold">A categorized view of professional and technical training</h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            Browse certificates grouped by topic, then open each one in a full-sized viewer with download support.
          </p>
        </div>

        {resolvedCategories.map((category) => (
          <section key={category.title} className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{category.title}</h3>
                {category.description ? <p className="mt-1 text-sm text-muted-foreground">{category.description}</p> : null}
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory">
              {category.items.map((item) => (
                <article
                  key={item.title}
                  className="group flex min-w-[260px] max-w-[280px] flex-col rounded-3xl border border-border bg-background p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md sm:min-w-[280px]"
                >
                  <div className="flex h-36 items-center justify-center rounded-2xl bg-muted text-center">
                    <p className="px-4 text-sm font-medium text-muted-foreground">{item.title}</p>
                  </div>
                  <div className="mt-5 flex flex-1 flex-col">
                    <h4 className="text-base font-semibold leading-snug">{item.title}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">{item.institution}</p>
                    {item.date ? (
                      <p className="mt-3 text-xs uppercase tracking-[0.24em] text-primary">Completed {item.date}</p>
                    ) : (
                      <p className="mt-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">Date not listed</p>
                    )}
                    <div className="mt-5 flex-1" />
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      variant={item.assetUrl ? "default" : "outline"}
                      onClick={() => openViewer(item)}
                    >
                      {item.assetUrl ? "View Certificate" : "Certificate unavailable"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </Container>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative mx-3 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold">{viewing?.title}</h3>
                <p className="text-sm text-muted-foreground">{viewing?.institution}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" size="icon" variant="outline" onClick={() => setZoom((value) => Math.min(2, Number((value + 0.25).toFixed(2))))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="outline" onClick={() => setZoom((value) => Math.max(0.75, Number((value - 0.25).toFixed(2))))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="outline" onClick={() => setZoom(1)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="outline" onClick={downloadCurrent} disabled={!viewingUrl}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="outline" onClick={closeViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-muted p-3 sm:p-5">
              {viewingError ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
                  {viewingError}
                </div>
              ) : !viewingUrl ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
                  Loading certificate…
                </div>
              ) : normalizeFileType(viewingUrl) === "pdf" ? (
                <div className="flex min-h-full items-center justify-center rounded-2xl bg-background p-2" style={{ transform: `scale(${zoom})`, transformOrigin: "center top" }}>
                  <iframe src={viewingUrl} title={viewing?.title} className="h-[70vh] w-full rounded-2xl border border-border" />
                </div>
              ) : (
                <div className="flex min-h-full items-center justify-center rounded-2xl bg-background p-2">
                  <img src={viewingUrl} alt={viewing?.title} className="max-h-full w-full object-contain" style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </SiteLayout>
  );
}
