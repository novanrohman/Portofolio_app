import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
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

type DatabaseFile = {
  content: ContentRecord[];
  projects: ProjectRecord[];
};

const dataDir = dirname(process.env.DB_PATH ?? join(process.cwd(), "data", "portfolio.json"));
const dbPath = process.env.DB_PATH ?? join(dataDir, "portfolio.json");

function createInitialData(): DatabaseFile {
  const now = new Date().toISOString();
  return {
    content: [
      {
        slug: "home",
        title: "Modern portfolio with live content management",
        summary: "A responsive Next.js portfolio built with JSON data storage and a secure admin panel.",
        body: "Welcome to your searchable, editable portfolio. Use the admin panel to keep your projects, skills, and contact info up to date.",
        updatedAt: now,
      },
      {
        slug: "about",
        title: "About this portfolio",
        summary: "Use this section to introduce yourself, your mission, and your professional story.",
        body: "I build fast, maintainable web experiences with modern Next.js architecture. This portfolio stores content in JSON so updates are simple and self-hosted.",
        updatedAt: now,
      },
      {
        slug: "skills",
        title: "Skills and expertise",
        summary: "List your core technologies and strengths with easy content updates.",
        body: "React, Next.js, TypeScript, Tailwind CSS, and content management are the foundation of this portfolio. Keep your skill list current from the secure admin page.",
        updatedAt: now,
      },
      {
        slug: "portfolio",
        title: "Highlighted work",
        summary: "Showcase your projects, case studies, and featured clients with rich descriptions.",
        body: "The portfolio section is designed to present your best work with flexible content blocks stored in JSON and editable in the admin area.",
        updatedAt: now,
      },
      {
        slug: "contact",
        title: "Contact and next steps",
        summary: "Keep your contact details and call-to-action current using the admin editor.",
        body: "Interested in working together? Update this contact section anytime from the admin dashboard and keep your details accurate.",
        updatedAt: now,
      },
    ],
    projects: [
      {
        slug: "example-project",
        title: "Example project",
        summary: "A sample project to show your work.",
        body: "This project highlights a modern portfolio workflow using Next.js and JSON data storage.",
        url: "https://example.com",
        updatedAt: now,
      },
    ],
  };
}

function ensureDataFile() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  if (!existsSync(dbPath)) {
    writeFileSync(dbPath, JSON.stringify(createInitialData(), null, 2), "utf8");
  }
}

function readDatabase(): DatabaseFile {
  ensureDataFile();
  return JSON.parse(readFileSync(dbPath, "utf8")) as DatabaseFile;
}

function writeDatabase(data: DatabaseFile) {
  writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
}

export type { ContentRecord, ProjectRecord };

export function getContent(slug: string, locale: Locale = DEFAULT_LOCALE) {
  const db = readDatabase();
  const item = db.content.find((entry) => entry.slug === slug);
  return item ? localizeContent(item, locale) : undefined;
}

export function getAllContent(locale: Locale = DEFAULT_LOCALE) {
  const db = readDatabase();
  return db.content.map((item) => localizeContent(item, locale));
}

export function getAllProjects(locale: Locale = DEFAULT_LOCALE) {
  const db = readDatabase();
  return db.projects.map((item) => localizeProject(item, locale));
}

export function upsertProject(input: {
  slug: string;
  title: string;
  summary: string;
  body: string;
  url?: string;
}) {
  const db = readDatabase();
  const nowValue = new Date().toISOString();
  const existingIndex = db.projects.findIndex((project) => project.slug === input.slug);
  const updatedProject: ProjectRecord = {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    body: input.body,
    url: input.url,
    updatedAt: nowValue,
  };

  if (existingIndex >= 0) {
    db.projects[existingIndex] = updatedProject;
  } else {
    db.projects.push(updatedProject);
  }

  writeDatabase(db);
  return updatedProject;
}

export function upsertContent(input: {
  slug: string;
  title: string;
  summary: string;
  body: string;
}) {
  const db = readDatabase();
  const nowValue = new Date().toISOString();
  const existingIndex = db.content.findIndex((item) => item.slug === input.slug);
  const updatedContent: ContentRecord = {
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    body: input.body,
    updatedAt: nowValue,
  };

  if (existingIndex >= 0) {
    db.content[existingIndex] = updatedContent;
  } else {
    db.content.push(updatedContent);
  }

  writeDatabase(db);
  return updatedContent;
}
