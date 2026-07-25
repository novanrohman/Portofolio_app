"use client";

import { useEffect, useState } from "react";

type ContentItem = { slug: string; title: string };
type Locale = "id" | "en";
type Bilingual = { id: string; en: string };
type Form = { slug: string; title: Bilingual; summary: Bilingual; body: Bilingual };

const inputCls =
  "mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900";
const labelCls = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

function toBilingual(value: unknown): Bilingual {
  if (value && typeof value === "object") {
    const v = value as Partial<Bilingual>;
    return { id: v.id ?? "", en: v.en ?? "" };
  }
  const s = typeof value === "string" ? value : "";
  return { id: s, en: s };
}

const emptyForm: Form = {
  slug: "",
  title: { id: "", en: "" },
  summary: { id: "", en: "" },
  body: { id: "", en: "" },
};

export default function ContentEditor() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [form, setForm] = useState<Form>(emptyForm);
  const [editLang, setEditLang] = useState<Locale>("id");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data: ContentItem[]) => {
        // Hide reserved collection rows (_skills, _experience, ...).
        const visible = data.filter((c) => !c.slug.startsWith("_"));
        setItems(visible);
        if (visible.length > 0) setSelected(visible[0].slug);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/content?slug=${selected}&raw=1`)
      .then((r) => r.json())
      .then((data) =>
        setForm({
          slug: data.slug,
          title: toBilingual(data.title),
          summary: toBilingual(data.summary),
          body: toBilingual(data.body),
        })
      );
  }, [selected]);

  const setField = (field: "title" | "summary" | "body", value: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [editLang]: value } }));

  const save = async () => {
    setStatus("Saving...");
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await res.json();
    setStatus(res.ok ? "Saved." : result.error ?? "Save failed.");
    if (res.ok)
      setItems((prev) =>
        prev.map((it) => (it.slug === result.slug ? { ...it, title: toBilingual(result.title).id } : it))
      );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Pages</p>
        <div className="mt-4 space-y-2">
          {items.map((it) => (
            <button
              key={it.slug}
              onClick={() => setSelected(it.slug)}
              className={`block w-full truncate rounded-2xl px-4 py-2.5 text-left text-sm transition ${
                it.slug === selected
                  ? "bg-blue-600 text-white"
                  : "bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {it.title || it.slug}
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Language:</span>
          <div className="inline-flex rounded-xl border border-zinc-300 p-0.5 dark:border-zinc-700">
            {(["id", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setEditLang(l)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase transition ${
                  editLang === l ? "bg-blue-600 text-white" : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Slug</label>
          <input value={form.slug} readOnly className={`${inputCls} opacity-70`} />
        </div>
        <div>
          <label className={labelCls}>Title ({editLang.toUpperCase()})</label>
          <input value={form.title[editLang]} onChange={(e) => setField("title", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Summary ({editLang.toUpperCase()})</label>
          <textarea value={form.summary[editLang]} onChange={(e) => setField("summary", e.target.value)} rows={3} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Body ({editLang.toUpperCase()})</label>
          <textarea value={form.body[editLang]} onChange={(e) => setField("body", e.target.value)} rows={8} className={inputCls} />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button onClick={save} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
            Save changes
          </button>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{status}</p>
        </div>
      </section>
    </div>
  );
}
