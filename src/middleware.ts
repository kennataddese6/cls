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

  // Log all navigation requests through middleware
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/cleaner") || pathname.startsWith("/unauthorized")) {
    console.log("[Middleware]", {
      pathname,
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      user_metadata: user?.user_metadata,
      app_metadata: user?.app_metadata,
    });
  }

  // Route guards
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")) {
        return response;
      }
      console.log("[Middleware] Unauthenticated user accessing dashboard -> Redirecting to login");
      return NextResponse.redirect(new URL(`/auth/v1/login?next=${pathname}`, request.url));
    }

    // Determine user role from JWT metadata or database profile
    let role = user.user_metadata?.role || user.app_metadata?.role;

    if (!role) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      role = profile?.role;
    }

    console.log("[Middleware] Dashboard route check. Resolved role:", role);

    // If role is explicitly cleaner or customer, deny admin access
    if (role === "cleaner" || role === "customer") {
      console.warn("[Middleware] Access denied for role:", role, "on route:", pathname);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (pathname.startsWith("/cleaner")) {
    if (!user) {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")) {
        return response;
      }
      return NextResponse.redirect(new URL(`/auth/v1/login?next=${pathname}`, request.url));
    }

    let role = user.user_metadata?.role || user.app_metadata?.role;

    if (!role) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      role = profile?.role;
    }

    if (role !== "cleaner" && role !== "admin") {
      console.warn("[Middleware] Cleaner access denied for role:", role, "on route:", pathname);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
