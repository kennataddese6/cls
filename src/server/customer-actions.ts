"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

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
