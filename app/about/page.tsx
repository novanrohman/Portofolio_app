import NavBar from "@/app/components/NavBar";
import Reveal from "@/app/components/Reveal";
import { getContent } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { getCollection } from "@/lib/collections";

type ExpItem = { title: string; period?: string; role?: string; description?: string };
type CertItem = { title: string; description?: string };

export default async function About() {
  const locale = await getLocale();
  const aboutContent = await getContent("about", locale);
  const experiences = await getCollection<ExpItem>("experience");
  const organizations = await getCollection<ExpItem>("organization");
  const certificates = await getCollection<CertItem>("certificates");

  const renderList = (items: ExpItem[]) => (
    <ul className="mt-4 space-y-4">
      {items.map((e, i) => (
        <li key={`${e.title}-${i}`} className="text-white/90 card-anim">
          <div className="font-medium">{e.title}</div>
          {(e.period || e.role) && (
            <div className="text-sm text-white/70">
              {[e.period, e.role].filter(Boolean).join(" — ")}
            </div>
          )}
          {e.description && <p className="mt-1 text-sm text-white/60">{e.description}</p>}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 space-y-8">
        <Reveal className="glass-soft rounded-3xl p-8">
          <h1 className="text-2xl sm:text-3xl font-semibold">{aboutContent?.title ?? "About"}</h1>
          <p className="mt-4 text-white/80">{aboutContent?.body ?? "Update this section from the admin dashboard."}</p>
        </Reveal>

        {experiences.length > 0 && (
          <Reveal className="glass rounded-2xl p-6">
            <h2 className="text-xl sm:text-2xl font-semibold">Experience</h2>
            {renderList(experiences)}
          </Reveal>
        )}

        {organizations.length > 0 && (
          <Reveal className="glass rounded-2xl p-6">
            <h2 className="text-xl sm:text-2xl font-semibold">Organization</h2>
            {renderList(organizations)}
          </Reveal>
        )}

        {certificates.length > 0 && (
          <Reveal className="glass rounded-2xl p-6">
            <h2 className="text-xl sm:text-2xl font-semibold">Certificates</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {certificates.map((c, i) => (
                <li key={`${c.title}-${i}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 card-anim">
                  <div className="font-medium text-white/90">{c.title}</div>
                  {c.description && <p className="mt-1 text-sm text-white/60">{c.description}</p>}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </main>
    </div>
  );
}
