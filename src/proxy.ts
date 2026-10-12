import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { verifySessionToken, ADMIN_COOKIE_NAME, isUserAdmin } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Refresh Supabase Auth session tokens and sync cookies
  const { supabaseResponse, user } = await updateSession(request);

  // 2. Protect Admin routes
  if (pathname.startsWith("/admin")) {
    const isSupabaseAdmin = isUserAdmin(user);
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const hasAdminCookie = (await verifySessionToken(token)) !== null;

    const isAdmin = isSupabaseAdmin || hasAdminCookie;

    // Case A: User visiting /admin/login while already an authorized admin
    if (pathname === "/admin/login") {
      if (isAdmin) {
        const redirectRes = NextResponse.redirect(new URL("/admin/orders", request.url));
        // Preserve any cookie updates from session refresh
        supabaseResponse.cookies.getAll().forEach((c) => {
          redirectRes.cookies.set(c.name, c.value, c);
        });
        return redirectRes;
      }
      return supabaseResponse;
    }

    // Case B: Protected admin dashboard pages (/admin/orders, /admin/products, etc.)
    if (!isAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const redirectRes = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies.getAll().forEach((c) => {
        redirectRes.cookies.set(c.name, c.value, c);
      });
      return redirectRes;
    }
  }

  return supabaseResponse;
}

// Support both proxy convention and middleware compatibility
export default proxy;
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Images, media, and fonts
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
