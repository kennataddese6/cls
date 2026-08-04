"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getInvoicesList(statusFilter?: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();
    let query = adminSupabase
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
    return data || [];
  } catch (err) {
    console.error("[getInvoicesList]", err);
    return [];
  }
}

export async function getInvoiceById(id: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const { data: invoice, error } = await adminSupabase
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
  } catch (err) {
    console.error("[getInvoiceById]", err);
    return null;
  }
}

export async function getInvoiceByToken(token: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const { data: invoice, error } = await adminSupabase
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
  } catch (err) {
    console.error("[getInvoiceByToken]", err);
    return null;
  }
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

    const adminSupabase = createSupabaseAdminClient();

    const { data: invoice } = await adminSupabase
      .from("invoices")
      .select("id, booking_id, total, amount_paid")
      .eq("id", input.invoice_id)
      .single();

    if (!invoice) throw new Error("Invoice not found");

    // 1. Insert Payment Record
    await adminSupabase.from("payments").insert({
      invoice_id: input.invoice_id,
      amount: input.amount,
      method: input.method,
      reference: input.reference || null,
      notes: input.notes || null,
      recorded_by: user?.id || null,
      payment_date: new Date().toISOString().split("T")[0],
    });

    // 2. Recalculate total paid
    const newAmountPaid = (invoice.amount_paid || 0) + input.amount;
    const isFullyPaid = newAmountPaid >= invoice.total;
    const newStatus = isFullyPaid ? "paid" : "part_paid";

    // 3. Update Invoice
    await adminSupabase
      .from("invoices")
      .update({
        amount_paid: newAmountPaid,
        status: newStatus,
        paid_at: isFullyPaid ? new Date().toISOString() : null,
      })
      .eq("id", input.invoice_id);

    // 4. Update Booking status to paid if fully paid
    if (isFullyPaid) {
      await adminSupabase.from("bookings").update({ status: "paid" }).eq("id", invoice.booking_id);
    }

    // 5. Audit Log
    await adminSupabase.from("audit_logs").insert({
      actor_id: user?.id || null,
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
