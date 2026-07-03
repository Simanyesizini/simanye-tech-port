export const PORTFOLIO_PROJECTS_KEY = "portfolio_projects";

export type StoredPortfolioProject = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  projectLink: string;
  githubLink: string;
  liveDemoLink: string;
  category: string;
  status: string;
  features: string[];
  imageUrl: string;
  createdAt: string;
};

type SupabaseProject = {
  id: string;
  title: string;
  description: string;
  technologies: string | null;
  link: string | null;
  github_link?: string | null;
  live_demo_link?: string | null;
  category?: string | null;
  status?: string | null;
  features?: string | null;
  image_url: string | null;
  display_order?: number;
};

export function parseProjectTechnologies(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseProjectFeatures(value: string): string[] {
  return value
    .split(/\r?\n|,|;/)
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
        githubLink: typeof project.githubLink === "string" ? project.githubLink : "",
        liveDemoLink: typeof project.liveDemoLink === "string" ? project.liveDemoLink : "",
        category: typeof project.category === "string" ? project.category : "",
        status: typeof project.status === "string" ? project.status : "",
        features: Array.isArray(project.features)
          ? project.features.filter((item: unknown): item is string => typeof item === "string")
          : typeof project.features === "string"
          ? parseProjectFeatures(project.features)
          : [],
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

const DEFAULT_PROJECT_IMAGE_URL = "https://i.postimg.cc/6p9bvyF4/Reliable.png";

export const DEFAULT_PORTFOLIO_PROJECT: StoredPortfolioProject = {
  id: "74c7d9ef-cc36-490f-a9ef-9d6ce6370732",
  title: "Shop Smarter with Reliable",
  description:
    "A modern AI-powered online marketplace designed to provide a seamless and intelligent shopping experience. The platform features AI-powered customer support, secure user authentication, smart product search and filtering, shopping cart functionality, order management, and a clean, responsive user interface that enhances the overall customer experience.",
  technologies: ["React", "TypeScript", "Tailwind CSS", "Supabase", "Vite", "AI Integration", "Responsive Design"],
  projectLink: "https://assist-smart-commerce.lovable.app",
  githubLink: "",
  liveDemoLink: "https://assist-smart-commerce.lovable.app",
  category: "Web Application",
  status: "Completed",
  features: [
    "AI-powered customer support",
    "Secure user authentication",
    "Smart product search",
    "Product categories",
    "Shopping cart",
    "Order management",
    "Responsive design",
    "Modern UI/UX",
    "Fast performance",
    "Secure database integration",
  ],
  imageUrl: DEFAULT_PROJECT_IMAGE_URL,
  createdAt: new Date().toISOString(),
};

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
      githubLink: project.github_link ?? "",
      liveDemoLink: project.live_demo_link ?? "",
      category: project.category ?? "",
      status: project.status ?? "",
      features: project.features ? parseProjectFeatures(project.features) : [],
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
