import Link from "next/link";
import { notFound } from "next/navigation";
import NavBar from "@/app/components/NavBar";
import Reveal from "@/app/components/Reveal";
import { getLocale } from "@/lib/i18n";
import { getProjectViews } from "@/lib/projectView";

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const projects = await getProjectViews(locale);
  const p = projects.find((x) => x.slug === decodeURIComponent(slug));
  if (!p) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Link href="/porto" className="text-sm text-white/60 transition-colors hover:text-white">
          ← {locale === "id" ? "Kembali ke Portfolio" : "Back to Portfolio"}
        </Link>

        <Reveal className="glass mt-4 rounded-3xl p-6 sm:p-8">
          {p.image && (
            <img src={p.image} alt={p.title} className="mb-6 w-full rounded-2xl border border-white/10 object-cover" />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">{p.title}</h1>
            {p.featured && (
              <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">★ Featured</span>
            )}
          </div>

          {(p.role || p.team) && (
            <p className="mt-1 text-sm text-white/60">{[p.role, p.team].filter(Boolean).join(" · ")}</p>
          )}

          {p.summary && <p className="mt-4 text-lg text-white/80">{p.summary}</p>}

          {p.tech.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.tech.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">{tag}</span>
              ))}
            </div>
          )}

          {p.body && (
            <div
              className="rich-content mt-6 text-white/80"
              dangerouslySetInnerHTML={{ __html: p.body }}
            />
          )}

          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-lg"
            >
              {locale === "id" ? "Kunjungi situs" : "Visit site"} →
            </a>
          )}
        </Reveal>
      </main>
    </div>
  );
}
