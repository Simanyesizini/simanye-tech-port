import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Headphones, Network, Wrench, Users } from "lucide-react";
import fallbackProfileImg from "@/assets/profile.jpg";
import { ProjectCardMedia } from "@/components/ProjectCardMedia";
import { SiteLayout, Container } from "@/components/SiteLayout";
import { getSignedAssetUrl } from "@/lib/site-assets";
import {
  convertSupabaseProjects,
  readStoredPortfolioProjects,
  type StoredPortfolioProject,
} from "@/lib/local-projects";
import { supabase } from "@/integrations/supabase/client";

type HomeContent = {
  name: string;
  title: string;
  tagline: string;
  summary: string;
};

type Project = StoredPortfolioProject;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simanye Tevin Sizini — IT Support Professional" },
      {
        name: "description",
        content:
          "Entry-level IT Support professional, Diploma in IT Support Services graduate, and CAPACITI INTERN.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [homeContent, setHomeContent] = useState<HomeContent | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profileSrc, setProfileSrc] = useState<string>(fallbackProfileImg);
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // Fetch home content and admin-managed projects
      const [homeResult, projectsResult] = await Promise.all([
        supabase.from("home_content").select("*").limit(1),
        supabase.from("projects").select("*").order("display_order"),
      ]);

      if (homeResult.data && homeResult.data.length > 0) {
        setHomeContent(homeResult.data[0]);
      }
      const storedProjects = readStoredPortfolioProjects() ?? [];
      const storedIds = new Set(storedProjects.map((project) => project.id));
      const databaseProjects = convertSupabaseProjects(projectsResult.data ?? []).filter(
        (project) => !storedIds.has(project.id),
      );
      setProjects([...storedProjects, ...databaseProjects]);

      // Fetch assets
      const [p, c] = await Promise.all([
        getSignedAssetUrl("profile_image", "profile-images"),
        getSignedAssetUrl("cv", "cv"),
      ]);
      if (p) setProfileSrc(p);
      setCvUrl(c);
    })();
  }, []);

  const name = homeContent?.name || "Simanye Tevin Sizini";
  const title = homeContent?.title || "IT Support Technician · IT Support Graduate";
  const tagline =
    homeContent?.tagline ||
    "Passionate about solving technical problems and supporting efficient digital environments.";
  const summary =
    homeContent?.summary ||
    "I recently completed a Diploma in IT Support Services and am currently gaining hands-on industry experience through the CAPACITI program — focused on technical support, systems, and problem-solving.";

  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              CAPACITI INTERN · April 2026 – Present
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] sm:text-6xl">{name}</h1>
            <p className="mt-3 text-lg font-medium text-primary sm:text-xl">{title}</p>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{tagline}</p>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">{summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={cvUrl ?? "#"}
                target={cvUrl ? "_blank" : undefined}
                rel="noreferrer"
                aria-disabled={!cvUrl}
                className={`inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted ${!cvUrl ? "pointer-events-none opacity-50" : ""}`}
              >
                <Download className="h-4 w-4" /> Download CV
              </a>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-border"
              >
                Admin Login
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-4 rounded-2xl bg-accent/60 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <img
                src={profileSrc}
                alt="Portrait of Simanye Tevin Sizini"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Container>
        <div className="space-y-10">
          <section>
            <div className="mb-6 max-w-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Featured projects</p>
              <h2 className="mt-3 text-3xl font-semibold">
                Live portfolio work from the admin dashboard
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                This section displays the latest project data managed in the admin dashboard so
                updates are visible immediately.
              </p>
            </div>

            {projects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {projects.slice(0, 3).map((project) => (
                  <article
                    key={project.id}
                    className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:border-primary/50 hover:shadow-md"
                  >
                    <ProjectCardMedia imageUrl={project.imageUrl} title={project.title} />
                    <div className="space-y-4 p-6">
                      <div>
                        <h3 className="text-xl font-semibold">{project.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {project.description}
                        </p>
                      </div>
                      {project.technologies.length > 0 ? (
                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">
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
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: Headphones,
                    title: "IT Support",
                    desc: "Reliable end-user and technical support.",
                  },
                  {
                    icon: Wrench,
                    title: "Troubleshooting",
                    desc: "Diagnosing and resolving systems issues.",
                  },
                  {
                    icon: Network,
                    title: "Networking",
                    desc: "Foundational networking knowledge.",
                  },
                  {
                    icon: Users,
                    title: "End-user Support",
                    desc: "Clear, patient communication with users.",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm"
                  >
                    <f.icon className="h-5 w-5 text-primary" />
                    <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {projects.length > 0 ? (
            <div className="text-center">
              <Link
                to="/projects"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View the full project portfolio
              </Link>
            </div>
          ) : null}
        </div>
      </Container>
    </SiteLayout>
  );
}
