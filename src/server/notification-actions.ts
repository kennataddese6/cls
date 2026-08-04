"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getNotificationsList() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("[getNotificationsList]", error);
      return [];
    }

    return notifications || [];
  } catch (err: unknown) {
    console.error("[getNotificationsList error]", err);
    return [];
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    console.error("[markNotificationReadAction]", err);
    return { success: false };
  }
}
