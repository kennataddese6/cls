import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function sanitizeKey(key?: string): string {
  if (!key) return "placeholder-key";
  const trimmed = key.trim();
  const match = trimmed.match(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  return match ? match[0] : trimmed.split(/\s+/)[0] || "placeholder-key";
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co").trim().split(/\s+/)[0];
  const anonKey = sanitizeKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from Server Component (read-only cookie store)
        }
      },
    },
  });
}
