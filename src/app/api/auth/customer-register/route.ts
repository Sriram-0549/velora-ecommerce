import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Creates a stateless server-side Supabase client for customer registration.
 * persistSession: false guarantees that existing browser cookies are not modified or mixed.
 * Uses public/anonymous credentials only to respect Supabase Auth signup and confirmation settings.
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
 * POST /api/auth/customer-register
 *
 * Stateless customer registration endpoint.
 * Accepts:
 *   { "name": "Jane Doe", "email": "customer@example.com", "password": "securePassword123" }
 *
 * Returns (when email confirmation is required):
 *   {
 *     "success": true,
 *     "requiresEmailConfirmation": true,
 *     "message": "Registration successful. Please check your email to verify your account before logging in.",
 *     "user": {
 *       "id": "<user_uuid>",
 *       "email": "customer@example.com",
 *       "name": "Jane Doe",
 *       "role": "customer"
 *     }
 *   }
 *
 * Returns (when email confirmation is not required):
 *   {
 *     "success": true,
 *     "requiresEmailConfirmation": false,
 *     "message": "Account created successfully. You can now log in.",
 *     "token": "<access_token_jwt>",
 *     "tokenType": "Bearer",
 *     "expiresIn": 3600,
 *     "user": {
 *       "id": "<user_uuid>",
 *       "email": "customer@example.com",
 *       "name": "Jane Doe",
 *       "role": "customer"
 *     }
 *   }
 */
export async function POST(request: NextRequest) {
  try {
    let body: { name?: unknown; email?: unknown; password?: unknown };
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
          message: "Request body must be a JSON object containing name, email, and password.",
        },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    // Field presence validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Name, email, and password are all required.",
        },
        { status: 400 }
      );
    }

    // Name length validation
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Name must be between 2 and 100 characters in length.",
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "A valid email address must be provided.",
        },
        { status: 400 }
      );
    }

    // Password strength / length validation
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Password must be at least 6 characters in length.",
        },
        { status: 400 }
      );
    }

    let supabase;
    try {
      supabase = getStatelessAuthClient();
    } catch (configError: unknown) {
      console.error("Customer registration configuration error:", configError);
      return NextResponse.json(
        {
          error: "Server Error",
          message: "Authentication service is misconfigured. Verify environment variables.",
        },
        { status: 500 }
      );
    }

    // Attempt registration via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name,
        },
      },
    });

    // Handle Supabase Auth errors
    if (error) {
      const errorMsg = error.message.toLowerCase();
      // Handle duplicate email conflict
      if (
        error.status === 422 ||
        error.status === 409 ||
        errorMsg.includes("already registered") ||
        errorMsg.includes("already exists") ||
        errorMsg.includes("user already registered")
      ) {
        return NextResponse.json(
          {
            error: "Conflict",
            message: "An account with this email address already exists.",
          },
          { status: 409 }
        );
      }

      // Handle rate limit
      if (error.status === 429 || errorMsg.includes("security purposes") || errorMsg.includes("rate limit")) {
        return NextResponse.json(
          {
            error: "Too Many Requests",
            message: error.message || "Too many registration attempts. Please try again later.",
          },
          { status: 429 }
        );
      }

      // Handle invalid credentials / weak password / invalid email domain rejected by provider
      if (error.status === 400) {
        return NextResponse.json(
          {
            error: "Bad Request",
            message: error.message,
          },
          { status: 400 }
        );
      }

      // Generic fallback for any other Supabase error (do not leak internal details)
      console.error("Supabase customer registration error:", error);
      return NextResponse.json(
        {
          error: "Registration Failed",
          message: error.message || "Failed to register customer account.",
        },
        { status: error.status && error.status >= 400 && error.status < 600 ? error.status : 500 }
      );
    }

    // Supabase returns an obfuscated user object with empty identities array when email confirmation is enabled and the email already exists
    if (data?.user?.identities && data.user.identities.length === 0) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "An account with this email address already exists.",
        },
        { status: 409 }
      );
    }

    if (!data?.user) {
      return NextResponse.json(
        {
          error: "Internal Server Error",
          message: "User account could not be created.",
        },
        { status: 500 }
      );
    }

    // Determine email confirmation status based on Supabase response
    const hasActiveSession = Boolean(data.session && data.session.access_token);
    const isEmailConfirmed = Boolean(
      (data.user as { confirmed_at?: string | null; email_confirmed_at?: string | null }).confirmed_at ||
      (data.user as { confirmed_at?: string | null; email_confirmed_at?: string | null }).email_confirmed_at ||
      hasActiveSession
    );

    const requiresEmailConfirmation = !isEmailConfirmed;

    // Safe user payload - strictly NO secrets, passwords, or service-role keys
    const safeUser = {
      id: data.user.id,
      email: data.user.email,
      name,
      role: "customer",
    };

    if (requiresEmailConfirmation) {
      return NextResponse.json(
        {
          success: true,
          requiresEmailConfirmation: true,
          message: "Registration successful. Please check your email to verify your account before logging in.",
          user: safeUser,
        },
        { status: 201 }
      );
    }

    // Email confirmation not required: account is immediately ready to log in
    return NextResponse.json(
      {
        success: true,
        requiresEmailConfirmation: false,
        message: "Account created successfully. You can now log in.",
        ...(data.session?.access_token && {
          token: data.session.access_token,
          tokenType: "Bearer",
          expiresIn: data.session.expires_in,
        }),
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Customer registration unexpected error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred during customer registration.",
      },
      { status: 500 }
    );
  }
}
