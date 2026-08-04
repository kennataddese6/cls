"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { success: true; role: "admin" | "cleaner" | "customer"; redirectUrl: string }
  | { success: false; error: string };

export async function signInAction(formData: { email: string; password: string }): Promise<AuthActionResult> {
  console.log("[signInAction] Attempting login for email:", formData.email);
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error || !data.user) {
      console.error("[signInAction] Auth error:", error?.message);
      return { success: false, error: error?.message || "Invalid email or password" };
    }

    console.log("[signInAction] Auth success for user ID:", data.user.id);

    // Get user profile role
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileErr) {
      console.warn("[signInAction] Profile fetch error or fallback:", profileErr.message);
    }

    const role = profile?.role || "admin"; // Default to admin if signed in user exists
    let redirectUrl = "/dashboard/overview";

    if (role === "cleaner") {
      redirectUrl = "/cleaner/dashboard";
    } else if (role === "customer") {
      redirectUrl = "/";
    }

    console.log("[signInAction] Logged in successfully as role:", role, "redirecting to:", redirectUrl);

    return {
      success: true,
      role,
      redirectUrl,
    };
  } catch (err: unknown) {
    console.error("[signInAction] Unexpected error during login:", err);
    const errorMessage = err instanceof Error ? err.message : "An unexpected authentication error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/v1/login");
}

export async function getCurrentUserProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return {
    user,
    profile,
  };
}
