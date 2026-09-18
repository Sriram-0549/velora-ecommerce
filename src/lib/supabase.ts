import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Checks whether valid Supabase environment variables have been set
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabasePublishableKey &&
      !supabaseUrl.includes("your-project-ref") &&
      !supabaseUrl.includes("placeholder")
  );
};

/**
 * Public Supabase client configuration.
 * Safe for client-side and public data fetching.
 * Uses public publishable/anon key only (never secret/service-role keys).
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabasePublishableKey || "placeholder-key"
);

export default supabase;
