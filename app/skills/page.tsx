import NavBar from "@/app/components/NavBar";
import Reveal from "@/app/components/Reveal";
import { getContent } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { skills } from "@/lib/portfolioData";

export default async function Skills() {
  const locale = await getLocale();
  const skillsContent = await getContent("skills", locale);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="glass-soft rounded-2xl p-8">
          <h1 className="text-2xl sm:text-3xl font-semibold">{skillsContent?.title ?? "Skills"}</h1>
          <p className="mt-4 text-white/80">{skillsContent?.body ?? "Keep this section updated from the admin panel."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {skills.map((s) => (
              <span key={s} className="rounded-full bg-white/8 px-3 py-1 text-sm text-white/90 card-anim">{s}</span>
            ))}
          </div>
        </Reveal>
      </main>
    </div>
  );
}
