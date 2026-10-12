import { NextRequest, NextResponse } from "next/server";
import {
  extractTokenFromRequest,
  verifySessionTokenWithDetails,
  isUserAdmin,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Extracts the token string from request headers, query string, cookie, or request body.
 */
async function resolveToken(request: NextRequest): Promise<string | null> {
  // 1. Check Authorization header, cookies, and custom headers
  const headerToken = extractTokenFromRequest(request);
  if (headerToken) return headerToken;

  // 2. Check query string: ?token=...
  const queryToken = request.nextUrl.searchParams.get("token");
  if (queryToken && queryToken.trim()) {
    return queryToken.trim();
  }

  // 3. Check JSON request body if POST/PUT
  if (request.method === "POST" || request.method === "PUT") {
    try {
      const cloned = request.clone();
      const body = await cloned.json().catch(() => ({}));
      if (typeof body?.token === "string" && body.token.trim()) {
        return body.token.trim();
      }
    } catch {
      // Body not JSON or empty
    }
  }

  return null;
}

/**
 * Core validation logic for both GET and POST requests.
 */
async function handleVerify(request: NextRequest) {
  try {
    const token = await resolveToken(request);

    if (!token) {
      return NextResponse.json(
        {
          valid: false,
          status: "unauthorized",
          code: "MISSING_TOKEN",
          error: `No token provided. Provide the JWT token via Authorization header ('Bearer <token>'), '${ADMIN_COOKIE_NAME}' cookie, query parameter '?token=<token>', or JSON body '{ "token": "<token>" }'.`,
        },
        { status: 401 }
      );
    }

    // 1. Attempt to verify as Admin HMAC-SHA256 JWT session token
    const result = await verifySessionTokenWithDetails(token);

    if (result.valid && result.payload) {
      const now = Math.floor(Date.now() / 1000);
      const remainingSeconds = Math.max(0, result.payload.exp - now);

      return NextResponse.json(
        {
          valid: true,
          status: "authenticated",
          tokenType: "admin_session",
          algorithm: "HS256",
          user: {
            email: result.payload.email,
            role: result.payload.role,
          },
          claims: {
            iat: result.payload.iat,
            exp: result.payload.exp,
            issuedAt: new Date(result.payload.iat * 1000).toISOString(),
            expiresAt: new Date(result.payload.exp * 1000).toISOString(),
            remainingSeconds,
          },
        },
        { status: 200 }
      );
    }

    // 2. If signature did not match, check if it is a Supabase Auth access token
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        const isAdmin = isUserAdmin(user);
        return NextResponse.json(
          {
            valid: true,
            status: "authenticated",
            tokenType: "supabase_user",
            user: {
              id: user.id,
              email: user.email,
              role: isAdmin ? "admin" : "customer",
            },
          },
          { status: 200 }
        );
      }
    } catch {
      // Supabase verification unavailable or failed
    }

    // 3. Verification failed - return structured diagnosis
    const statusCode = 401;
    return NextResponse.json(
      {
        valid: false,
        status: "unauthorized",
        code: result.code || "INVALID_TOKEN",
        error: result.error || "Token verification failed.",
        ...(result.payload?.exp
          ? {
              expiredAt: new Date(result.payload.exp * 1000).toISOString(),
            }
          : {}),
      },
      { status: statusCode }
    );
  } catch (err: unknown) {
    console.error("JWT verification API error:", err);
    return NextResponse.json(
      {
        valid: false,
        status: "error",
        error: "An unexpected error occurred while verifying the token.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/verify
 * Accepts token via:
 * - Header: Authorization: Bearer <token>
 * - Cookie: velora_admin_session=<token>
 * - Query param: ?token=<token>
 */
export async function GET(request: NextRequest) {
  return handleVerify(request);
}

/**
 * POST /api/admin/verify
 * Accepts token via:
 * - JSON body: { "token": "<token>" }
 * - Header: Authorization: Bearer <token>
 * - Cookie: velora_admin_session=<token>
 * - Query param: ?token=<token>
 */
export async function POST(request: NextRequest) {
  return handleVerify(request);
}
