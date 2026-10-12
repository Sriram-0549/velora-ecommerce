import { NextResponse } from "next/server";
import { removeAdminSessionCookie } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully." },
      { status: 200 }
    );

    // 1. Remove admin session cookie
    removeAdminSessionCookie(response);

    // 2. Sign out of Supabase Auth server session if active
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignored if already signed out
    }

    return response;
  } catch (err: unknown) {
    console.error("Admin logout error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during logout." },
      { status: 500 }
    );
  }
}
