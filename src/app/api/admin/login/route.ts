import { NextRequest, NextResponse } from "next/server";
import { validateAdminCredentials, attachAdminSessionCookie } from "@/lib/auth";

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

    const isValid = validateAdminCredentials(email, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email and password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { success: true, message: "Authenticated successfully." },
      { status: 200 }
    );

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
