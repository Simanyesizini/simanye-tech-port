import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout, PageHeader, Container } from "@/components/SiteLayout";
import { Mail, Phone, Linkedin, Download, Send, CheckCircle2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Simanye Tevin Sizini" },
      { name: "description", content: "Get in touch with Simanye Tevin Sizini — email, phone, LinkedIn and CV download." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    const subject = encodeURIComponent(`Portfolio enquiry from ${parsed.data.name}`);
    const body = encodeURIComponent(`${parsed.data.message}\n\n— ${parsed.data.name} (${parsed.data.email})`);
    window.location.href = `mailto:Simanyetevin@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Let's get in touch"
        description="Open to entry-level IT Support roles, internships and professional opportunities."
      />
      <Container>
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <h2 className="text-lg font-semibold">My Curriculum Vitae</h2>
            <p className="mt-1 text-sm text-muted-foreground">Download a full PDF copy of my CV.</p>
          </div>
          <a
            href="/Simanye_Tevin_Sizini_CV.pdf"
            download
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="h-4 w-4" /> Download CV
          </a>
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Contact details</h2>
            <a href="mailto:Simanyetevin@gmail.com" className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted">
              <Mail className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="text-sm font-medium">Simanyetevin@gmail.com</div>
              </div>
            </a>
            <a href="tel:+27640951511" className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted">
              <Phone className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Phone</div>
                <div className="text-sm font-medium">064 095 1511</div>
              </div>
            </a>
            <a href="https://linkedin.com/in/simanye-sizini-59169a340" target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted">
              <Linkedin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">LinkedIn</div>
                <div className="text-sm font-medium">Simanye Sizini</div>
              </div>
            </a>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Send a message</h2>
            <div className="mt-6 space-y-5">
              <Field id="name" label="Full Name" error={errors.name}>
                <input id="name" name="name" maxLength={100} className="input" placeholder="Your full name" />
              </Field>
              <Field id="email" label="Email" error={errors.email}>
                <input id="email" name="email" type="email" maxLength={255} className="input" placeholder="you@example.com" />
              </Field>
              <Field id="message" label="Message" error={errors.message}>
                <textarea id="message" name="message" rows={5} maxLength={1000} className="input resize-y" placeholder="How can I help?" />
              </Field>
              <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                {submitted ? <><CheckCircle2 className="h-4 w-4" /> Opened in your email app</> : <><Send className="h-4 w-4" /> Send Message</>}
              </button>
            </div>
          </form>
        </div>
      </Container>

      <style>{`
        .input { width: 100%; border-radius: 0.5rem; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.625rem 0.75rem; font-size: 0.875rem; color: var(--color-foreground); outline: none; transition: border-color .15s, box-shadow .15s; }
        .input::placeholder { color: var(--color-muted-foreground); }
        .input:focus { border-color: var(--color-ring); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-ring) 25%, transparent); }
      `}</style>
    </SiteLayout>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
