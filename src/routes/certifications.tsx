import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { BadgeCheck, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/certifications")({
  head: () => ({
    meta: [
      { title: "Certifications — Simanye Tevin Sizini" },
      { name: "description", content: "Certifications and qualifications held by Simanye Tevin Sizini." },
    ],
  }),
  component: CertificationsPage,
});

const certs = [
  { name: "Diploma in IT Support Services", institution: "Nelson Mandela University", year: "2025" },
  { name: "Higher Certificate in IT User Support Services", institution: "Nelson Mandela University", year: "2022" },
  { name: "CAPACITI Training Program", institution: "CAPACITI", year: "2026 – Present" },
];

function CertificationsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Certifications"
        title="Qualifications and ongoing training"
        description="Formal qualifications and structured professional training that support my IT career foundation."
      />
      <Container>
        <div className="grid gap-5 sm:grid-cols-2">
          {certs.map((c) => (
            <div key={c.name} className="flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-snug">{c.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.institution}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">{c.year}</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                  disabled
                  title="Certificate file coming soon"
                >
                  View Certificate <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </SiteLayout>
  );
}
