"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  before_description: string;
  after_description: string;
  created_at?: string;
}

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "default-1",
    title: "Kitchen Oven Deep Clean",
    category: "Deep Clean",
    image_url: "/images/oven_clean.png",
    before_description: "Heavy grease accumulation and burnt-on carbon residue.",
    after_description: "Immaculate, restored stainless steel finish and crystal clear glass door.",
  },
  {
    id: "default-2",
    title: "Bathroom Tile & Grout Restoration",
    category: "End of Tenancy",
    image_url: "/images/clean_home.png",
    before_description: "Limescale buildup and mold staining on shower tiles.",
    after_description: "Disinfected, brilliant white grout and limescale-free glass screen.",
  },
];

export async function getGalleryItemsAction(): Promise<GalleryItem[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_GALLERY;
    }

    return data as GalleryItem[];
  } catch {
    return DEFAULT_GALLERY;
  }
}

export async function createGalleryItemAction(itemData: {
  title: string;
  category: string;
  image_url: string;
  before_description: string;
  after_description: string;
}) {
  try {
    const supabase = createSupabaseAdminClient();

    // Ensure gallery_items table exists or create item
    const { data, error } = await supabase
      .from("gallery_items")
      .insert({
        title: itemData.title,
        category: itemData.category,
        image_url: itemData.image_url || "/images/clean_home.png",
        before_description: itemData.before_description,
        after_description: itemData.after_description,
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet in Supabase schema, return message
      if (error.code === "42P01") {
        return { success: false, error: "Database table 'gallery_items' does not exist. Please run migration." };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/gallery");
    revalidatePath("/dashboard/gallery");
    return { success: true, item: data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add gallery item" };
  }
}

export async function deleteGalleryItemAction(id: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/gallery");
    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete gallery item" };
  }
}
