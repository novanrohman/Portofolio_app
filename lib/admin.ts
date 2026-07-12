import crypto from "crypto";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "";
export const ADMIN_COOKIE = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

export function isValidAdminPassword(password?: string) {
  return Boolean(password && password === ADMIN_KEY);
}

export function createAdminToken() {
  if (!ADMIN_KEY) return "";
  return crypto.createHmac("sha256", ADMIN_KEY).update("admin-session").digest("base64url");
}

export function verifyAdminToken(token?: string) {
  return Boolean(token && token === createAdminToken());
}

export function parseCookies(cookieHeader?: string) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (!name) continue;
    cookies[name] = rest.join("=");
  }

  return cookies;
}

export function isAuthenticatedRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookies(cookieHeader ?? undefined);
  return verifyAdminToken(cookies[ADMIN_COOKIE]);
}

export function createAuthCookieValue() {
  return createAdminToken();
}

export function cookieSettings() {
  return {
    httpOnly: true,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  } as const;
}
