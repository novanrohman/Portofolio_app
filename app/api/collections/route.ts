import { NextResponse } from "next/server";
import { upsertContent } from "@/lib/db";
import { isAuthenticatedRequest } from "@/lib/admin";
import { getCollection, COLLECTION_KEYS, type CollectionKey } from "@/lib/collections";

// Collections are stored as JSON arrays inside the existing `content` table,
// under reserved slugs — so no DB schema change is needed.
const slugFor = (key: CollectionKey) => `_${key}`;

function isKey(value: string | null): value is CollectionKey {
  return !!value && (COLLECTION_KEYS as readonly string[]).includes(value);
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!isKey(key)) {
    return NextResponse.json({ error: "Unknown collection" }, { status: 400 });
  }

  const items = await getCollection(key);
  return NextResponse.json({ key, items });
}

export async function POST(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, items } = await request.json();
  if (!isKey(key) || !Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await upsertContent({
    slug: slugFor(key),
    title: key,
    summary: "collection",
    // body holds the JSON array; cast because upsertContent types body as Localized.
    body: items as unknown as string,
  });

  return NextResponse.json({ key, items });
}
