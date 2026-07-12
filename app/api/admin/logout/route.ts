import { NextResponse } from "next/server";
import { cookieSettings } from "@/lib/admin";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_session", "", { ...cookieSettings(), maxAge: 0 });
  return response;
}
