import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Download, Headphones, Network, Wrench, Users } from "lucide-react";
import profileImg from "@/assets/profile.jpg";
import { SiteLayout, Container } from "@/components/SiteLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simanye Tevin Sizini — IT Support Professional" },
      { name: "description", content: "Entry-level IT Support professional, Diploma in IT Support Services graduate, and CAPACITI Candidate." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              CAPACITI Candidate · April 2026 – Present
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] sm:text-6xl">
              Simanye Tevin Sizini
            </h1>
            <p className="mt-3 text-lg font-medium text-primary sm:text-xl">
              IT Support Technician · IT Support Graduate
            </p>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Passionate about solving technical problems and supporting efficient digital environments.
            </p>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              I recently completed a Diploma in IT Support Services and am currently gaining hands-on industry experience through the CAPACITI program — focused on technical support, systems, and problem-solving.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/projects" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                View Projects <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <Mail className="h-4 w-4" /> Contact Me
              </Link>
              <a href="/Simanye_Tevin_Sizini_CV.pdf" download className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <Download className="h-4 w-4" /> Download CV
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-4 rounded-2xl bg-accent/60 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <img src={profileImg} alt="Portrait of Simanye Tevin Sizini" className="aspect-[4/5] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Container>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Headphones, title: "IT Support", desc: "Reliable end-user and technical support." },
            { icon: Wrench, title: "Troubleshooting", desc: "Diagnosing and resolving systems issues." },
            { icon: Network, title: "Networking", desc: "Foundational networking knowledge." },
            { icon: Users, title: "End-user Support", desc: "Clear, patient communication with users." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-sm">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </SiteLayout>
  );
}
