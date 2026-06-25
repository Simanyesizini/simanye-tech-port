import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { GraduationCap, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Education & Achievements — Simanye Tevin Sizini" },
      { name: "description", content: "Education timeline and academic achievements of Simanye Tevin Sizini." },
    ],
  }),
  component: EducationPage,
});

type Education = {
  id: string;
  institution: string;
  field_of_study: string;
  degree: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  display_order: number;
};

const defaultAchievements = [
  "Participation in IT academic projects across the diploma program",
  "Completion of the Special Exam Application System final-year project",
  "Ongoing CAPACITI training participation and professional development",
];

function EducationPage() {
  const [education, setEducation] = useState<Education[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("education").select("*").order("display_order");
      setEducation((data as Education[]) ?? []);
    })();
  }, []);

  // Use fetched data or fallback to defaults
  const educationList = education.length > 0 ? education : [
    { id: "1", institution: "Nelson Mandela University", field_of_study: "IT Support Services", degree: "Diploma", start_date: "2023", end_date: "2025", description: null, display_order: 0 },
    { id: "2", institution: "Nelson Mandela University", field_of_study: "IT User Support Services", degree: "Higher Certificate", start_date: "2021", end_date: "2022", description: null, display_order: 1 },
    { id: "3", institution: "Jali High School", field_of_study: "General Education", degree: "National Senior Certificate", start_date: null, end_date: "2019", description: null, display_order: 2 },
  ];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Education & Achievements"
        title="Academic foundation and milestones"
        description="A structured journey from matric through diploma-level IT studies, supported by ongoing professional training."
      />
      <Container>
        <div className="mx-auto max-w-6xl">
          <section className="relative overflow-hidden px-4 py-8 md:px-0">
            <div className="mb-10 flex flex-col gap-3 text-center md:mb-14">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Timeline</p>
              <h2 className="text-2xl font-semibold sm:text-3xl">Academic journey in a modern timeline</h2>
              <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
                Each milestone includes qualification details, institution and dates in a polished vertical layout that works across desktop, tablet and mobile.
              </p>
            </div>
            <ol className="relative space-y-12">
              <span className="pointer-events-none absolute left-4 top-[1.875rem] bottom-[1.875rem] hidden w-px bg-border md:block md:left-1/2" />
              {educationList.map((e, index) => {
                const isLeft = index % 2 === 0;
                const dateLabel = e.start_date && e.end_date ? `${e.start_date} — ${e.end_date}` : e.end_date || e.start_date || "Ongoing";
                return (
                  <li key={e.id} className="relative">
                    <span className="absolute top-5 left-4 h-5 w-5 rounded-full bg-primary ring-8 ring-background md:left-1/2 md:-translate-x-1/2" />
                    <div className={`md:flex md:items-start ${isLeft ? "md:justify-end" : "md:justify-start"}`}>
                      <div className={`relative w-full rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform motion-safe:duration-300 hover:-translate-y-1 ${isLeft ? "md:mr-auto md:w-5/12" : "md:ml-auto md:w-5/12"}`}>
                        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary sm:text-sm">
                          <span>{dateLabel}</span>
                          <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] text-primary sm:text-xs">
                            {e.degree}
                          </span>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold leading-tight">{e.field_of_study}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{e.institution}</p>
                        {e.description && <p className="mt-3 text-sm leading-6 text-foreground">{e.description}</p>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-xl font-semibold">Achievements</h2>
              <ul className="mt-6 space-y-3">
                {defaultAchievements.map((a) => (
                  <li key={a} className="flex gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
                    <Award className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm leading-6 text-foreground">{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-dashed border-border bg-surface p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Leadership & Involvement</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Open to documenting leadership roles, competitions and academic involvement as they grow.
              </p>
            </div>
          </section>
        </div>
      </Container>
    </SiteLayout>
  );
}
