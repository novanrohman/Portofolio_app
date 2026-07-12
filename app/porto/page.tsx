import NavBar from "@/app/components/NavBar";
import Reveal from "@/app/components/Reveal";
import { getContent, getAllProjects } from "@/lib/db";
import { getLocale } from "@/lib/i18n";

export default async function Portfolio() {
  const locale = await getLocale();
  const portfolioContent = getContent("portfolio", locale);
  const portfolioItems = getAllProjects(locale);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="glass rounded-3xl p-8">
          <h1 className="text-3xl font-semibold">{portfolioContent?.title ?? "Portfolio"}</h1>
          <p className="mt-4 text-white/80">{portfolioContent?.body ?? "Showcase your work and manage projects from the admin dashboard."}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {portfolioItems.map((p) => (
              <article key={p.title} className="rounded-2xl border border-white/6 p-4 bg-white/4 glass-img card-anim reveal">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{p.title}</h3>
                    <p className="mt-2 text-white/80">{p.summary}</p>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm text-emerald-300 hover:text-emerald-200"
                      >
                        Visit site →
                      </a>
                    )}
                  </div>
                  {p.image && (
                    <img src={p.image} alt={p.title} className="w-28 h-20 object-cover rounded" />
                  )}
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </main>
    </div>
  );
}
