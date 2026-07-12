import { NextResponse } from "next/server";
import { createAuthCookieValue, cookieSettings, isValidAdminPassword } from "@/lib/admin";

export async function POST(request: Request) {
  const data = await request.json();
  if (!isValidAdminPassword(data.password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", createAuthCookieValue(), cookieSettings());
  return response;
}
