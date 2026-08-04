"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getInvoicesList(statusFilter?: string) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("invoices")
    .select("*, customer:customers(*), booking:bookings(*)")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getInvoicesList]", error);
    return [];
  }
  return data;
}

export async function getInvoiceById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "*, customer:customers(*), booking:bookings(*, address:customer_addresses(*)), quote:quotes(*, items:quote_items(*)), payments(*)",
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getInvoiceById]", error);
    return null;
  }
  return invoice;
}

export async function getInvoiceByToken(token: string) {
  const supabase = await createSupabaseServerClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "*, customer:customers(*), booking:bookings(*, address:customer_addresses(*)), quote:quotes(*, items:quote_items(*)), payments(*)",
    )
    .eq("token", token)
    .single();

  if (error) {
    console.error("[getInvoiceByToken]", error);
    return null;
  }
  return invoice;
}

export async function recordPaymentAction(input: {
  invoice_id: string;
  amount: number;
  method: "bank_transfer" | "cash";
  reference?: string;
  notes?: string;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized: Admin login required");

    const { data: invoice } = await supabase
      .from("invoices")
      .select("id, booking_id, total, amount_paid")
      .eq("id", input.invoice_id)
      .single();

    if (!invoice) throw new Error("Invoice not found");

    // 1. Insert Payment Record
    await supabase.from("payments").insert({
      invoice_id: input.invoice_id,
      amount: input.amount,
      method: input.method,
      reference: input.reference || null,
      notes: input.notes || null,
      recorded_by: user.id,
      payment_date: new Date().toISOString().split("T")[0],
    });

    // 2. Recalculate total paid
    const newAmountPaid = (invoice.amount_paid || 0) + input.amount;
    const isFullyPaid = newAmountPaid >= invoice.total;
    const newStatus = isFullyPaid ? "paid" : "part_paid";

    // 3. Update Invoice
    await supabase
      .from("invoices")
      .update({
        amount_paid: newAmountPaid,
        status: newStatus,
        paid_at: isFullyPaid ? new Date().toISOString() : null,
      })
      .eq("id", input.invoice_id);

    // 4. Update Booking status to paid if fully paid
    if (isFullyPaid) {
      await supabase.from("bookings").update({ status: "paid" }).eq("id", invoice.booking_id);
    }

    // 5. Audit Log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      actor_role: "admin",
      action: "payment.recorded",
      record_type: "invoices",
      record_id: input.invoice_id,
      new_value: { amount: input.amount, method: input.method, newStatus },
    });

    revalidatePath(`/dashboard/invoices/${input.invoice_id}`);
    revalidatePath("/dashboard/invoices");

    return { success: true };
  } catch (err: unknown) {
    console.error("[recordPaymentAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to record payment";
    return { success: false, error: errorMessage };
  }
}
