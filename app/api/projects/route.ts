import { NextResponse } from "next/server";
import { getAllProjects, upsertProject, deleteProject } from "@/lib/db";
import { isAuthenticatedRequest } from "@/lib/admin";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("raw");

  // Admin editor: return both languages so it can edit id + en.
  if (raw) {
    const [idList, enList] = await Promise.all([getAllProjects("id"), getAllProjects("en")]);
    const enBySlug = new Map(enList.map((p) => [p.slug, p]));
    const merged = idList.map((p) => {
      const en = enBySlug.get(p.slug);
      return {
        slug: p.slug,
        title: { id: p.title, en: en?.title ?? p.title },
        summary: { id: p.summary, en: en?.summary ?? p.summary },
        body: { id: p.body, en: en?.body ?? p.body },
        image: p.image ?? "",
        url: p.url ?? "",
        updatedAt: p.updatedAt,
      };
    });
    return NextResponse.json(merged);
  }

  return NextResponse.json(await getAllProjects());
}

export async function POST(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, title, summary, body, image, url } = await request.json();
  if (!slug || !title || !summary || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const updated = await upsertProject({ slug, title, summary, body, image, url });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  await deleteProject(slug);
  return NextResponse.json({ ok: true, slug });
}
