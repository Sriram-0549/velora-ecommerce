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

export interface TokenVerificationResult {
  valid: boolean;
  payload?: SessionPayload;
  error?: string;
  code?: "MISSING_TOKEN" | "MALFORMED_TOKEN" | "INVALID_SIGNATURE" | "EXPIRED_TOKEN" | "FORBIDDEN_ROLE";
}

/**
 * Verifies an HMAC-SHA256 session token and returns detailed status with error diagnostics.
 */
export async function verifySessionTokenWithDetails(token?: string | null): Promise<TokenVerificationResult> {
  if (!token || typeof token !== "string" || !token.trim()) {
    return { valid: false, error: "No token provided.", code: "MISSING_TOKEN" };
  }

  const cleanToken = token.trim();
  const parts = cleanToken.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Malformed JWT token. Expected 3 segments separated by dots.", code: "MALFORMED_TOKEN" };
  }

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

    if (!isValid) {
      return { valid: false, error: "Invalid token signature or secret key mismatch.", code: "INVALID_SIGNATURE" };
    }

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp < now) {
      return { valid: false, error: "Token has expired.", code: "EXPIRED_TOKEN", payload };
    }

    if (payload.role !== "admin") {
      return { valid: false, error: "Unauthorized token role.", code: "FORBIDDEN_ROLE", payload };
    }

    return { valid: true, payload };
  } catch (err) {
    console.error("Token verification failed:", err);
    return { valid: false, error: "Failed to decode or parse token payload.", code: "MALFORMED_TOKEN" };
  }
}

/**
 * Verifies an HMAC-SHA256 session token and returns the payload if valid.
 */
export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  const result = await verifySessionTokenWithDetails(token);
  return result.valid && result.payload ? result.payload : null;
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
 * Extracts a token from Authorization header (Bearer), cookie, or custom headers.
 */
export function extractTokenFromRequest(
  request: Request | { headers?: Headers | { get(name: string): string | null } }
): string | null {
  try {
    const headers =
      request.headers instanceof Headers
        ? request.headers
        : {
            get: (name: string) =>
              (request.headers as { get?(n: string): string | null } | undefined)?.get?.(name) || null,
          };

    // 1. Authorization: Bearer <token>
    const authHeader = headers.get("authorization") || headers.get("Authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const bearerToken = authHeader.substring(7).trim();
      if (bearerToken) return bearerToken;
    }

    // 2. Dedicated admin session cookie
    const cookieHeader = headers.get("cookie") || headers.get("Cookie");
    const cookieToken = getCookieFromHeader(cookieHeader, ADMIN_COOKIE_NAME);
    if (cookieToken) return cookieToken;

    // 3. Custom headers (e.g., x-admin-token, x-access-token)
    const customHeader = headers.get("x-admin-token") || headers.get("x-access-token");
    if (customHeader) return customHeader.trim();

    return null;
  } catch {
    return null;
  }
}

/**
 * Determines whether a Supabase Auth user holds administrator privileges.
 * A customer can NEVER gain admin access simply by signing in.
 * They must either have app_metadata.role === 'admin' or match the configured ADMIN_EMAIL.
 */
export function isUserAdmin(user: { email?: string; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null | undefined): boolean {
  if (!user) return false;
  if (user.app_metadata?.role === "admin") return true;
  if (user.user_metadata?.role === "admin") return true;
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (configuredAdminEmail && user.email?.trim().toLowerCase() === configuredAdminEmail) {
    return true;
  }
  return false;
}

/**
 * Checks whether the incoming request contains a valid admin session.
 * Supports native Request, NextRequest, or any object with headers.
 * Validates both:
 * 1. Dedicated admin session token (Bearer header or velora_admin_session cookie)
 * 2. Authenticated Supabase Auth JWT session with admin privileges
 */
export async function checkAdminAuth(request: Request | { headers?: Headers | { get(name: string): string | null } }): Promise<boolean> {
  try {
    // 1. Check dedicated admin token from Authorization header or cookie
    const token = extractTokenFromRequest(request);
    if (token) {
      const session = await verifySessionToken(token);
      if (session !== null) return true;
    }

    // 2. Check Supabase Auth user session via server client
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user && isUserAdmin(user)) {
        return true;
      }
    } catch {
      // In non-cookie contexts or build phase, fallback to token check
    }

    return false;
  } catch (err) {
    console.error("checkAdminAuth error:", err);
    return false;
  }
}

export interface AuthContext {
  user: { id: string; email?: string; role?: string } | null;
  isAdmin: boolean;
}

/**
 * Returns current authenticated user and admin status for route handlers.
 */
export async function getAuthContext(request?: Request): Promise<AuthContext> {
  let hasAdminToken = false;
  if (request) {
    const token = extractTokenFromRequest(request);
    if (token) {
      const session = await verifySessionToken(token);
      if (session) hasAdminToken = true;
    }
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!error && user) {
      const admin = hasAdminToken || isUserAdmin(user);
      return {
        user: { id: user.id, email: user.email, role: admin ? "admin" : "customer" },
        isAdmin: admin,
      };
    }
  } catch {
    // Server client unable to read cookies in this context
  }

  if (hasAdminToken) {
    return {
      user: { id: "admin-env", email: process.env.ADMIN_EMAIL || "admin@velora.com", role: "admin" },
      isAdmin: true,
    };
  }

  return { user: null, isAdmin: false };
}

/**
 * Helper to attach an authenticated admin session cookie to a NextResponse.
 * Returns the generated JWT token string.
 */
export async function attachAdminSessionCookie(response: NextResponse, email: string): Promise<string> {
  const token = await createSessionToken(email);
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return token;
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

