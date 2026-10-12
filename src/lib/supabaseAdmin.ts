import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Normalizes and validates the Supabase URL so that accidental omission of
 * https://, stray whitespace, or surrounding quotes never crashes module evaluation.
 */
function getSafeSupabaseUrl(url?: string): string {
  if (!url) return "https://placeholder-project.supabase.co";
  let clean = url.trim().replace(/^["']|["']$/g, "").trim();
  if (!clean) return "https://placeholder-project.supabase.co";

  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = `https://${clean}`;
  }

  try {
    const parsed = new URL(clean);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return clean;
    }
  } catch {
    // URL parsing failed; fallback to safe placeholder
  }

  return "https://placeholder-project.supabase.co";
}

/**
 * Checks whether valid Supabase Admin service-role credentials are set
 */
export const isSupabaseAdminConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseServiceRoleKey) return false;
  const cleanUrl = supabaseUrl.trim().replace(/^["']|["']$/g, "").trim();
  const cleanKey = supabaseServiceRoleKey.trim().replace(/^["']|["']$/g, "").trim();
  return Boolean(
    cleanUrl &&
      cleanKey &&
      !cleanUrl.includes("your-project-ref") &&
      !cleanUrl.includes("placeholder") &&
      !cleanKey.includes("your-supabase-service-role-key") &&
      !cleanKey.includes("placeholder")
  );
};

/**
 * Server-only Supabase Admin Client.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row-Level Security (RLS)
 * for authorized server-side operations (e.g. creating orders).
 *
 * IMPORTANT SECURITY RULES:
 * 1. This client must ONLY be imported in server-side code (Route Handlers, Server Actions).
 * 2. It must NEVER be imported into Client Components ("use client").
 * 3. SUPABASE_SERVICE_ROLE_KEY must NEVER have the NEXT_PUBLIC_ prefix.
 * 4. The service role key is never returned in any API responses.
 */
function createAdminClient() {
  const safeUrl = getSafeSupabaseUrl(supabaseUrl);
  const safeKey = (supabaseServiceRoleKey?.trim().replace(/^["']|["']$/g, "") || "") || "placeholder-service-role-key";

  try {
    return createClient(safeUrl, safeKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn("Failed to initialize Supabase admin client with configured URL, falling back to dummy client:", err);
    return createClient("https://placeholder-project.supabase.co", "placeholder-service-role-key", {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}

export const supabaseAdmin = createAdminClient();

export default supabaseAdmin;
