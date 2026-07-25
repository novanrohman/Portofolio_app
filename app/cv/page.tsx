import type { Metadata } from "next";
import { getContent } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { getCollection } from "@/lib/collections";

export const metadata: Metadata = { title: "Curriculum Vitae" };

type Profile = { name?: string; title?: string; email?: string; phone?: string; location?: string };
type ExpItem = { title?: string; period?: string; role?: string; description?: string };
type EduItem = { title?: string; role?: string; period?: string };
type CertItem = { title?: string; description?: string };
type Link = { label?: string; href?: string };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="border-b border-zinc-300 pb-1 text-sm font-bold uppercase tracking-widest text-zinc-800">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-800">{children}</div>
    </section>
  );
}

function ExperienceList({ items }: { items: ExpItem[] }) {
  return (
    <>
      {items.map((e, i) => (
        <div key={i}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="font-semibold text-zinc-900">
              {e.role ? `${e.role}` : e.title}
              {e.role && e.title ? ` — ${e.title}` : ""}
            </span>
            {e.period && <span className="text-xs text-zinc-600">{e.period}</span>}
          </div>
          {e.description && <p className="mt-1 text-zinc-700">{e.description}</p>}
        </div>
      ))}
    </>
  );
}

export default async function CVPage() {
  const locale = await getLocale();
  const [profileArr, home, skills, experience, organization, education, certificates, contact] =
    await Promise.all([
      getCollection<Profile>("profile"),
      getContent("home", locale),
      getCollection<string>("skills"),
      getCollection<ExpItem>("experience"),
      getCollection<ExpItem>("organization"),
      getCollection<EduItem>("education"),
      getCollection<CertItem>("certificates"),
      getCollection<Link>("contact"),
    ]);

  const profile = profileArr[0] ?? {};
  const summary = home?.body ?? "";
  const contactLine = [profile.email, profile.phone, profile.location].filter(Boolean).join("  ·  ");

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-10 print:px-0 print:py-0">
        <div className="no-print mb-6 flex justify-end">
          <a
            href="/api/cv"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            Download PDF
          </a>
        </div>

        {/* Header */}
        <header className="border-b-2 border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">{profile.name || "Your Name"}</h1>
          {profile.title && <p className="mt-1 text-base text-zinc-700">{profile.title}</p>}
          {contactLine && <p className="mt-2 text-sm text-zinc-600">{contactLine}</p>}
          {contact.length > 0 && (
            <p className="mt-1 text-sm text-zinc-600">
              {contact
                .map((c) => c.href?.replace(/^https?:\/\/(www\.)?/, ""))
                .filter(Boolean)
                .join("  ·  ")}
            </p>
          )}
        </header>

        {summary && (
          <Section title="Professional Summary">
            <p>{summary}</p>
          </Section>
        )}

        {skills.length > 0 && (
          <Section title="Skills">
            <p>{skills.join(", ")}</p>
          </Section>
        )}

        {experience.length > 0 && (
          <Section title="Work Experience">
            <ExperienceList items={experience} />
          </Section>
        )}

        {organization.length > 0 && (
          <Section title="Organizational Experience">
            <ExperienceList items={organization} />
          </Section>
        )}

        {education.length > 0 && (
          <Section title="Education">
            {education.map((e, i) => (
              <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span>
                  <span className="font-semibold text-zinc-900">{e.title}</span>
                  {e.role ? ` — ${e.role}` : ""}
                </span>
                {e.period && <span className="text-xs text-zinc-600">{e.period}</span>}
              </div>
            ))}
          </Section>
        )}

        {certificates.length > 0 && (
          <Section title="Certifications">
            <ul className="list-disc space-y-1 pl-5">
              {certificates.map((c, i) => (
                <li key={i}>
                  <span className="font-medium">{c.title}</span>
                  {c.description ? ` — ${c.description}` : ""}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}
