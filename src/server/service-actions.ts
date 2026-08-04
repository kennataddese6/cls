"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface ServiceItem {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  checklist: string[];
  created_at?: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "service-1",
    title: "Standard Domestic Cleaning",
    price: "£80.00",
    duration: "2 hours",
    description: "Comprehensive home cleaning covering kitchens, bathrooms, living areas, and bedrooms.",
    checklist: [
      "Dusting all accessible surfaces and furniture",
      "Vacuuming carpets and rugs",
      "Wiping and mopping hard floor surfaces",
      "Sanitising kitchen countertops and sink",
      "Scrubbing toilets, basins, and showers",
      "Emptying waste bins",
    ],
  },
  {
    id: "service-2",
    title: "Deep Spring Cleaning",
    price: "£150.00",
    duration: "4 hours",
    description: "Thorough deep clean targeting built-up dirt, limescale, appliances, and hard-to-reach spaces.",
    checklist: [
      "Everything in Standard Cleaning",
      "Deep oven and range hood cleaning",
      "Wiping inside kitchen appliances",
      "Wiping doors, frames, and light switches",
      "Cleaning skirting boards and window sills",
      "Limescale and soap scum removal in bathrooms",
    ],
  },
  {
    id: "service-3",
    title: "End of Tenancy Cleaning",
    price: "£220.00",
    duration: "6 hours",
    description: "Strict deposit-guaranteed cleaning for tenants, estate agents, and landlords.",
    checklist: [
      "100% Deposit return guarantee clean",
      "Deep cleaning inside all cupboards & drawers",
      "Full kitchen and appliance degreasing",
      "Deep bathroom descaling and sanitisation",
      "Internal window and frame cleaning",
      "Timestamped before & after photo evidence report",
    ],
  },
  {
    id: "service-4",
    title: "Office & Commercial Cleaning",
    price: "£120.00",
    duration: "3 hours",
    description: "Flexible, high-standard commercial cleaning for offices, clinics, and retail properties.",
    checklist: [
      "Workstation and desk sanitisation",
      "Keyboard and phone sanitisation",
      "Staff kitchen and breakroom cleaning",
      "Restroom cleaning and restocking check",
      "High-traffic floor care and vacuuming",
      "Tailored cleaning schedules (daily/weekly)",
    ],
  },
];

export async function getServicesListAction(): Promise<ServiceItem[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_SERVICES;
    }

    return data.map((item) => ({
      id: item.id,
      title: item.title || "Cleaning Service",
      price: item.price || "£100.00",
      duration: item.duration || "3 hours",
      description: item.description || "",
      checklist: Array.isArray(item.checklist) ? item.checklist : [],
    })) as ServiceItem[];
  } catch {
    return DEFAULT_SERVICES;
  }
}

export async function createServiceAction(data: {
  title: string;
  price: string;
  duration: string;
  description: string;
  checklist: string[];
}) {
  try {
    const supabase = createSupabaseAdminClient();

    const { data: created, error } = await supabase
      .from("services")
      .insert({
        title: data.title,
        price: data.price,
        duration: data.duration,
        description: data.description,
        checklist: data.checklist,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    return { success: true, item: created };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create service" };
  }
}

export async function updateServiceAction(
  id: string,
  data: {
    title: string;
    price: string;
    duration: string;
    description: string;
    checklist: string[];
  },
) {
  try {
    const supabase = createSupabaseAdminClient();

    // Check if updating a default item with non-UUID id
    if (id.startsWith("service-")) {
      // Find if a row with this title exists
      const { data: existing } = await supabase.from("services").select("id").eq("title", data.title).maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("services")
          .update({
            title: data.title,
            price: data.price,
            duration: data.duration,
            description: data.description,
            checklist: data.checklist,
          })
          .eq("id", existing.id);

        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await supabase.from("services").insert({
          title: data.title,
          price: data.price,
          duration: data.duration,
          description: data.description,
          checklist: data.checklist,
        });

        if (error) return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from("services")
        .update({
          title: data.title,
          price: data.price,
          duration: data.duration,
          description: data.description,
          checklist: data.checklist,
        })
        .eq("id", id);

      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update service" };
  }
}

export async function deleteServiceAction(id: string) {
  try {
    const supabase = createSupabaseAdminClient();
    if (!id.startsWith("service-")) {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete service" };
  }
}
