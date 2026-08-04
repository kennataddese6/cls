"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getDashboardKpis() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: newEnquiriesCount },
    { count: quotesAwaitingCount },
    { count: todaysJobsCount },
    { count: unassignedJobsCount },
    { count: overdueInvoicesCount },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "new_enquiry"),
    supabase.from("quotes").select("*", { count: "exact", head: true }).eq("status", "sent"),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("scheduled_date", new Date().toISOString().split("T")[0]),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "invoice_generated"),
    supabase.from("invoices").select("*", { count: "exact", head: true }).eq("status", "overdue"),
  ]);

  return {
    newEnquiries: newEnquiriesCount || 0,
    quotesAwaiting: quotesAwaitingCount || 0,
    todaysJobs: todaysJobsCount || 0,
    unassignedJobs: unassignedJobsCount || 0,
    overdueInvoices: overdueInvoicesCount || 0,
  };
}

export async function getRecentBookings(limit = 10) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, customer:customers(*), address:customer_addresses(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRecentBookings]", error);
    return [];
  }

  return data;
}

export async function getEnquiriesList(statusFilter?: string) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("bookings")
    .select("*, customer:customers(*), address:customer_addresses(*)")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getEnquiriesList]", error);
    return [];
  }

  return data;
}

export async function getEnquiryById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, customer:customers(*), address:customer_addresses(*), photos(*), quotes(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getEnquiryById]", error);
    return null;
  }

  // Get audit logs for status history
  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("record_type", "bookings")
    .eq("record_id", id)
    .order("created_at", { ascending: false });

  return {
    ...booking,
    auditLogs: auditLogs || [],
  };
}

export async function updateEnquiryStatusAction(
  bookingId: string,
  newStatus: "under_review" | "rejected",
  rejectedReason?: string,
) {
  try {
    const supabase = await createSupabaseServerClient();

    const updateData: { status: string; rejected_reason?: string } = {
      status: newStatus,
    };
    if (rejectedReason) {
      updateData.rejected_reason = rejectedReason;
    }

    const { error } = await supabase.from("bookings").update(updateData).eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    await supabase.from("audit_logs").insert({
      action: "booking.status_changed",
      record_type: "bookings",
      record_id: bookingId,
      new_value: { status: newStatus, rejected_reason: rejectedReason },
    });

    revalidatePath(`/dashboard/enquiries/${bookingId}`);
    revalidatePath("/dashboard/enquiries");
    revalidatePath("/dashboard/overview");

    return { success: true };
  } catch (err: unknown) {
    console.error("[updateEnquiryStatusAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to update status";
    return { success: false, error: errorMessage };
  }
}
