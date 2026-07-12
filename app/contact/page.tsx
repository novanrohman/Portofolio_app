import NavBar from "@/app/components/NavBar";
import Reveal from "@/app/components/Reveal";
import { getContent } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { contactLinks } from "@/lib/portfolioData";

export default async function Contact() {
  const locale = await getLocale();
  const contactContent = await getContent("contact", locale);
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
