import { getContent } from "./db";
import { getCollection } from "./collections";
import type { Locale } from "./i18n";

export type Profile = { name?: string; title?: string; email?: string; phone?: string; location?: string };
export type ExpItem = { title?: string; period?: string; role?: string; description?: string };
export type EduItem = { title?: string; role?: string; period?: string };
export type CertItem = { title?: string; description?: string };
export type LinkItem = { label?: string; href?: string };

export type CvData = {
  profile: Profile;
  summary: string;
  skills: string[];
  experience: ExpItem[];
  organization: ExpItem[];
  education: EduItem[];
  certificates: CertItem[];
  contact: LinkItem[];
};

export async function getCvData(locale: Locale): Promise<CvData> {
  const [profileArr, home, skills, experience, organization, education, certificates, contact] =
    await Promise.all([
      getCollection<Profile>("profile"),
      getContent("home", locale),
      getCollection<string>("skills"),
      getCollection<ExpItem>("experience"),
      getCollection<ExpItem>("organization"),
      getCollection<EduItem>("education"),
      getCollection<CertItem>("certificates"),
      getCollection<LinkItem>("contact"),
    ]);

  return {
    profile: profileArr[0] ?? {},
    summary: home?.body ?? "",
    skills,
    experience,
    organization,
    education,
    certificates,
    contact,
  };
}
