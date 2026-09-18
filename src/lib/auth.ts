import { NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "velora_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

export interface SessionPayload {
  email: string;
  role: "admin";
  iat: number;
  exp: number;
}

function getSecretKey(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_SESSION_SECRET environment variable must be set in production.");
    }
    // Fallback development secret
    return "dev_fallback_secret_velora_admin_key_2026_!@#";
  }
  return secret;
}

/** Base64URL Helpers using Web standard APIs */
function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecretKey()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a signed HMAC-SHA256 session token.
 */
export async function createSessionToken(email: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    role: "admin",
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign)
  );

  const encodedSignature = bufferToBase64Url(signatureBuffer);
  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies an HMAC-SHA256 session token and returns the payload if valid.
 */
export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getCryptoKey();
    const signatureBuffer = Buffer.from(
      encodedSignature.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      new TextEncoder().encode(dataToSign)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp < now) {
      return null;
    }

    if (payload.role !== "admin") {
      return null;
    }

    return payload;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}

/**
 * Validates admin credentials against environment variables.
 */
export function validateAdminCredentials(email?: string, password?: string): boolean {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!configuredEmail || !configuredPassword) {
    console.error("ADMIN_EMAIL or ADMIN_PASSWORD is not configured in environment.");
    return false;
  }

  if (!email || !password) {
    return false;
  }

  const normalizedInputEmail = email.trim().toLowerCase();
  return normalizedInputEmail === configuredEmail && password.trim() === configuredPassword;
}

/**
 * Extracts a cookie value from a raw Cookie header string.
 */
export function getCookieFromHeader(cookieHeader?: string | null, name = ADMIN_COOKIE_NAME): string | null {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawKey, ...rest] = pair.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

/**
 * Checks whether the incoming request contains a valid admin session.
 * Supports native Request, NextRequest, or any object with headers.
 */
export async function checkAdminAuth(request: Request | { headers?: Headers | { get(name: string): string | null } }): Promise<boolean> {
  try {
    const cookieHeader = request.headers instanceof Headers
      ? request.headers.get("cookie")
      : request.headers?.get?.("cookie") || null;

    const token = getCookieFromHeader(cookieHeader, ADMIN_COOKIE_NAME);
    if (!token) return false;

    const session = await verifySessionToken(token);
    return session !== null;
  } catch (err) {
    console.error("checkAdminAuth error:", err);
    return false;
  }
}

/**
 * Helper to attach an authenticated admin session cookie to a NextResponse.
 */
export async function attachAdminSessionCookie(response: NextResponse, email: string): Promise<void> {
  const token = await createSessionToken(email);
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Helper to remove the admin session cookie from a NextResponse.
 */
export function removeAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
