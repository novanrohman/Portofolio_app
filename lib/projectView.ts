import { getAllProjects } from "./db";
import { getCollection } from "./collections";
import type { Locale } from "./i18n";

export type ProjectMeta = { slug: string; role?: string; team?: string; tech?: string[] };

export type ProjectView = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  image?: string;
  url?: string;
  updatedAt: string;
  role?: string;
  team?: string;
  tech: string[];
  featured: boolean;
};

/** Projects merged with their extra metadata + pinned flag, pinned first. */
export async function getProjectViews(locale: Locale): Promise<ProjectView[]> {
  const [projects, metaList, featuredSlugs, order] = await Promise.all([
    getAllProjects(locale),
    getCollection<ProjectMeta>("projectmeta"),
    getCollection<string>("featured"),
    getCollection<string>("projectorder"),
  ]);

  const metaBySlug = new Map(metaList.map((m) => [m.slug, m]));
  // Slugs listed in projectorder come first (in that order); the rest keep
  // their original order at the end.
  const rank = (slug: string) => {
    const i = order.indexOf(slug);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  return projects
    .map((p): ProjectView => {
      const m = metaBySlug.get(p.slug);
      return {
        ...p,
        role: m?.role,
        team: m?.team,
        tech: Array.isArray(m?.tech) ? m!.tech : [],
        featured: featuredSlugs.includes(p.slug),
      };
    })
    .sort((a, b) => rank(a.slug) - rank(b.slug));
}
