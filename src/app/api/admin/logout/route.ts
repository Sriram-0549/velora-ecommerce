import { NextResponse } from "next/server";
import { removeAdminSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully." },
      { status: 200 }
    );

    removeAdminSessionCookie(response);
    return response;
  } catch (err: unknown) {
    console.error("Admin logout error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during logout." },
      { status: 500 }
    );
  }
}
