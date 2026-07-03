import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { ProjectCardMedia } from "@/components/ProjectCardMedia";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  convertSupabaseProjects,
  DEFAULT_PORTFOLIO_PROJECT,
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
      const allProjects = [...storedProjects, ...databaseProjects];
      const nextProjects = allProjects.some((project) => project.id === DEFAULT_PORTFOLIO_PROJECT.id)
        ? allProjects
        : [DEFAULT_PORTFOLIO_PROJECT, ...allProjects];

      setProjects(nextProjects);
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-3">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{project.title}</DialogTitle>
                        <DialogDescription>{project.category || "Web Application"}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-auto w-full rounded-3xl object-cover"
                          />
                        ) : null}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold">Overview</h3>
                            <p className="text-sm leading-6 text-muted-foreground">
                              {project.description}
                            </p>
                          </div>
                          {project.features.length > 0 ? (
                            <div>
                              <h3 className="text-lg font-semibold">Key Features</h3>
                              <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
                                {project.features.map((feature) => (
                                  <li key={feature} className="list-disc pl-4">
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          {project.technologies.length > 0 ? (
                            <div>
                              <h3 className="text-lg font-semibold">Technologies</h3>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {project.technologies.join(", ")}
                              </p>
                            </div>
                          ) : null}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <h3 className="text-lg font-semibold">Status</h3>
                              <p className="mt-2 text-sm text-muted-foreground">{project.status || "Completed"}</p>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">Category</h3>
                              <p className="mt-2 text-sm text-muted-foreground">{project.category || "Web Application"}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {project.githubLink ? (
                              <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                              >
                                GitHub
                              </a>
                            ) : null}
                            {project.liveDemoLink ? (
                              <a
                                href={project.liveDemoLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                              >
                                Live Demo
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </SiteLayout>
  );
}
