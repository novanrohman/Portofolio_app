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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("home");
  const [form, setForm] = useState({
    slug: "home",
    title: "",
    summary: "",
    body: "",
  });
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
    fetch(`/api/content?slug=${selectedSlug}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          slug: data.slug,
          title: data.title,
          summary: data.summary,
          body: data.body,
        });
      });
  }, [authenticated, selectedSlug]);

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
      setContents((prev) => prev.map((item) => (item.slug === result.slug ? result : item)));
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

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Summary
                </label>
                <textarea
                  value={form.summary}
                  onChange={(event) => setForm({ ...form, summary: event.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Body
                </label>
                <textarea
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
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
