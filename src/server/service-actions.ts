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

const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  standard: [
    "Dusting all accessible surfaces and furniture",
    "Vacuuming carpets and rugs",
    "Wiping and mopping hard floor surfaces",
    "Sanitising kitchen countertops and sink",
    "Scrubbing toilets, basins, and showers",
    "Emptying waste bins",
  ],
  deep: [
    "Everything in Standard Cleaning",
    "Deep oven and range hood cleaning",
    "Wiping inside kitchen appliances",
    "Wiping doors, frames, and light switches",
    "Cleaning skirting boards and window sills",
    "Limescale and soap scum removal in bathrooms",
  ],
  end_of_tenancy: [
    "100% Deposit return guarantee clean",
    "Deep cleaning inside all cupboards & drawers",
    "Full kitchen and appliance degreasing",
    "Deep bathroom descaling and sanitisation",
    "Internal window and frame cleaning",
    "Timestamped before & after photo evidence report",
  ],
  office: [
    "Workstation and desk sanitisation",
    "Keyboard and phone sanitisation",
    "Staff kitchen and breakroom cleaning",
    "Restroom cleaning and restocking check",
    "High-traffic floor care and vacuuming",
    "Tailored cleaning schedules (daily/weekly)",
  ],
};

function getFallbackChecklist(titleOrType: string): string[] {
  const lower = (titleOrType || "").toLowerCase();
  if (lower.includes("deep")) return DEFAULT_CHECKLISTS.deep;
  if (lower.includes("tenancy")) return DEFAULT_CHECKLISTS.end_of_tenancy;
  if (lower.includes("office") || lower.includes("commercial")) return DEFAULT_CHECKLISTS.office;
  return DEFAULT_CHECKLISTS.standard;
}

let MEMORY_SERVICES: ServiceItem[] = [
  {
    id: "service-1",
    title: "Standard Domestic Cleaning",
    price: "From £80.00",
    duration: "2 hours",
    description: "Comprehensive home cleaning covering kitchens, bathrooms, living areas, and bedrooms.",
    checklist: DEFAULT_CHECKLISTS.standard,
  },
  {
    id: "service-2",
    title: "Deep Spring Cleaning",
    price: "From £150.00",
    duration: "4 hours",
    description: "Thorough deep clean targeting built-up dirt, limescale, appliances, and hard-to-reach spaces.",
    checklist: DEFAULT_CHECKLISTS.deep,
  },
  {
    id: "service-3",
    title: "End of Tenancy Cleaning",
    price: "From £220.00",
    duration: "6 hours",
    description: "Strict deposit-guaranteed cleaning for tenants, estate agents, and landlords.",
    checklist: DEFAULT_CHECKLISTS.end_of_tenancy,
  },
  {
    id: "service-4",
    title: "Office & Commercial Cleaning",
    price: "From £120.00",
    duration: "3 hours",
    description: "Flexible, high-standard commercial cleaning for offices, clinics, and retail properties.",
    checklist: DEFAULT_CHECKLISTS.office,
  },
];

export async function getServicesListAction(): Promise<ServiceItem[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return MEMORY_SERVICES;
    }

    return data.map((item) => {
      const titleStr = item.title || item.name || "Cleaning Service";
      const rawList = item.checklist;
      const checklist =
        Array.isArray(rawList) && rawList.length > 0 ? rawList : getFallbackChecklist(item.service_type || titleStr);

      const priceStr = item.price || (item.base_price ? `From £${item.base_price}` : "From £80");
      const durationStr =
        item.duration || (item.duration_mins ? `${Math.round(item.duration_mins / 60)} hours` : "2 hours");

      return {
        id: item.id,
        title: titleStr,
        price: priceStr,
        duration: durationStr,
        description: item.description || "",
        checklist: checklist,
      };
    }) as ServiceItem[];
  } catch {
    return MEMORY_SERVICES;
  }
}

export async function createServiceAction(data: {
  title: string;
  price: string;
  duration: string;
  description: string;
  checklist: string[];
}): Promise<{ success: boolean; item?: ServiceItem; error?: string }> {
  try {
    const newItem: ServiceItem = {
      id: `service-${Date.now()}`,
      title: data.title,
      price: data.price,
      duration: data.duration,
      description: data.description,
      checklist: data.checklist && data.checklist.length > 0 ? data.checklist : getFallbackChecklist(data.title),
    };

    MEMORY_SERVICES.push(newItem);

    const numericPrice = parseFloat(data.price.replace(/[^0-9.]/g, "")) || 100;
    const supabase = createSupabaseAdminClient();
    await supabase.from("services").insert({
      name: data.title,
      description: data.description,
      base_price: numericPrice,
      duration_mins: 120,
    });

    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    revalidatePath("/book");
    revalidatePath("/");
    return { success: true, item: newItem };
  } catch {
    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    revalidatePath("/book");
    revalidatePath("/");
    return { success: true };
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
): Promise<{ success: boolean; error?: string }> {
  try {
    const checklistToUse =
      data.checklist && data.checklist.length > 0 ? data.checklist : getFallbackChecklist(data.title);

    // Update memory array
    MEMORY_SERVICES = MEMORY_SERVICES.map((s) => (s.id === id ? { ...s, ...data, checklist: checklistToUse } : s));

    const numericPrice = parseFloat(data.price.replace(/[^0-9.]/g, "")) || 100;
    const supabase = createSupabaseAdminClient();

    if (!id.startsWith("service-")) {
      await supabase
        .from("services")
        .update({
          name: data.title,
          description: data.description,
          base_price: numericPrice,
        })
        .eq("id", id);
    } else {
      const { data: existing } = await supabase.from("services").select("id").eq("name", data.title).maybeSingle();
      if (existing) {
        await supabase
          .from("services")
          .update({
            name: data.title,
            description: data.description,
            base_price: numericPrice,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("services").insert({
          name: data.title,
          description: data.description,
          base_price: numericPrice,
        });
      }
    }

    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    revalidatePath("/book");
    revalidatePath("/");
    return { success: true };
  } catch {
    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    revalidatePath("/book");
    revalidatePath("/");
    return { success: true };
  }
}

export async function deleteServiceAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    MEMORY_SERVICES = MEMORY_SERVICES.filter((s) => s.id !== id);

    const supabase = createSupabaseAdminClient();
    if (!id.startsWith("service-")) {
      await supabase.from("services").delete().eq("id", id);
    }

    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    revalidatePath("/book");
    revalidatePath("/");
    return { success: true };
  } catch {
    revalidatePath("/services");
    revalidatePath("/dashboard/services");
    revalidatePath("/book");
    revalidatePath("/");
    return { success: true };
  }
}
