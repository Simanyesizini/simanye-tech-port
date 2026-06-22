import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { Briefcase, BookOpen, HeartHandshake, Users } from "lucide-react";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Work Experience — Simanye Tevin Sizini" },
      { name: "description", content: "Professional and academic experience of Simanye Tevin Sizini, including the CAPACITI program." },
    ],
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Experience"
        title="Hands-on learning and applied IT exposure"
        description="Structured training, academic projects and collaborative work that shape my professional foundation."
      />
      <Container>
        <article className="rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Briefcase className="h-3.5 w-3.5" /> Current
              </div>
              <h2 className="mt-2 text-2xl font-semibold">CAPACITI Candidate</h2>
              <p className="text-sm text-muted-foreground">CAPACITI Program</p>
            </div>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              April 2026 – Present
            </span>
          </div>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            A structured IT training program focused on technical support, workplace readiness, teamwork, and real-world IT systems exposure.
            I am developing practical skills in IT support workflows, professional communication and team-based problem solving.
          </p>
          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li>• Technical support fundamentals</li>
            <li>• Workplace readiness & professional skills</li>
            <li>• Team collaboration and communication</li>
            <li>• Exposure to real-world IT systems</li>
          </ul>
        </article>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: BookOpen, title: "Academic Projects", body: "Final-year and coursework projects applying IT support and systems concepts to real scenarios." },
            { icon: Users, title: "Team-based Learning", body: "Collaborative university work building communication, planning and shared problem-solving skills." },
            { icon: HeartHandshake, title: "Informal IT Support", body: "Helping peers and family with day-to-day technical issues, from devices to software setup." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-card p-6">
              <c.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-dashed border-border bg-surface p-6">
          <h3 className="text-sm font-semibold">Reflection</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">What responsibilities have helped me grow professionally?</span> Owning project deliverables, communicating clearly within teams, and approaching unfamiliar technical issues with patience and structure.
          </p>
        </div>
      </Container>
    </SiteLayout>
  );
}
