import Link from "next/link";
import NavBar from "@/app/components/NavBar";
import Reveal from "@/app/components/Reveal";
import { getContent } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { getProjectViews } from "@/lib/projectView";

export default async function Portfolio() {
  const locale = await getLocale();
  const portfolioContent = await getContent("portfolio", locale);
  const portfolioItems = await getProjectViews(locale); // pinned first, with meta
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="glass rounded-3xl p-8">
          <h1 className="text-2xl sm:text-3xl font-semibold">{portfolioContent?.title ?? "Portfolio"}</h1>
          <p className="mt-4 text-white/80">{portfolioContent?.body ?? "Showcase your work and manage projects from the admin dashboard."}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {portfolioItems.map((p) => (
              <article key={p.slug} className="flex flex-col overflow-hidden rounded-2xl border border-white/6 bg-white/4 glass-img card-anim">
                <Link href={`/porto/${p.slug}`} className="block">
                  <img
                    src={p.image || "/images/placeholder.svg"}
                    alt={p.title}
                    className="h-44 w-full object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/porto/${p.slug}`} className="font-semibold text-white hover:text-emerald-300">
                      {p.title}
                    </Link>
                    {p.featured && (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">★ Featured</span>
                    )}
                  </div>
                  {p.role && <p className="mt-0.5 text-xs text-white/60">{[p.role, p.team].filter(Boolean).join(" · ")}</p>}
                  <p className="mt-2 text-sm text-white/80">{p.summary}</p>
                  {p.tech.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tech.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/6 px-2 py-0.5 text-[11px] text-white/70">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-4 pt-1">
                    <Link
                      href={`/porto/${p.slug}`}
                      className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      {locale === "id" ? "Baca detail" : "Read details"} →
                    </Link>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/70 hover:text-white"
                      >
                        {locale === "id" ? "Kunjungi situs" : "Visit site"} ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </main>
    </div>
  );
}
