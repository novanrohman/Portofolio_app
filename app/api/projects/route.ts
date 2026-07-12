import { NextResponse } from "next/server";
import { getAllProjects, upsertProject } from "@/lib/db";
import { isAuthenticatedRequest } from "@/lib/admin";

export async function GET() {
  return NextResponse.json(await getAllProjects());
}

export async function POST(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, title, summary, body, url } = await request.json();
  if (!slug || !title || !summary || !body) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const updated = await upsertProject({ slug, title, summary, body, url });
  return NextResponse.json(updated);
}
