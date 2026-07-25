import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import Reveal from "@/app/components/Reveal";
import Counter from "@/app/components/Counter";
import { getContent, getAllProjects } from "@/lib/db";
import { getLocale, getUi } from "@/lib/i18n";
import { getCollection } from "@/lib/collections";

export default async function Home(){
  const locale = await getLocale();
  const t = getUi(locale).home;
  const homeContent = await getContent("home", locale);
  const projects = await getAllProjects(locale);
  const featured = projects[0];
  const skills = await getCollection<string>("skills");
  const experiences = await getCollection("experience");
  const contactLinks = await getCollection<{ label: string; href: string }>("contact");
  const cvRow = await getContent("_cv");
  // Custom PDF URL if set in admin, otherwise the generated ATS PDF (direct download).
  const cvUrl = (typeof cvRow?.body === "string" && cvRow.body.trim()) || "/api/cv";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 relative overflow-x-clip">
        <div className="hero-blob blob-1 hidden sm:block" style={{ width: 340, height: 240, left: -60, top: -40, background: "radial-gradient(circle, rgba(99,102,241,0.45), rgba(99,102,241,0.12))" }} />
        <div className="hero-blob blob-2 hidden sm:block" style={{ width: 420, height: 300, right: -80, bottom: -60, background: "radial-gradient(circle, rgba(16,185,129,0.4), rgba(16,185,129,0.08))" }} />

        <Reveal className="glass rounded-3xl p-6 sm:p-10 md:p-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">{homeContent?.title ?? "Your modern portfolio"}</h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-white/80">{homeContent?.summary ?? "Build a flexible portfolio with editable content."}</p>
          <p className="mt-6 text-sm sm:text-base text-white/70 max-w-12xl mx-auto">{homeContent?.body ?? "Use the admin panel to update your story, contact, and featured work."}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={cvUrl}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              {t.downloadCv}
            </a>
            <a href="/porto" className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/90 transition-colors hover:bg-white/10">
              {t.featured}
            </a>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <Reveal className="glass-soft rounded-3xl p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="glass card-anim rounded-3xl p-5 text-left">
                <p className="text-sm uppercase tracking-[0.24em] text-white/60">{t.projects}</p>
                <Counter target={projects.length} suffix="+" className="mt-2 block text-2xl sm:text-3xl font-bold" />
              </div>
              <div className="glass card-anim rounded-3xl p-5 text-left">
                <p className="text-sm uppercase tracking-[0.24em] text-white/60">{t.experience}</p>
                <p className="mt-2 block text-2xl sm:text-3xl font-bold" ><Counter target={experiences.length} suffix="+" /></p>
              </div>
              <div className="glass card-anim rounded-3xl p-5 text-left">
                <p className="text-sm uppercase tracking-[0.24em] text-white/60">{t.design}</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold">UI/UX + Web</p>
              </div>
            </div>

            {/* Tech stack */}
            <div className="mt-6">
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">{t.techStack}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Currently */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-white/60">{t.currently}</p>
              <p className="mt-2 text-white/80">
                Managing IT risk &amp; system security at Nusapala Berkah Autonomous —
                bridging full-stack development with security and compliance.
              </p>
            </div>

            {/* Links */}
            <div className="mt-6 flex flex-wrap gap-3">
              {contactLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/10"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/contact"
                className="rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
              >
                {t.getInTouch}
              </a>
            </div>
          </Reveal>

          <Reveal className="glass rounded-3xl p-8 card-anim pulse-card">
            <p className="text-sm uppercase tracking-[0.24em] text-white/60">{t.featured}</p>
            <img src={featured?.image ?? "/images/placeholder.svg"} alt={featured?.title ?? "Featured project"} className="mt-4 w-full rounded-2xl border border-white/10" />
            <h2 className="mt-3 text-2xl font-semibold">{featured?.title ?? "Your featured project"}</h2>
            <p className="mt-3 text-white/80">{featured?.summary ?? "A selected project from your portfolio."}</p>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
