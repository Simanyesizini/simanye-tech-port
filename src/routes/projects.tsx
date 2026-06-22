import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { FolderKanban } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Simanye Tevin Sizini" },
      { name: "description", content: "Technical and academic projects by Simanye Tevin Sizini." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Projects"
        title="Practical work and applied technical projects"
        description="A growing portfolio of academic and applied projects that demonstrate problem-solving and delivery."
      />
      <Container>
        <article className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid gap-0 md:grid-cols-[1fr_1.4fr]">
            <div className="flex items-center justify-center bg-surface p-10">
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <FolderKanban className="h-12 w-12" />
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-wrap gap-2">
                {["Web Application", "Academic System", "Student Portal"].map((t) => (
                  <span key={t} className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">{t}</span>
                ))}
              </div>
              <h2 className="mt-4 text-2xl font-semibold">Special Exam Application System</h2>
              <p className="mt-1 text-sm font-medium text-primary">Final Year Project · Developer / Student Project Contributor</p>

              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-foreground">Overview</dt>
                  <dd className="mt-1 text-muted-foreground">A web-based system that allows students to apply for special exams digitally, replacing manual paperwork with a streamlined online workflow.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Tools / Technologies</dt>
                  <dd className="mt-1 text-muted-foreground italic">To be added — editable placeholder.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Outcome</dt>
                  <dd className="mt-1 text-muted-foreground">Improved efficiency, reduced paperwork and a streamlined application process between students and administrators.</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        <div className="mt-8 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <h3 className="text-base font-semibold">More projects coming soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">This space is reserved for upcoming work from the CAPACITI program and personal IT projects.</p>
        </div>
      </Container>
    </SiteLayout>
  );
}
