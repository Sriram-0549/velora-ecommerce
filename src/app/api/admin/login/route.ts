import { NextRequest, NextResponse } from "next/server";
import { validateAdminCredentials, attachAdminSessionCookie, createSessionToken, isUserAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    let isAuthorized = false;

    // 1. Check against configured server admin credentials
    if (validateAdminCredentials(email, password)) {
      isAuthorized = true;
    }

    // 2. Check against Supabase Auth (and verify admin privilege)
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!error && data?.user) {
        if (isUserAdmin(data.user)) {
          isAuthorized = true;
        } else if (!isAuthorized) {
          // Regular customer attempting admin login - forbid immediately
          return NextResponse.json(
            { error: "Access denied. Customer accounts cannot access the administrative portal." },
            { status: 403 }
          );
        }
      }
    } catch {
      // Offline fallback: relies on server admin credentials
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your administrator email and password." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(email);

    const response = NextResponse.json(
      {
        success: true,
        message: "Authenticated successfully.",
        token,
        tokenType: "Bearer",
        user: {
          email: email.trim().toLowerCase(),
          role: "admin",
        },
      },
      { status: 200 }
    );

    // Attach HTTP-only cookie for web admin dashboard sessions
    await attachAdminSessionCookie(response, email);

    return response;
  } catch (err: unknown) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
