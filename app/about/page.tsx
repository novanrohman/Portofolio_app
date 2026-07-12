import NavBar from "@/app/components/NavBar";
import Reveal from "@/app/components/Reveal";
import { getContent } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { experiences } from "@/lib/portfolioData";

export default async function About() {
  const locale = await getLocale();
  const aboutContent = await getContent("about", locale);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 space-y-8">
        <Reveal className="glass-soft rounded-3xl p-8">
          <h1 className="text-2xl sm:text-3xl font-semibold">{aboutContent?.title ?? "About"}</h1>
          <p className="mt-4 text-white/80">{aboutContent?.body ?? "Update this section from the admin dashboard."}</p>
        </Reveal>

        <Reveal className="glass rounded-2xl p-6">
          <h2 className="text-2xl font-semibold">Experience</h2>
          <ul className="mt-4 space-y-4">
            {experiences.map((e) => (
              <li key={e.title} className="text-white/90 card-anim">
                <div className="font-medium">{e.title}</div>
                <div className="text-sm text-white/70">{e.period} — {e.role}</div>
              </li>
            ))}
          </ul>
        </Reveal>
      </main>
    </div>
  );
}
