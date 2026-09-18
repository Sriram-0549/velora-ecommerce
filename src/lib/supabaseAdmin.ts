import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Checks whether valid Supabase Admin service-role credentials are set
 */
export const isSupabaseAdminConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseServiceRoleKey &&
      !supabaseUrl.includes("your-project-ref") &&
      !supabaseServiceRoleKey.includes("your-supabase-service-role-key") &&
      !supabaseServiceRoleKey.includes("placeholder")
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
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseServiceRoleKey || "placeholder-service-role-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export default supabaseAdmin;
