"use client";

import { useEffect, useRef, useState } from "react";
import RichTextEditor from "@/app/admin/RichTextEditor";

type Locale = "id" | "en";
type Bilingual = { id: string; en: string };
type Project = {
  slug: string;
  title: Bilingual;
  summary: Bilingual;
  body: Bilingual;
  image: string;
  url: string;
};
type Meta = { slug: string; role?: string; team?: string; tech?: string[] };
// role/team/tech held as strings in the form (tech = comma separated).
type FormProject = Project & { role: string; team: string; tech: string };

const inputCls =
  "mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900";
const labelCls = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const blank = (): FormProject => ({
  slug: "",
  title: { id: "", en: "" },
  summary: { id: "", en: "" },
  body: { id: "", en: "" },
  image: "",
  url: "",
  role: "",
  team: "",
  tech: "",
});

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<FormProject>(blank());
  const [editLang, setEditLang] = useState<Locale>("id");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] = useState<string[]>([]);
  const [metaList, setMetaList] = useState<Meta[]>([]);
  const [order, setOrder] = useState<string[]>([]);

  const load = () => {
    fetch("/api/projects?raw=1")
      .then((r) => r.json())
      .then(setProjects);
    fetch("/api/collections?key=featured")
      .then((r) => r.json())
      .then((d) => setFeatured(Array.isArray(d.items) ? d.items : []));
    fetch("/api/collections?key=projectmeta")
      .then((r) => r.json())
      .then((d) => setMetaList(Array.isArray(d.items) ? d.items : []));
    fetch("/api/collections?key=projectorder")
      .then((r) => r.json())
      .then((d) => setOrder(Array.isArray(d.items) ? d.items : []));
  };

  // Drag reorder for the project list (persisted as `projectorder`).
  const rank = (slug: string) => {
    const i = order.indexOf(slug);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const ordered = [...projects].sort((a, b) => rank(a.slug) - rank(b.slug));
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const saveOrder = async (slugs: string[]) => {
    setOrder(slugs);
    await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "projectorder", items: slugs }),
    });
  };
  const onDropAt = (to: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (from === null || from === to) return;
    const next = [...ordered];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    saveOrder(next.map((p) => p.slug));
  };

  const openProject = (p: Project) => {
    const m = metaList.find((x) => x.slug === p.slug);
    setForm({ ...p, role: m?.role ?? "", team: m?.team ?? "", tech: (m?.tech ?? []).join(", ") });
  };

  useEffect(() => {
    load();
  }, []);

  const togglePin = async (slug: string) => {
    const next = featured.includes(slug) ? featured.filter((s) => s !== slug) : [...featured, slug];
    setFeatured(next);
    await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "featured", items: next }),
    });
  };

  const setField = (field: "title" | "summary" | "body", value: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [editLang]: value } }));

  const save = async () => {
    if (!form.slug.trim()) {
      setStatus("Slug is required.");
      return;
    }
    setStatus("Saving...");
    const { role, team, tech, ...project } = form;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });

    // Save extra metadata (role/team/tech) keyed by slug.
    const techArr = tech.split(",").map((s) => s.trim()).filter(Boolean);
    const nextMeta: Meta[] = [
      ...metaList.filter((m) => m.slug !== form.slug),
      { slug: form.slug, role: role || undefined, team: team || undefined, tech: techArr },
    ];
    await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "projectmeta", items: nextMeta }),
    });
    setMetaList(nextMeta);

    setStatus(res.ok ? "Saved." : "Save failed.");
    if (res.ok) await load();
  };

  const remove = async (slug: string) => {
    if (!confirm(`Delete project "${slug}"?`)) return;
    const res = await fetch(`/api/projects?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      if (form.slug === slug) setForm(blank());
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Projects</p>
          <button onClick={() => setForm(blank())} className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
            + New
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {ordered.map((p, i) => (
            <div
              key={p.slug}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(i);
              }}
              onDragLeave={() => setOverIndex((v) => (v === i ? null : v))}
              onDrop={() => onDropAt(i)}
              className={`flex items-center gap-1 rounded-2xl px-2 py-2 text-sm transition-colors ${
                overIndex === i ? "ring-2 ring-blue-500" : ""
              } ${p.slug === form.slug ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-950"}`}
            >
              <span
                draggable
                onDragStart={() => (dragIndex.current = i)}
                onDragEnd={() => {
                  dragIndex.current = null;
                  setOverIndex(null);
                }}
                className="cursor-grab select-none px-1 text-zinc-400 active:cursor-grabbing"
                title="Drag to reorder"
              >
                ⠿
              </span>
              <button
                onClick={() => togglePin(p.slug)}
                className={`text-base leading-none ${featured.includes(p.slug) ? "text-amber-400" : "opacity-40 hover:opacity-80"}`}
                title={featured.includes(p.slug) ? "Unpin from Highlighted" : "Pin to Highlighted"}
              >
                {featured.includes(p.slug) ? "★" : "☆"}
              </button>
              <button onClick={() => openProject(p)} className="min-w-0 flex-1 truncate text-left">
                {p.title.id || p.slug}
              </button>
              <button onClick={() => remove(p.slug)} className="ml-2 text-xs opacity-70 hover:opacity-100" title="Delete">
                ✕
              </button>
            </div>
          ))}
          {projects.length === 0 && <p className="text-xs text-zinc-500">No projects yet.</p>}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Slug (unique id)</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputCls} placeholder="my-project" />
          </div>
          <div>
            <label className={labelCls}>Image URL</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputCls} placeholder="/images/x.svg" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Link URL</label>
          <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputCls} placeholder="https://..." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Role</label>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls} placeholder="Fullstack Developer" />
          </div>
          <div>
            <label className={labelCls}>Team</label>
            <input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className={inputCls} placeholder="3 orang" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Tech stack (comma separated)</label>
          <input value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} className={inputCls} placeholder="Laravel, Bootstrap, JS" />
        </div>
        <div>
          <label className={labelCls}>Title ({editLang.toUpperCase()})</label>
          <input value={form.title[editLang]} onChange={(e) => setField("title", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Summary ({editLang.toUpperCase()})</label>
          <textarea value={form.summary[editLang]} onChange={(e) => setField("summary", e.target.value)} rows={2} className={inputCls} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className={labelCls}>Body ({editLang.toUpperCase()}) — rich text, tampil di halaman detail</label>
            <button
              type="button"
              onClick={() => {
                const from = editLang === "en" ? "id" : "en";
                setForm((p) => ({ ...p, body: { ...p.body, [editLang]: p.body[from] } }));
              }}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              ⧉ Salin dari {editLang === "en" ? "ID" : "EN"}
            </button>
          </div>
          <RichTextEditor
            key={`${form.slug}-${editLang}`}
            value={form.body[editLang]}
            onChange={(html) => setField("body", html)}
          />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button onClick={save} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
            {projects.some((p) => p.slug === form.slug) ? "Update project" : "Add project"}
          </button>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{status}</p>
        </div>
      </section>
    </div>
  );
}
