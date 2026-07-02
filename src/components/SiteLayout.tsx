import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Mail, Phone, Github, Linkedin } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/education", label: "Education" },
  { to: "/experience", label: "Experience" },
  { to: "/projects", label: "Projects" },
  { to: "/certifications", label: "Certifications" },
  { to: "/contact", label: "Contact" },
] as const;

type FooterContent = {
  copyright_text: string;
};

type ContactInfo = {
  email: string;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
};

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
          Simanye Sizini
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-medium text-primary bg-accent" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="mx-auto flex max-w-6xl flex-col px-5 py-2 sm:px-8">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                activeProps={{ className: "rounded-md px-3 py-2.5 text-sm font-medium text-primary bg-accent" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: contactData }, { data: footerData }] = await Promise.all([
        supabase.from("contact_info").select("*").limit(1),
        supabase.from("footer_content").select("*").limit(1),
      ]);

      if (contactData && contactData.length > 0) {
        setContactInfo(contactData[0]);
      }
      if (footerData && footerData.length > 0) {
        setFooterContent(footerData[0]);
      }
    })();
  }, []);

  const email = contactInfo?.email ?? "Simanyetevin@gmail.com";
  const phone = contactInfo?.phone ?? "064 095 1511";
  const githubUrl = contactInfo?.github ?? "https://github.com/Simanyesizini";
  const linkedInUrl = contactInfo?.linkedin ?? "https://linkedin.com/in/simanye-sizini-59169a340";
  const copyrightText = footerContent?.copyright_text ?? "© 2026 Simanye Tevin Sizini. All rights reserved.";

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold">Quick Links</h4>
          <ul className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-muted-foreground hover:text-foreground">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Mail className="h-4 w-4" /> {email}
              </a>
            </li>
            <li>
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </li>
            <li>
              <a href={githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Github className="h-4 w-4" /> GitHub
              </a>
            </li>
            <li>
              <a href={linkedInUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8 text-xs text-muted-foreground">
          {copyrightText}
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{description}</p>}
      </div>
    </section>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 ${className}`}>{children}</div>;
}
