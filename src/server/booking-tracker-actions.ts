"use server";

import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface TrackedBookingInfo {
  token: string;
  reference: string;
  savedAt: string;
}

export interface LiveBookingDetails {
  id: string;
  reference: string;
  token: string;
  service_type: string;
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
  total_price?: number;
  customer_name?: string;
  cleaner_name?: string;
  quote_token?: string;
  invoice_token?: string;
  created_at: string;
}

const COOKIE_NAME = "cls_customer_bookings";

export async function saveCustomerBookingCookieAction(token: string, reference: string) {
  try {
    const cookieStore = await cookies();
    const existingStr = cookieStore.get(COOKIE_NAME)?.value;

    let items: TrackedBookingInfo[] = [];
    if (existingStr) {
      try {
        items = JSON.parse(existingStr);
      } catch {}
    }

    if (!items.some((i) => i.token === token || i.reference === reference)) {
      items.unshift({
        token,
        reference,
        savedAt: new Date().toISOString(),
      });
    }

    cookieStore.set(COOKIE_NAME, JSON.stringify(items), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getCustomerTrackedBookingsAction(): Promise<LiveBookingDetails[]> {
  try {
    const cookieStore = await cookies();
    const existingStr = cookieStore.get(COOKIE_NAME)?.value;

    if (!existingStr) return [];

    let items: TrackedBookingInfo[] = [];
    try {
      items = JSON.parse(existingStr);
    } catch {
      return [];
    }

    if (items.length === 0) return [];

    const tokens = items.map((i) => i.token);
    const references = items.map((i) => i.reference);

    const adminSupabase = createSupabaseAdminClient();

    // Query bookings by token or reference
    const { data: bookings } = await adminSupabase
      .from("bookings")
      .select("*, customer:customers(*), jobs(*, cleaner:cleaners(*, profile:profiles(*))), quotes(*), invoices(*)")
      .or(
        `token.in.(${tokens.map((t) => `"${t}"`).join(",")}),reference.in.(${references.map((r) => `"${r}"`).join(",")})`,
      )
      .order("created_at", { ascending: false });

    if (!bookings || bookings.length === 0) return [];

    return bookings.map((b) => {
      const activeJob = b.jobs?.[0];
      const latestQuote = b.quotes?.[0];
      const latestInvoice = b.invoices?.[0];

      return {
        id: b.id,
        reference: b.reference || "BOOKING",
        token: b.token,
        service_type: b.service_type || "Cleaning Service",
        status: b.status || "under_review",
        scheduled_date: activeJob?.scheduled_date || b.created_at?.split("T")[0],
        scheduled_time: activeJob?.scheduled_time || "Morning",
        total_price: b.total_price || latestQuote?.total || 100,
        customer_name: b.customer?.full_name || "Valued Customer",
        cleaner_name: activeJob?.cleaner?.profile?.full_name || "Assigned Cleaner",
        quote_token: latestQuote?.token,
        invoice_token: latestInvoice?.token,
        created_at: b.created_at,
      };
    });
  } catch (err) {
    console.error("[getCustomerTrackedBookingsAction]", err);
    return [];
  }
}
