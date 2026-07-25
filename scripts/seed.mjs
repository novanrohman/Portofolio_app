// Publish local data/portfolio.json -> Neon Postgres.
// Usage:
//   1) vercel env pull .env.production.local --environment=production
//      (once — puts DATABASE_URL in a file that `next dev` does NOT load,
//       so `npm run dev` stays file-based / offline.)
//   2) npm run db:seed
//
// This OVERWRITES matching rows in Neon with your local file (intentional publish).
// It does not delete rows that only exist in the DB.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

// --- Load DATABASE_URL (from process.env, else parse .env.local / .env) ------
function loadEnv() {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) return;
  for (const file of [".env.production.local", ".env.local", ".env"]) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!DATABASE_URL) {
  console.error("✗ DATABASE_URL not found. Run `vercel env pull .env.local` first.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const data = JSON.parse(readFileSync(join(process.cwd(), "data", "portfolio.json"), "utf8"));

async function main() {
  await sql`CREATE TABLE IF NOT EXISTS content (
    slug text PRIMARY KEY, title jsonb NOT NULL, summary jsonb NOT NULL,
    body jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS projects (
    slug text PRIMARY KEY, title jsonb NOT NULL, summary jsonb NOT NULL,
    body jsonb NOT NULL, image text, url text, updated_at timestamptz NOT NULL DEFAULT now()
  )`;

  for (const c of data.content) {
    await sql`INSERT INTO content (slug, title, summary, body, updated_at)
      VALUES (${c.slug}, ${JSON.stringify(c.title)}::jsonb, ${JSON.stringify(c.summary)}::jsonb, ${JSON.stringify(c.body)}::jsonb, ${c.updatedAt ?? new Date().toISOString()})
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, body = EXCLUDED.body, updated_at = EXCLUDED.updated_at`;
  }
  for (const p of data.projects) {
    await sql`INSERT INTO projects (slug, title, summary, body, image, url, updated_at)
      VALUES (${p.slug}, ${JSON.stringify(p.title)}::jsonb, ${JSON.stringify(p.summary)}::jsonb, ${JSON.stringify(p.body)}::jsonb, ${p.image ?? null}, ${p.url ?? null}, ${p.updatedAt ?? new Date().toISOString()})
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, body = EXCLUDED.body, image = EXCLUDED.image, url = EXCLUDED.url, updated_at = EXCLUDED.updated_at`;
  }

  console.log(`✓ Seeded Neon: ${data.content.length} content, ${data.projects.length} projects.`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err.message);
  process.exit(1);
});
