# Supabase

Configuration and usage guide for Supabase in the CLS project.

---

## Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy the Project URL and anon key from Settings → API
3. Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]  # never expose to client
```

---

## Package Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## Client Files

### Server Client (`src/lib/supabase/server.ts`)

Used in Server Components and Server Actions. Reads cookies from the request.

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore: called from Server Component (read-only)
          }
        },
      },
    }
  );
}
```

### Browser Client (`src/lib/supabase/client.ts`)

Used in Client Components only.

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Middleware Client (`src/lib/supabase/middleware.ts`)

Used in `middleware.ts` for session refresh.

```ts
import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

export async function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
}
```

---

## Middleware (`middleware.ts`)

Place at project root (next to `src/`).

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = await createSupabaseMiddlewareClient(request, response);

  // Refresh session — MUST be called before any auth checks
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Route guards
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL(`/auth/v2/login?next=${pathname}`, request.url));
    }
    // Role check: fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (pathname.startsWith("/cleaner")) {
    if (!user) {
      return NextResponse.redirect(new URL(`/auth/v2/login?next=${pathname}`, request.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "cleaner") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## Storage Buckets

Create in Supabase dashboard under Storage:

### `booking-photos` (Private)

Used for photos uploaded by customers at booking time.

```sql
-- Storage policy: admins can read all
CREATE POLICY "admin read all booking photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'booking-photos'
  AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Customers: insert only (no delete, no read of others)
CREATE POLICY "customer upload own booking photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'booking-photos');
```

### `job-photos` (Private)

Used for before/after photos uploaded by cleaners.

```sql
-- Admins: read all
CREATE POLICY "admin read all job photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job-photos'
  AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Cleaners: insert own job photos
CREATE POLICY "cleaner upload own job photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'job-photos' AND auth.role() = 'authenticated');

-- Cleaners: read their own job photos
CREATE POLICY "cleaner read own job photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job-photos'
  AND auth.uid() IS NOT NULL
);
```

---

## Auth Configuration (Supabase Dashboard)

Under Authentication → Settings:

- **Site URL:** `http://localhost:3000` (dev) / `https://[production-domain]` (prod)
- **Redirect URLs:** `http://localhost:3000/auth/callback`, `https://[production-domain]/auth/callback`
- **Email confirmation:** Disabled for cleaners (admin creates accounts manually)
- **Password requirements:** Minimum 8 characters (system generates 12+)

---

## TypeScript Types

Generate types from Supabase schema:

```bash
npx supabase gen types typescript --project-id [project-ref] > src/lib/supabase/database.types.ts
```

Import and use:

```ts
import type { Database } from "@/lib/supabase/database.types";

const supabase = createSupabaseServerClient<Database>();

const { data } = await supabase.from("bookings").select("*");
// data is fully typed
```

---

## Common Patterns

### Fetch current user + role (Server Component)

```ts
const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/auth/v2/login");

const { data: profile } = await supabase
  .from("profiles")
  .select("role, full_name")
  .eq("id", user.id)
  .single();
```

### Insert with audit log (Server Action)

```ts
"use server";

const supabase = await createSupabaseServerClient();

await supabase.from("bookings").update({ status: "under_review" }).eq("id", bookingId);

await supabase.from("audit_logs").insert({
  actor_id: user.id,
  actor_role: profile.role,
  action: "booking.status_changed",
  record_type: "bookings",
  record_id: bookingId,
  old_value: { status: "new_enquiry" },
  new_value: { status: "under_review" },
});

revalidatePath(`/dashboard/enquiries/${bookingId}`);
```

### File upload (Client Component)

```ts
const supabase = createSupabaseBrowserClient();
const path = `${bookingId}/${crypto.randomUUID()}.jpg`;

const { error } = await supabase.storage
  .from("booking-photos")
  .upload(path, file, { contentType: "image/jpeg" });

if (!error) {
  // Save photo record to DB via server action
  await savePhotoRecord({ bookingId, storagePath: path, category: "booking_enquiry" });
}
```
