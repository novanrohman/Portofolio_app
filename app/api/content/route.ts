import { NextResponse } from "next/server";
import { getAllContent, getContent, upsertContent } from "@/lib/db";
import { isAuthenticatedRequest } from "@/lib/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const raw = url.searchParams.get("raw");

  if (slug) {
    // Admin editor: return both languages so it can edit id + en.
    if (raw) {
      const [id, en] = await Promise.all([getContent(slug, "id"), getContent(slug, "en")]);
      if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({
        slug: id.slug,
        title: { id: id.title, en: en?.title ?? id.title },
        summary: { id: id.summary, en: en?.summary ?? id.summary },
        body: { id: id.body, en: en?.body ?? id.body },
        updatedAt: id.updatedAt,
      });
    }

    const content = await getContent(slug);
    return content
      ? NextResponse.json(content)
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const all = await getAllContent();
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, title, summary, body } = await request.json();
  if (!slug || !title || !summary || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const updated = await upsertContent({ slug, title, summary, body });
  return NextResponse.json(updated);
}
