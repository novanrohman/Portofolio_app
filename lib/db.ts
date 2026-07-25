import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { neon } from "@neondatabase/serverless";
import { DEFAULT_LOCALE, resolve, type Localized, type Locale } from "./i18n";

// Stored form: translatable fields may be a string or a { id, en } object.
type ContentRecord = {
  slug: string;
  title: Localized;
  summary: Localized;
  body: Localized;
  updatedAt: string;
};

type ProjectRecord = {
  slug: string;
  title: Localized;
  summary: Localized;
  body: Localized;
  image?: string;
  url?: string;
  updatedAt: string;
};

type DatabaseFile = {
  content: ContentRecord[];
  projects: ProjectRecord[];
};

// Resolved form returned to pages: translatable fields are plain strings.
type ResolvedContent = Omit<ContentRecord, "title" | "summary" | "body"> & {
  title: string;
  summary: string;
  body: string;
};
type ResolvedProject = Omit<ProjectRecord, "title" | "summary" | "body"> & {
  title: string;
  summary: string;
  body: string;
};

function localizeContent(item: ContentRecord, locale: Locale): ResolvedContent {
  return {
    ...item,
    title: resolve(item.title, locale) ?? "",
    summary: resolve(item.summary, locale) ?? "",
    body: resolve(item.body, locale) ?? "",
  };
}

function localizeProject(item: ProjectRecord, locale: Locale): ResolvedProject {
  return {
    ...item,
    title: resolve(item.title, locale) ?? "",
    summary: resolve(item.summary, locale) ?? "",
    body: resolve(item.body, locale) ?? "",
  };
}

// ---------------------------------------------------------------------------
// Backend selection: Postgres (Neon) in production, JSON file for local dev.
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// -- JSON file backend (fallback / seed source) -----------------------------

const dataDir = dirname(process.env.DB_PATH ?? join(process.cwd(), "data", "portfolio.json"));
const dbPath = process.env.DB_PATH ?? join(dataDir, "portfolio.json");

function createInitialData(): DatabaseFile {
  const now = new Date().toISOString();
  return {
    content: [
      { slug: "home", title: "Modern portfolio", summary: "A responsive Next.js portfolio.", body: "Welcome to your editable portfolio.", updatedAt: now },
      { slug: "about", title: "About", summary: "Introduce yourself.", body: "Update this from the admin dashboard.", updatedAt: now },
      { slug: "skills", title: "Skills", summary: "List your strengths.", body: "React, Next.js, TypeScript, Tailwind CSS.", updatedAt: now },
      { slug: "portfolio", title: "Highlighted work", summary: "Showcase your projects.", body: "Present your best work.", updatedAt: now },
      { slug: "contact", title: "Contact", summary: "Keep your details current.", body: "Interested in working together?", updatedAt: now },
    ],
    projects: [],
  };
}

function ensureDataFile() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (!existsSync(dbPath)) writeFileSync(dbPath, JSON.stringify(createInitialData(), null, 2), "utf8");
}

function readDatabase(): DatabaseFile {
  ensureDataFile();
  return JSON.parse(readFileSync(dbPath, "utf8")) as DatabaseFile;
}

function writeDatabase(data: DatabaseFile) {
  writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
}

// -- Postgres backend -------------------------------------------------------

let schemaReady = false;

