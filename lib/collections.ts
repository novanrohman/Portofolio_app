import { getContent } from "./db";
import {
  skills as defaultSkills,
  experiences as defaultExperiences,
  certificates as defaultCertificates,
  contactLinks as defaultContact,
} from "./portfolioData";

export const COLLECTION_KEYS = [
  "skills",
  "experience",
  "organization",
  "certificates",
  "contact",
  "education",
  "profile",
] as const;
export type CollectionKey = (typeof COLLECTION_KEYS)[number];

const DEFAULTS: Record<CollectionKey, unknown[]> = {
  skills: defaultSkills,
  experience: defaultExperiences,
  organization: [],
  certificates: defaultCertificates,
  contact: defaultContact,
  education: [
    { title: "Politeknik Negeri Banyuwangi", period: "", role: "D4 Teknologi Rekayasa Perangkat Lunak" },
  ],
  // Single-object settings stored as a 1-element array (so getContent's resolve
  // doesn't mistake it for a localized field).
  profile: [
    { name: "Novan Rohman", title: "Full-Stack Developer", email: "", phone: "", location: "Indonesia" },
  ],
};

/**
 * Read a collection (stored as a JSON array in the content table under `_<key>`),
 * falling back to the seeded defaults when it hasn't been saved yet.
 */
export async function getCollection<T = unknown>(key: CollectionKey): Promise<T[]> {
  const row = await getContent(`_${key}`);
  const body = row?.body as unknown;
  return (Array.isArray(body) ? body : DEFAULTS[key]) as T[];
}
