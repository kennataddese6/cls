"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getCustomersList() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*, bookings(count)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getCustomersList]", error);
    return [];
  }

  return data;
}

export async function getCustomerById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: customer, error } = await supabase
    .from("customers")
    .select("*, addresses:customer_addresses(*), bookings(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getCustomerById]", error);
    return null;
  }

  return customer;
}

export async function updateCustomerAction(
  id: string,
  data: {
    full_name: string;
    email: string;
    phone: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminSupabase = createSupabaseAdminClient();

    const { error } = await adminSupabase
      .from("customers")
      .update({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
      })
      .eq("id", id);

    if (error) {
      console.error("[updateCustomerAction]", error);
      return { success: false, error: error.message };
    }

    // Also update profiles table if linked profile exists
    try {
      await adminSupabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
        })
        .eq("id", id);
    } catch {}

    revalidatePath("/dashboard/customers");
    revalidatePath(`/dashboard/customers/${id}`);
    revalidatePath("/dashboard/jobs");
    revalidatePath("/dashboard/quotes");

    return { success: true };
  } catch (err: any) {
    console.error("[updateCustomerAction err]", err);
    return { success: false, error: err.message || "Failed to update customer details" };
  }
}
