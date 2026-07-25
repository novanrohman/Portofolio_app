"use client";

import { useEffect, useState } from "react";

const inputCls =
  "mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900";

export default function ResumeEditor() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/content?slug=_cv")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.body === "string") setUrl(d.body);
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    if (!url.trim()) {
      setStatus("Masukkan URL CV dulu.");
      return;
    }
    setStatus("Saving...");
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "_cv", title: "cv", summary: "setting", body: url.trim() }),
    });
    setStatus(res.ok ? "Saved." : "Save failed.");
  };

  return (
    <section className="max-w-2xl space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h2 className="text-lg font-semibold">Resume / CV</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          URL file CV. Taruh <code>cv.pdf</code> di folder <code>public/</code> lalu isi{" "}
          <code>/cv.pdf</code>, atau tempel link eksternal (Google Drive, dll).
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">CV URL</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} placeholder="/cv.pdf atau https://..." />
      </div>
      <div className="flex items-center gap-4 pt-2">
        <button onClick={save} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
          Save CV link
        </button>
        {url.trim() && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
            Preview
          </a>
        )}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{status}</p>
      </div>
    </section>
  );
}
