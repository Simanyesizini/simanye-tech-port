import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { ProjectCardMedia } from "@/components/ProjectCardMedia";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  convertSupabaseProjects,
  DEFAULT_PORTFOLIO_PROJECT,
  DEFAULT_SPECIAL_EXAM_PROJECT,
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

function hasExternalLink(project: Project) {
  return Boolean(project.liveDemoLink || project.projectLink);
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsProject, setDetailsProject] = useState<Project | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("projects").select("*").order("display_order");
      const storedProjects = readStoredPortfolioProjects() ?? [];
      const storedIds = new Set(storedProjects.map((project) => project.id));
      const databaseProjects = convertSupabaseProjects(data ?? []).filter(
        (project) => !storedIds.has(project.id),
      );
      let allProjects = [...storedProjects, ...databaseProjects];
      if (!allProjects.some((p) => p.id === DEFAULT_PORTFOLIO_PROJECT.id)) {
        allProjects = [DEFAULT_PORTFOLIO_PROJECT, ...allProjects];
      }
      if (!allProjects.some((p) => p.id === DEFAULT_SPECIAL_EXAM_PROJECT.id)) {
        allProjects = [...allProjects, DEFAULT_SPECIAL_EXAM_PROJECT];
      }

      setProjects(allProjects);
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
            {projects.map((project) => {
              const external = hasExternalLink(project);
              return (
                <article
                  key={project.id}
                  className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:border-primary/50 hover:shadow-md"
                >
                  <ProjectCardMedia imageUrl={project.imageUrl} title={project.title} />
                  <div className="space-y-4 p-6">
                    <div>
                      {project.category ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                          {project.category}
                        </p>
                      ) : null}
                      <h2 className="mt-1 text-xl font-semibold">{project.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                    {project.technologies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="font-medium">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    {project.status ? (
                      <p className="text-xs font-medium text-muted-foreground">
                        Status: <span className="text-foreground">{project.status}</span>
                      </p>
                    ) : null}
                    <div className="mt-3">
                      {external ? (
                        <a
                          href={project.liveDemoLink || project.projectLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                          View Project
                        </a>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setDetailsProject(project)}
                          className="rounded-md"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Container>

      <Dialog
        open={Boolean(detailsProject)}
        onOpenChange={(open) => !open && setDetailsProject(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {detailsProject ? (
            <>
              <DialogHeader>
                {detailsProject.category ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    {detailsProject.category}
                  </p>
                ) : null}
                <DialogTitle className="text-2xl">{detailsProject.title}</DialogTitle>
                <DialogDescription className="text-base leading-6 text-muted-foreground">
                  {detailsProject.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {detailsProject.features.length > 0 ? (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                      Key Features
                    </h3>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {detailsProject.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {detailsProject.technologies.length > 0 ? (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                      Tools Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {detailsProject.technologies.map((t) => (
                        <Badge key={t} variant="secondary" className="font-medium">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </section>
                ) : null}

                {detailsProject.status ? (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground">
                      Project Status
                    </h3>
                    <p className="text-sm text-muted-foreground">{detailsProject.status}</p>
                  </section>
                ) : null}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
