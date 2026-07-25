import NavBar from "@/app/components/NavBar";
import Reveal from "@/app/components/Reveal";
import { getContent } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { getCollection } from "@/lib/collections";

type ContactLink = { label: string; href: string };

export default async function Contact() {
  const locale = await getLocale();
  const contactContent = await getContent("contact", locale);
  const contactLinks = await getCollection<ContactLink>("contact");
  const cvRow = await getContent("_cv");
  const cvUrl = (typeof cvRow?.body === "string" && cvRow.body.trim()) || "/api/cv";
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="glass rounded-3xl p-8">
          <h1 className="text-2xl sm:text-3xl font-semibold">{contactContent?.title ?? "Contact"}</h1>
          <p className="mt-4 text-white/80">{contactContent?.body ?? "Update your contact details from the admin dashboard."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="https://api.whatsapp.com/send?phone=6281276995583&text=Halo!" className="rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 px-5 py-2 text-white card-anim">WhatsApp</a>
            <a href="mailto:novan@example.com" className="rounded-full border border-white/10 px-5 py-2 text-white/90 card-anim">Email</a>
            <a
              href={cvUrl}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-white/90 card-anim hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              {locale === "id" ? "Unduh CV" : "Download CV"}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {contactLinks.map((c) => (
              <a key={c.href} href={c.href} className="text-white/80 hover:text-white">{c.label}</a>
            ))}
          </div>
        </Reveal>
      </main>
    </div>
  );
}
