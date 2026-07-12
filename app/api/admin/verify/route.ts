import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin";

export async function GET(request: Request) {
  if (isAuthenticatedRequest(request)) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
