"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Locale = "id" | "en";
const LOCALES: Locale[] = ["id", "en"];

export default function LangToggle() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("id");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)locale=(id|en)/);
    if (match) setLocale(match[1] as Locale);
  }, []);

  const change = (next: Locale) => {
    if (next === locale) return;
    // 1 year, site-wide
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
    setLocale(next);
    router.refresh(); // re-render server components with the new cookie
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-white/15 p-0.5 text-xs font-semibold"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => change(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
            locale === l ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
