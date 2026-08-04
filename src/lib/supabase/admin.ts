import { createClient } from "@supabase/supabase-js";

function sanitizeKey(key?: string): string {
  if (!key) return "";
  const trimmed = key.trim();
  const match = trimmed.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  return match ? match[0] : trimmed.split(/\s+/)[0] || "";
}

export function createSupabaseAdminClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().split(/\s+/)[0];
  const serviceRoleKey = sanitizeKey(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
