import { createBrowserClient } from "@supabase/ssr";

function sanitizeKey(key?: string): string {
  if (!key) return "placeholder-key";
  const trimmed = key.trim();
  const match = trimmed.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  return match ? match[0] : trimmed.split(/\s+/)[0] || "placeholder-key";
}

export function createSupabaseBrowserClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co").trim().split(/\s+/)[0];
  const anonKey = sanitizeKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return createBrowserClient(url, anonKey);
}
