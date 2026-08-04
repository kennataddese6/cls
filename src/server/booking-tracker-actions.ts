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
        token: token || reference,
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

function mapBookingToLiveDetails(b: any): LiveBookingDetails {
  const activeJob = b.jobs?.[0];
  const latestQuote = b.quotes?.[0];
  const latestInvoice = b.invoices?.[0];

  return {
    id: b.id,
    reference: b.reference || "BOOKING",
    token: b.token || b.id,
    service_type: b.service_type || "Cleaning Service",
    status: b.status || "under_review",
    scheduled_date: activeJob?.scheduled_date || b.preferred_date || b.created_at?.split("T")[0],
    scheduled_time: activeJob?.scheduled_time || b.arrival_window || "Morning",
    total_price: b.total_price || latestQuote?.total || 120,
    customer_name: b.customer?.full_name || "Valued Customer",
    cleaner_name: activeJob?.cleaner?.profile?.full_name || (activeJob ? "Assigned Cleaner" : undefined),
    quote_token: latestQuote?.token,
    invoice_token: latestInvoice?.token,
    created_at: b.created_at,
  };
}

export async function getCustomerTrackedBookingsAction(): Promise<LiveBookingDetails[]> {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const cookieStore = await cookies();
    const existingStr = cookieStore.get(COOKIE_NAME)?.value;

    let references: string[] = [];
    let tokens: string[] = [];

    if (existingStr) {
      try {
        const parsed: TrackedBookingInfo[] = JSON.parse(existingStr);
        references = parsed.map((i) => i.reference).filter(Boolean);
        tokens = parsed.map((i) => i.token).filter(Boolean);
      } catch {}
    }

    // 1. Query by cookie references or tokens if present
    if (references.length > 0 || tokens.length > 0) {
      let query = adminSupabase
        .from("bookings")
        .select("*, customer:customers(*), jobs(*, cleaner:cleaners(*, profile:profiles(*))), quotes(*), invoices(*)")
        .order("created_at", { ascending: false });

      if (references.length > 0) {
        query = query.in("reference", references);
      } else {
        query = query.in("token", tokens);
      }

      const { data: matchedBookings } = await query;

      if (matchedBookings && matchedBookings.length > 0) {
        return matchedBookings.map(mapBookingToLiveDetails);
      }
    }

    // 2. Fallback: Fetch all active recent bookings from Supabase Cloud
    const { data: allBookings, error } = await adminSupabase
      .from("bookings")
      .select("*, customer:customers(*), jobs(*, cleaner:cleaners(*, profile:profiles(*))), quotes(*), invoices(*)")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !allBookings) {
      return [];
    }

    return allBookings.map(mapBookingToLiveDetails);
  } catch (err) {
    console.error("[getCustomerTrackedBookingsAction]", err);
    return [];
  }
}
