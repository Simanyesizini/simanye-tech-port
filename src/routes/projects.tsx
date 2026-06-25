import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string | null;
  link: string | null;
  image_url: string | null;
  display_order: number;
};

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("projects").select("*").order("display_order");
      setProjects((data as Project[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Projects"
        title="Practical work and applied technical projects"
        description="A growing portfolio of academic and applied projects that demonstrate problem-solving and delivery."
      />
      <Container>
        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No projects have been added yet. Add projects in the admin dashboard to display them here.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article key={project.id} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:border-primary/50 hover:shadow-md">
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-surface">
                    <FolderKanban className="h-14 w-14 text-primary" />
                  </div>
                )}
                <div className="space-y-4 p-6">
                  <div>
                    <h2 className="text-xl font-semibold">{project.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.description}</p>
                  </div>
                  {project.technologies ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{project.technologies}</p>
                  ) : null}
                  {project.link ? (
                    <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      View project
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </SiteLayout>
  );
}
