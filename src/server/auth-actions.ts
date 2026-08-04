"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { success: true; role: "admin" | "cleaner" | "customer"; redirectUrl: string }
  | { success: false; error: string };

export async function signInAction(formData: { email: string; password: string }): Promise<AuthActionResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || "Invalid email or password" };
    }

    // Get user profile role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();

    const role = profile?.role || "customer";
    let redirectUrl = "/dashboard/overview";

    if (role === "cleaner") {
      redirectUrl = "/cleaner/dashboard";
    } else if (role === "customer") {
      redirectUrl = "/";
    }

    return {
      success: true,
      role,
      redirectUrl,
    };
  } catch (err) {
    console.error("[signInAction]", err);
    return { success: false, error: "An unexpected authentication error occurred" };
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
