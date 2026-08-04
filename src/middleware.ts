import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = await createSupabaseMiddlewareClient(request, response);

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Route guards
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      // For development/mocking when Supabase isn't configured, allow pass-through if URL is placeholder
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")) {
        return response;
      }
      return NextResponse.redirect(new URL(`/auth/v2/login?next=${pathname}`, request.url));
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (pathname.startsWith("/cleaner")) {
    if (!user) {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")) {
        return response;
      }
      return NextResponse.redirect(new URL(`/auth/v2/login?next=${pathname}`, request.url));
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role !== "cleaner") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
