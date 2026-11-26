import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "cgi_sports_admin_session";
const SESSION_DURATION = 8 * 60 * 60;

function adminConfig() {
  const password = process.env.CGI_SPORTS_ADMIN_PASSWORD || "cgi-admin";
  const secret = process.env.CGI_SPORTS_ADMIN_SECRET || password;
  const usesDefault = password === "cgi-admin" || secret === password;
  return {
    password,
    secret,
    misconfigured: process.env.NODE_ENV === "production" && usesDefault,
  };
}

function adminPassword() {
  return adminConfig().password;
}

function sign(value: string) {
  return createHmac("sha256", adminConfig().secret)
    .update(value)
    .digest("base64url");
}

function configError() {
  return NextResponse.json(
    { authenticated: false, error: "Konfigurasi admin belum siap. Atur CGI_SPORTS_ADMIN_PASSWORD dan CGI_SPORTS_ADMIN_SECRET." },
    { status: 503 },
  );
}

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function createToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_DURATION * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function isAuthenticated(token: string | undefined) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !secureEqual(signature, sign(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

function sessionResponse(authenticated: boolean) {
  return NextResponse.json({ authenticated });
}

export async function GET(request: NextRequest) {
  if (adminConfig().misconfigured) return configError();
  return sessionResponse(isAuthenticated(request.cookies.get(COOKIE_NAME)?.value));
}

export async function POST(request: NextRequest) {
  if (adminConfig().misconfigured) return configError();
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }
  const body = typeof payload === "object" && payload !== null ? payload as { password?: unknown } : {};
  if (typeof body.password !== "string" || !secureEqual(body.password, adminPassword())) {
    return NextResponse.json({ authenticated: false, error: "Kata sandi salah." }, { status: 401 });
  }

  const response = sessionResponse(true);
  response.cookies.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION,
  });
  return response;
}

export async function DELETE() {
  if (adminConfig().misconfigured) return configError();
  const response = sessionResponse(false);
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