async function ensureSchema() {
  if (!sql || schemaReady) return;

  await sql`CREATE TABLE IF NOT EXISTS content (
    slug text PRIMARY KEY,
    title jsonb NOT NULL,
    summary jsonb NOT NULL,
    body jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS projects (
    slug text PRIMARY KEY,
    title jsonb NOT NULL,
    summary jsonb NOT NULL,
    body jsonb NOT NULL,
    image text,
    url text,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;

  // One-time seed from the bundled JSON (idempotent via ON CONFLICT DO NOTHING).
  const seed = readDatabase();
  for (const c of seed.content) {
    await sql`INSERT INTO content (slug, title, summary, body, updated_at)
      VALUES (${c.slug}, ${JSON.stringify(c.title)}::jsonb, ${JSON.stringify(c.summary)}::jsonb, ${JSON.stringify(c.body)}::jsonb, ${c.updatedAt})
      ON CONFLICT (slug) DO NOTHING`;
  }
  for (const p of seed.projects) {
    await sql`INSERT INTO projects (slug, title, summary, body, image, url, updated_at)
      VALUES (${p.slug}, ${JSON.stringify(p.title)}::jsonb, ${JSON.stringify(p.summary)}::jsonb, ${JSON.stringify(p.body)}::jsonb, ${p.image ?? null}, ${p.url ?? null}, ${p.updatedAt})
      ON CONFLICT (slug) DO NOTHING`;
  }

  schemaReady = true;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToContent(row: any): ContentRecord {
  return { slug: row.slug, title: row.title, summary: row.summary, body: row.body, updatedAt: new Date(row.updated_at).toISOString() };
}
function rowToProject(row: any): ProjectRecord {
  return { slug: row.slug, title: row.title, summary: row.summary, body: row.body, image: row.image ?? undefined, url: row.url ?? undefined, updatedAt: new Date(row.updated_at).toISOString() };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Public API (same signatures as before, now async)
// ---------------------------------------------------------------------------

export type { ContentRecord, ProjectRecord };

export async function getContent(slug: string, locale: Locale = DEFAULT_LOCALE) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM content WHERE slug = ${slug} LIMIT 1`;
    return rows[0] ? localizeContent(rowToContent(rows[0]), locale) : undefined;
  }
  const db = readDatabase();
  const item = db.content.find((entry) => entry.slug === slug);
  return item ? localizeContent(item, locale) : undefined;
}

export async function getAllContent(locale: Locale = DEFAULT_LOCALE) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM content ORDER BY slug`;
    return rows.map((r) => localizeContent(rowToContent(r), locale));
  }
  const db = readDatabase();
  return db.content.map((item) => localizeContent(item, locale));
}

export async function getAllProjects(locale: Locale = DEFAULT_LOCALE) {
  if (sql) {
    await ensureSchema();
    const rows = await sql`SELECT * FROM projects ORDER BY updated_at DESC`;
    return rows.map((r) => localizeProject(rowToProject(r), locale));
  }
  const db = readDatabase();
  return db.projects.map((item) => localizeProject(item, locale));
}

export async function upsertContent(input: { slug: string; title: Localized; summary: Localized; body: Localized }) {
  const now = new Date().toISOString();
  if (sql) {
    await ensureSchema();
    const rows = await sql`INSERT INTO content (slug, title, summary, body, updated_at)
      VALUES (${input.slug}, ${JSON.stringify(input.title)}::jsonb, ${JSON.stringify(input.summary)}::jsonb, ${JSON.stringify(input.body)}::jsonb, ${now})
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, body = EXCLUDED.body, updated_at = EXCLUDED.updated_at
      RETURNING *`;
    return rowToContent(rows[0]);
  }
  const db = readDatabase();
  const updated: ContentRecord = { ...input, updatedAt: now };
  const i = db.content.findIndex((c) => c.slug === input.slug);
  if (i >= 0) db.content[i] = updated;
  else db.content.push(updated);
  writeDatabase(db);
  return updated;
}

export async function upsertProject(input: { slug: string; title: Localized; summary: Localized; body: Localized; image?: string; url?: string }) {
  const now = new Date().toISOString();
  if (sql) {
    await ensureSchema();
    // COALESCE keeps the existing image/url when the admin form doesn't send them.
    const rows = await sql`INSERT INTO projects (slug, title, summary, body, image, url, updated_at)
      VALUES (${input.slug}, ${JSON.stringify(input.title)}::jsonb, ${JSON.stringify(input.summary)}::jsonb, ${JSON.stringify(input.body)}::jsonb, ${input.image ?? null}, ${input.url ?? null}, ${now})
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title, summary = EXCLUDED.summary, body = EXCLUDED.body,
        image = COALESCE(EXCLUDED.image, projects.image),
        url = COALESCE(EXCLUDED.url, projects.url),
        updated_at = EXCLUDED.updated_at
      RETURNING *`;
    return rowToProject(rows[0]);
  }
  const db = readDatabase();
  const updated: ProjectRecord = { ...input, updatedAt: now };
  const i = db.projects.findIndex((p) => p.slug === input.slug);
  if (i >= 0) db.projects[i] = updated;
  else db.projects.push(updated);
  writeDatabase(db);
  return updated;
}

export async function deleteProject(slug: string) {
  if (sql) {
    await ensureSchema();
    await sql`DELETE FROM projects WHERE slug = ${slug}`;
    return { slug };
  }
  const db = readDatabase();
  db.projects = db.projects.filter((p) => p.slug !== slug);
  writeDatabase(db);
  return { slug };
}
