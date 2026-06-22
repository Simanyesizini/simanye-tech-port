import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { GraduationCap, Award } from "lucide-react";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Education & Achievements — Simanye Tevin Sizini" },
      { name: "description", content: "Education timeline and academic achievements of Simanye Tevin Sizini." },
    ],
  }),
  component: EducationPage,
});

const education = [
  { year: "2025", title: "Diploma in IT Support Services", org: "Nelson Mandela University" },
  { year: "2022", title: "Higher Certificate in IT User Support Services", org: "Nelson Mandela University" },
  { year: "2019", title: "National Senior Certificate (Matric)", org: "Jali High School" },
];

const achievements = [
  "Participation in IT academic projects across the diploma program",
  "Completion of the Special Exam Application System final-year project",
  "Ongoing CAPACITI training participation and professional development",
];

function EducationPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Education & Achievements"
        title="Academic foundation and milestones"
        description="A structured journey from matric through diploma-level IT studies, supported by ongoing professional training."
      />
      <Container>
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-xl font-semibold">Education Timeline</h2>
            <ol className="mt-8 relative border-l border-border pl-8">
              {education.map((e) => (
                <li key={e.year} className="mb-10 last:mb-0">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <GraduationCap className="h-3.5 w-3.5" />
                  </span>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{e.year}</div>
                  <h3 className="mt-1 text-lg font-semibold">{e.title}</h3>
                  <p className="text-sm text-muted-foreground">{e.org}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Achievements</h2>
            <ul className="mt-6 space-y-3">
              {achievements.map((a) => (
                <li key={a} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-foreground">{a}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-dashed border-border bg-surface p-6">
              <h3 className="text-sm font-semibold">Leadership & Involvement</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Open to documenting leadership roles, competitions and academic involvement as they grow.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </SiteLayout>
  );
}
