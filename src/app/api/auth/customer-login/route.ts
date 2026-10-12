import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isUserAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Creates a stateless server-side Supabase client for customer authentication.
 * persistSession: false guarantees that existing browser cookies are not modified or mixed.
 */
function getStatelessAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or anonymous key is not configured.");
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * POST /api/auth/customer-login
 *
 * Stateless customer authentication endpoint.
 * Accepts:
 *   { "email": "customer@example.com", "password": "password" }
 *
 * Returns:
 *   {
 *     "success": true,
 *     "token": "<supabase_access_token_jwt>",
 *     "tokenType": "Bearer",
 *     "expiresIn": 3600,
 *     "user": {
 *       "id": "<user_uuid>",
 *       "email": "customer@example.com",
 *       "role": "customer"
 *     }
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    let body: { email?: unknown; password?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Request body must be a valid JSON object.",
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Request body must be a JSON object containing email and password.",
        },
        { status: 400 }
      );
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Both email and password are required.",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "A valid email address must be provided.",
        },
        { status: 400 }
      );
    }

    let supabase;
    try {
      supabase = getStatelessAuthClient();
    } catch (configError: unknown) {
      console.error("Customer login configuration error:", configError);
      return NextResponse.json(
        {
          error: "Server Error",
          message: "Authentication service is misconfigured. Verify environment variables.",
        },
        { status: 500 }
      );
    }

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session?.access_token || !data?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid email or password. Please verify your credentials.",
        },
        { status: 401 }
      );
    }

    // Safe user payload (customer role only, no secrets or refresh tokens)
    const isAdmin = isUserAdmin(data.user);
    const safeRole = isAdmin ? "admin" : "customer";

    return NextResponse.json(
      {
        success: true,
        message: "Authenticated successfully.",
        token: data.session.access_token,
        tokenType: "Bearer",
        expiresIn: data.session.expires_in,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: safeRole,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Customer login unexpected error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred during customer authentication.",
      },
      { status: 500 }
    );
  }
}
