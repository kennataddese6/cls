"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface QuoteItemInput {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface CreateQuoteInput {
  booking_id: string;
  scope?: string;
  terms?: string;
  expiry_date: string;
  appointment_date?: string;
  appointment_time?: string;
  discount_amount?: number;
  vat_rate?: number;
  items: QuoteItemInput[];
}

export async function createQuoteAction(input: CreateQuoteInput, sendImmediately = false) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized: Admin login required");

    // Calculate totals
    const subtotal = input.items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
    const discount = input.discount_amount || 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const vatRate = input.vat_rate || 0;
    const vatAmount = (discountedSubtotal * vatRate) / 100;
    const total = discountedSubtotal + vatAmount;

    // Check highest version for this booking
    const { data: existingQuotes } = await supabase
      .from("quotes")
      .select("version")
      .eq("booking_id", input.booking_id)
      .order("version", { ascending: false });

    const nextVersion = existingQuotes && existingQuotes.length > 0 ? existingQuotes[0].version + 1 : 1;

    // Insert Quote
    const { data: newQuote, error: quoteErr } = await supabase
      .from("quotes")
      .insert({
        booking_id: input.booking_id,
        version: nextVersion,
        status: sendImmediately ? "sent" : "draft",
        scope: input.scope || "Professional Cleaning Service as requested.",
        terms: input.terms || "Payment due upon completion. Cancellation within 24h subject to £30 fee.",
        expiry_date: input.expiry_date,
        appointment_date: input.appointment_date || null,
        appointment_time: input.appointment_time || null,
        discount_amount: discount,
        vat_rate: vatRate,
        subtotal: discountedSubtotal,
        vat_amount: vatAmount,
        total: total,
        sent_at: sendImmediately ? new Date().toISOString() : null,
        created_by: user.id,
      })
      .select("id, token")
      .single();

    if (quoteErr || !newQuote) {
      throw new Error(quoteErr?.message || "Failed to create quote");
    }

    // Insert Quote Items
    if (input.items.length > 0) {
      const itemsToInsert = input.items.map((item, index) => ({
        quote_id: newQuote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
        sort_order: index,
      }));

      await supabase.from("quote_items").insert(itemsToInsert);
    }

    // Update booking status if sent
    if (sendImmediately) {
      await supabase.from("bookings").update({ status: "quotation_sent" }).eq("id", input.booking_id);

      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        actor_role: "admin",
        action: "quote.sent",
        record_type: "quotes",
        record_id: newQuote.id,
        new_value: { version: nextVersion, total, token: newQuote.token },
      });
    }

    revalidatePath(`/dashboard/enquiries/${input.booking_id}`);
    revalidatePath("/dashboard/quotes");

    return {
      success: true,
      quoteId: newQuote.id,
      quoteToken: newQuote.token,
    };
  } catch (err: unknown) {
    console.error("[createQuoteAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to create quote";
    return { success: false, error: errorMessage };
  }
}

export async function getQuotesList(statusFilter?: string) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("quotes")
    .select("*, booking:bookings(*, customer:customers(*))")
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getQuotesList]", error);
    return [];
  }
  return data;
}

export async function getQuoteByToken(token: string) {
  const supabase = await createSupabaseServerClient();
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*, items:quote_items(*), booking:bookings(*, customer:customers(*), address:customer_addresses(*))")
    .eq("token", token)
    .single();

  if (error || !quote) {
    return null;
  }

  // Update viewed_at if not set yet
  if (!quote.viewed_at && quote.status === "sent") {
    await supabase.from("quotes").update({ viewed_at: new Date().toISOString(), status: "viewed" }).eq("id", quote.id);
  }

  return quote;
}

export async function acceptQuoteCustomerAction(input: { token: string; payment_method: "bank_transfer" | "cash" }) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: quote } = await supabase
      .from("quotes")
      .select("id, booking_id, total, subtotal, vat_amount, booking:bookings(customer_id)")
      .eq("token", input.token)
      .single();

    if (!quote) throw new Error("Quote not found");

    const now = new Date().toISOString();

    // 1. Update Quote
    await supabase
      .from("quotes")
      .update({
        status: "accepted",
        accepted_at: now,
      })
      .eq("id", quote.id);

    // 2. Update Booking Status
    await supabase.from("bookings").update({ status: "quotation_accepted" }).eq("id", quote.booking_id);

    // 3. Auto-generate Invoice (DB trigger generates INV-YYYY-XXXX)
    const { data: newInvoice } = await supabase
      .from("invoices")
      .insert({
        booking_id: quote.booking_id,
        quote_id: quote.id,
        customer_id: (quote.booking as unknown as { customer_id: string })?.customer_id,
        status: "unpaid",
        subtotal: quote.subtotal,
        vat_amount: quote.vat_amount,
        total: quote.total,
        due_date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      })
      .select("id, invoice_number, token")
      .single();

    // Update booking to invoice_generated
    if (newInvoice) {
      await supabase.from("bookings").update({ status: "invoice_generated" }).eq("id", quote.booking_id);
    }

    // 4. Audit Log
    await supabase.from("audit_logs").insert({
      action: "quote.accepted",
      record_type: "quotes",
      record_id: quote.id,
      new_value: {
        payment_method: input.payment_method,
        invoice_number: newInvoice?.invoice_number,
      },
    });

    return {
      success: true,
      invoiceNumber: newInvoice?.invoice_number,
      invoiceToken: newInvoice?.token,
    };
  } catch (err: unknown) {
    console.error("[acceptQuoteCustomerAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to accept quotation";
    return { success: false, error: errorMessage };
  }
}
