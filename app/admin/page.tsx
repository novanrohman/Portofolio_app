"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ContentEditor from "@/app/admin/ContentEditor";
import ProjectsEditor from "@/app/admin/ProjectsEditor";
import CollectionEditor from "@/app/admin/CollectionEditor";
import ResumeEditor from "@/app/admin/ResumeEditor";

type Tab =
  | "content"
  | "profile"
  | "projects"
  | "skills"
  | "experience"
  | "organization"
  | "education"
  | "certificates"
  | "contact"
  | "resume";

const TABS: { key: Tab; label: string }[] = [
  { key: "content", label: "Content" },
  { key: "profile", label: "Profile" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "experience", label: "Experience" },
  { key: "organization", label: "Organization" },
  { key: "education", label: "Education" },
  { key: "certificates", label: "Certificates" },
  { key: "contact", label: "Contact" },
  { key: "resume", label: "Resume" },
];

const expFields = [
  { name: "title", label: "Title / Company", placeholder: "PT. Example" },
  { name: "period", label: "Period", placeholder: "Jan 2024 - Dec 2024" },
  { name: "role", label: "Role", placeholder: "Fullstack Developer" },
  { name: "description", label: "Description", textarea: true },
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("content");

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((r) => r.json())
      .then((d) => {
        setAuthenticated(d.ok === true);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900 sm:px-6 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        {children}
      </div>
    </div>
  );

  if (!checked) return shell(<p className="text-lg">Checking admin session...</p>);

  if (!authenticated)
    return shell(
      <>
        <h1 className="text-2xl font-semibold sm:text-3xl">Admin access required</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">You must sign in before editing.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Go to login
        </Link>
      </>
    );

  return shell(
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Portfolio Admin</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Kelola seluruh konten portofolio.</p>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "content" && <ContentEditor />}
        {tab === "profile" && (
          <CollectionEditor
            collectionKey="profile"
            title="Profile (for CV header)"
            itemLabel="profile"
            fields={[
              { name: "name", label: "Full name", placeholder: "Novan Rohman" },
              { name: "title", label: "Professional title", placeholder: "Full-Stack Developer" },
              { name: "email", label: "Email", placeholder: "you@email.com" },
              { name: "phone", label: "Phone / WhatsApp", placeholder: "+62..." },
              { name: "location", label: "Location", placeholder: "Indonesia" },
            ]}
          />
        )}
        {tab === "projects" && <ProjectsEditor />}
        {tab === "skills" && (
          <CollectionEditor collectionKey="skills" title="Skills" itemLabel="skill" />
        )}
        {tab === "experience" && (
          <CollectionEditor collectionKey="experience" title="Work Experience" itemLabel="experience" fields={expFields} />
        )}
        {tab === "organization" && (
          <CollectionEditor collectionKey="organization" title="Organization" itemLabel="organization" fields={expFields} />
        )}
        {tab === "education" && (
          <CollectionEditor
            collectionKey="education"
            title="Education"
            itemLabel="education"
            fields={[
              { name: "title", label: "Institution", placeholder: "Politeknik Negeri Banyuwangi" },
              { name: "role", label: "Degree / Major", placeholder: "D4 Teknologi Rekayasa Perangkat Lunak" },
              { name: "period", label: "Period", placeholder: "2021 - 2025" },
            ]}
          />
        )}
        {tab === "certificates" && (
          <CollectionEditor
            collectionKey="certificates"
            title="Certificates"
            itemLabel="certificate"
            fields={[
              { name: "title", label: "Title" },
              { name: "description", label: "Description", textarea: true },
            ]}
          />
        )}
        {tab === "contact" && (
          <CollectionEditor
            collectionKey="contact"
            title="Contact Links"
            itemLabel="link"
            fields={[
              { name: "label", label: "Label", placeholder: "GitHub" },
              { name: "href", label: "URL", placeholder: "https://..." },
            ]}
          />
        )}
        {tab === "resume" && <ResumeEditor />}
      </div>
    </>
  );
}
