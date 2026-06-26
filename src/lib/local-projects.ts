export const PORTFOLIO_PROJECTS_KEY = "portfolio_projects";

export type StoredPortfolioProject = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectLink: string;
  imageUrl: string;
  createdAt: string;
};

type SupabaseProject = {
  id: string;
  title: string;
  description: string;
  technologies: string | null;
  link: string | null;
  image_url: string | null;
  display_order?: number;
};

export function parseProjectTechnologies(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function readStoredPortfolioProjects(): StoredPortfolioProject[] | null {
  if (typeof window === "undefined") return null;

  const rawProjects = window.localStorage.getItem(PORTFOLIO_PROJECTS_KEY);
  if (rawProjects === null) return null;

  try {
    const parsed = JSON.parse(rawProjects);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((project): StoredPortfolioProject | null => {
        if (!project || typeof project !== "object") return null;

        const title = typeof project.title === "string" ? project.title.trim() : "";
        const description =
          typeof project.description === "string" ? project.description.trim() : "";
        if (!title || !description) return null;

        return {
          id: typeof project.id === "string" && project.id ? project.id : crypto.randomUUID(),
          title,
          description,
          technologies: Array.isArray(project.technologies)
            ? project.technologies.filter(
                (item: unknown): item is string => typeof item === "string",
              )
            : typeof project.technologies === "string"
              ? parseProjectTechnologies(project.technologies)
              : [],
          projectLink: typeof project.projectLink === "string" ? project.projectLink : "",
          imageUrl: typeof project.imageUrl === "string" ? project.imageUrl : "",
          createdAt:
            typeof project.createdAt === "string" && project.createdAt
              ? project.createdAt
              : new Date().toISOString(),
        };
      })
      .filter((project): project is StoredPortfolioProject => Boolean(project));
  } catch {
    return [];
  }
}

export function saveStoredPortfolioProjects(projects: StoredPortfolioProject[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PORTFOLIO_PROJECTS_KEY, JSON.stringify(projects));
}

export function convertSupabaseProjects(projects: SupabaseProject[]): StoredPortfolioProject[] {
  return projects
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      technologies: project.technologies ? parseProjectTechnologies(project.technologies) : [],
      projectLink: project.link ?? "",
      imageUrl: project.image_url ?? "",
      createdAt: new Date().toISOString(),
    }));
}

export function readProjectImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Invalid image upload"));
      }
    };
    reader.onerror = () => reject(new Error("Invalid image upload"));
    reader.readAsDataURL(file);
  });
}
