"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ContentItem = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  updatedAt: string;
};

type Locale = "id" | "en";
type Bilingual = { id: string; en: string };
type BilingualForm = {
  slug: string;
  title: Bilingual;
  summary: Bilingual;
  body: Bilingual;
};

// A field from the API may be a plain string (legacy) or a { id, en } object.
function toBilingual(value: unknown): Bilingual {
  if (value && typeof value === "object") {
    const v = value as Partial<Bilingual>;
    return { id: v.id ?? "", en: v.en ?? "" };
  }
  const s = typeof value === "string" ? value : "";
  return { id: s, en: s };
}

const emptyForm: BilingualForm = {
  slug: "home",
  title: { id: "", en: "" },
  summary: { id: "", en: "" },
  body: { id: "", en: "" },
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("home");
  const [form, setForm] = useState<BilingualForm>(emptyForm);
  const [editLang, setEditLang] = useState<Locale>("id");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(data.ok === true);
        setChecked(true);
      })
      .catch(() => {
        setAuthenticated(false);
        setChecked(true);
      });
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContents(data);
        if (data.length > 0) {
          setSelectedSlug(data[0].slug);
        }
      });
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || !selectedSlug) return;
    fetch(`/api/content?slug=${selectedSlug}&raw=1`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          slug: data.slug,
          title: toBilingual(data.title),
          summary: toBilingual(data.summary),
          body: toBilingual(data.body),
        });
      });
  }, [authenticated, selectedSlug]);

  const setField = (field: "title" | "summary" | "body", value: string) =>
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [editLang]: value } }));

  const handleSave = async () => {
    setStatus("Saving...");
    const response = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    if (response.ok) {
      setStatus("Saved successfully.");
      // Sidebar shows a plain string title; use the ID language for its label.
      const label = toBilingual(result.title).id || form.title.id || result.slug;
      setContents((prev) =>
        prev.map((item) => (item.slug === result.slug ? { ...item, title: label } : item))
      );
    } else {
      setStatus(result.error ?? "Save failed.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (!checked) {
    return (
      <div className="min-h-screen bg-zinc-100 text-zinc-900 px-6 py-10 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-lg">Checking admin session...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 text-zinc-900 px-6 py-10 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-3xl font-semibold">Admin access required</h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            You must sign in before editing portfolio content.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 px-6 py-10 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Portfolio Admin</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Securely edit portfolio sections and publish updates instantly.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Content sections</p>
            <div className="mt-6 space-y-3">
              {contents.map((item) => (
                <button
                  key={item.slug}
                  className={`block w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                    item.slug === selectedSlug
                      ? "bg-blue-600 text-white"
                      : "bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                  onClick={() => setSelectedSlug(item.slug)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => setForm({ ...form, slug: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              {/* Language toggle: edit ID and EN separately */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Language:</span>
                <div className="inline-flex rounded-xl border border-zinc-300 p-0.5 dark:border-zinc-700">
                  {(["id", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setEditLang(lang)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase transition ${
                        editLang === lang
                          ? "bg-blue-600 text-white"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Editing {editLang === "id" ? "Indonesian" : "English"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Title ({editLang.toUpperCase()})
                </label>
                <input
                  type="text"
                  value={form.title[editLang]}
                  onChange={(event) => setField("title", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Summary ({editLang.toUpperCase()})
                </label>
                <textarea
                  value={form.summary[editLang]}
                  onChange={(event) => setField("summary", event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Body ({editLang.toUpperCase()})
                </label>
                <textarea
                  value={form.body[editLang]}
                  onChange={(event) => setField("body", event.target.value)}
                  rows={8}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Save changes
                </button>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{status}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
