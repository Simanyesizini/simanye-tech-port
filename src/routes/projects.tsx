import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { ProjectCardMedia } from "@/components/ProjectCardMedia";
import {
  convertSupabaseProjects,
  readStoredPortfolioProjects,
  type StoredPortfolioProject,
} from "@/lib/local-projects";
import { supabase } from "@/integrations/supabase/client";

type Project = StoredPortfolioProject;

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
      const storedProjects = readStoredPortfolioProjects() ?? [];
      const storedIds = new Set(storedProjects.map((project) => project.id));
      const databaseProjects = convertSupabaseProjects(data ?? []).filter(
        (project) => !storedIds.has(project.id),
      );

      setProjects([...storedProjects, ...databaseProjects]);
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
          <div className="rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            Loading projects…
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No projects have been added yet. Add projects in the admin dashboard to display them
            here.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:border-primary/50 hover:shadow-md"
              >
                <ProjectCardMedia imageUrl={project.imageUrl} title={project.title} />
                <div className="space-y-4 p-6">
                  <div>
                    <h2 className="text-xl font-semibold">{project.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                  {project.technologies.length > 0 ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      {project.technologies.join(", ")}
                    </p>
                  ) : null}
                  {project.projectLink ? (
                    <a
                      href={project.projectLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
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
