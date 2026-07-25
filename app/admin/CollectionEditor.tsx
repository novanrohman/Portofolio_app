"use client";

import { useEffect, useState } from "react";

export type FieldDef = { name: string; label: string; textarea?: boolean; placeholder?: string };

type Item = string | Record<string, string>;

const inputCls =
  "w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900";

/**
 * Generic editor for a JSON-array collection stored in the content table.
 * - If `fields` is undefined, items are plain strings (e.g. skills).
 * - Otherwise items are objects with the given fields (experience, contact, ...).
 */
export default function CollectionEditor({
  collectionKey,
  title,
  fields,
  itemLabel = "item",
}: {
  collectionKey: string;
  title: string;
  fields?: FieldDef[];
  itemLabel?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/collections?key=${collectionKey}`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data.items) ? data.items : []));
  }, [collectionKey]);

  const blank = (): Item => (fields ? Object.fromEntries(fields.map((f) => [f.name, ""])) : "");

  const add = () => setItems((prev) => [...prev, blank()]);
  const removeAt = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const setString = (i: number, value: string) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? value : it)));
  const setObjField = (i: number, name: string, value: string) =>
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...(it as Record<string, string>), [name]: value } : it))
    );

  const save = async () => {
    setStatus("Saving...");
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: collectionKey, items }),
    });
    setStatus(res.ok ? "Saved." : "Save failed.");
  };

  return (
    <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={add} className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
          + Add {itemLabel}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-zinc-400">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} className="rounded-lg px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Up">
                  ↑
                </button>
                <button onClick={() => move(i, 1)} className="rounded-lg px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800" title="Down">
                  ↓
                </button>
                <button onClick={() => removeAt(i)} className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950" title="Remove">
                  ✕
                </button>
              </div>
            </div>

            {!fields ? (
              <input
                value={it as string}
                onChange={(e) => setString(i, e.target.value)}
                className={inputCls}
                placeholder={itemLabel}
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.name} className={f.textarea ? "sm:col-span-2" : ""}>
                    <label className="text-xs text-zinc-500 dark:text-zinc-400">{f.label}</label>
                    {f.textarea ? (
                      <textarea
                        value={(it as Record<string, string>)[f.name] ?? ""}
                        onChange={(e) => setObjField(i, f.name, e.target.value)}
                        rows={2}
                        className={`mt-1 ${inputCls}`}
                        placeholder={f.placeholder}
                      />
                    ) : (
                      <input
                        value={(it as Record<string, string>)[f.name] ?? ""}
                        onChange={(e) => setObjField(i, f.name, e.target.value)}
                        className={`mt-1 ${inputCls}`}
                        placeholder={f.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-zinc-500">No {itemLabel}s yet. Click “Add”.</p>}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button onClick={save} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
          Save {title}
        </button>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{status}</p>
      </div>
    </section>
  );
}
