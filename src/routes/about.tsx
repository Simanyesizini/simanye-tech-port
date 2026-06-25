import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { Target, Compass, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type AboutContent = {
  personal_background: string;
  professional_background: string;
  vision: string;
  mission: string;
  career_goals: string;
  interests: string;
};

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Simanye Tevin Sizini" },
      { name: "description", content: "About Simanye Tevin Sizini — background, vision, mission and career goals as an IT Support professional." },
    ],
  }),
  component: AboutPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function AboutPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("about_content").select("*").limit(1);
      if (data && data.length > 0) {
        setAboutContent(data[0]);
      }
    })();
  }, []);

  const content = aboutContent || {
    personal_background: "I am Simanye Tevin Sizini, a young IT professional with a calm, methodical approach to problem-solving. I value continuous learning, clear communication, and supporting the people behind the technology I work with.",
    professional_background: "I recently completed a Diploma in IT Support Services at Nelson Mandela University after earning a Higher Certificate in IT User Support Services. My academic journey has given me a strong foundation in systems, troubleshooting and end-user support.",
    vision: "Becoming a skilled IT Support professional contributing to efficient IT environments.",
    mission: "To continuously improve technical and problem-solving skills while delivering reliable IT support.",
    career_goals: "Entry-level IT Support → Systems Support → IT Specialist roles.",
    interests: "IT Support · Systems troubleshooting · Networking · End-user support.",
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title="A motivated entry-level IT Support professional"
        description="Structured academic training, practical project experience, and a growing foundation through the CAPACITI program."
      />
      <Container>
        <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            <Section title="Personal Background">
              {content.personal_background}
            </Section>
            <Section title="Professional Background">
              {content.professional_background}
            </Section>
            <Section title="CAPACITI INTERN · April 2026 – Present">
              I am currently a candidate in the CAPACITI program — a structured IT training and workplace-readiness program where I am building real-world technical and professional skills, collaborating in teams, and gaining exposure to industry systems and practices.
            </Section>
            <Section title="Reflective Positioning">
              <ul className="mt-2 space-y-3">
                <li><span className="font-medium text-foreground">What motivates me?</span> Helping people use technology with confidence, and the quiet satisfaction of resolving a tricky technical issue.</li>
                <li><span className="font-medium text-foreground">What impact do I want to make?</span> To build dependable IT environments where teams can focus on their work without friction.</li>
              </ul>
            </Section>
          </div>

          <aside className="space-y-6">
            {[
              { icon: Compass, title: "Vision", body: content.vision },
              { icon: Target, title: "Mission", body: content.mission },
              { icon: TrendingUp, title: "Career Goals", body: content.career_goals },
              { icon: Sparkles, title: "Professional Interests", body: content.interests },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border border-border bg-card p-6">
                <c.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-base font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </aside>
        </div>
      </Container>
    </SiteLayout>
  );
}
