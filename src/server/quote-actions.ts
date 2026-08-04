"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

    const adminSupabase = createSupabaseAdminClient();

    // 1. Get or ensure valid admin profile ID to satisfy NOT-NULL & FK constraint
    let createdBy: string | null = user?.id || null;

    if (createdBy) {
      // Ensure profile row exists for this user ID
      await adminSupabase.from("profiles").upsert({
        id: createdBy,
        role: "admin",
        full_name: user?.user_metadata?.full_name || "Company Admin",
        email: user?.email || "admin@cleaningcompany.com",
      });
    } else {
      // Find any existing admin profile or auth user
      const { data: adminProfile } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .maybeSingle();

      if (adminProfile) {
        createdBy = adminProfile.id;
      } else {
        // Check auth users for admin
        const { data: userList } = await adminSupabase.auth.admin.listUsers();
        const adminUser = userList?.users?.find(
          (u) => u.email === "admin@cleaningcompany.com" || u.user_metadata?.role === "admin",
        );

        if (adminUser) {
          createdBy = adminUser.id;
          await adminSupabase.from("profiles").upsert({
            id: adminUser.id,
            role: "admin",
            full_name: "Company Admin",
            email: adminUser.email,
          });
        }
      }
    }

    if (!createdBy) {
      throw new Error("Unable to resolve Admin profile ID for quote creation.");
    }

    // 2. Calculate totals
    const subtotal = input.items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
    const discount = input.discount_amount || 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const vatRate = input.vat_rate || 0;
    const vatAmount = (discountedSubtotal * vatRate) / 100;
    const total = discountedSubtotal + vatAmount;

    // 3. Check highest version for this booking
    const { data: existingQuotes } = await adminSupabase
      .from("quotes")
      .select("version")
      .eq("booking_id", input.booking_id)
      .order("version", { ascending: false });

    const nextVersion = existingQuotes && existingQuotes.length > 0 ? existingQuotes[0].version + 1 : 1;

    // 4. Insert Quote using admin client
    const { data: newQuote, error: quoteErr } = await adminSupabase
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
        created_by: createdBy,
      })
      .select("id, token")
      .single();

    if (quoteErr || !newQuote) {
      console.error("[createQuoteAction] Insert error:", quoteErr);
      throw new Error(quoteErr?.message || "Failed to create quote");
    }

    // 5. Insert Quote Items
    if (input.items.length > 0) {
      const itemsToInsert = input.items.map((item, index) => ({
        quote_id: newQuote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
        sort_order: index,
      }));

      await adminSupabase.from("quote_items").insert(itemsToInsert);
    }

    // 6. Update booking status if sent
    if (sendImmediately) {
      await adminSupabase.from("bookings").update({ status: "quotation_sent" }).eq("id", input.booking_id);

      await adminSupabase.from("audit_logs").insert({
        actor_id: createdBy,
        actor_role: "admin",
        action: "quote.sent",
        record_type: "quotes",
        record_id: newQuote.id,
      });
    }

    revalidatePath(`/dashboard/quotes/${newQuote.id}`);
    revalidatePath("/dashboard/quotes");
    revalidatePath("/dashboard/enquiries");

    return {
      success: true,
      quoteId: newQuote.id,
      token: newQuote.token,
    };
  } catch (err: unknown) {
    console.error("[createQuoteAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to create quotation";
    return { success: false, error: errorMessage };
  }
}

export async function getQuotesList(statusFilter?: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();
    let query = adminSupabase
      .from("quotes")
      .select("*, booking:bookings(*, customer:customers(*)), items:quote_items(*)")
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[getQuotesList]", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("[getQuotesList]", err);
    return [];
  }
}

export async function getQuoteById(id: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const { data: quote, error } = await adminSupabase
      .from("quotes")
      .select("*, booking:bookings(*, customer:customers(*), address:customer_addresses(*)), items:quote_items(*)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[getQuoteById]", error);
      return null;
    }
    return quote;
  } catch (err) {
    console.error("[getQuoteById]", err);
    return null;
  }
}

export async function getQuoteByToken(token: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const { data: quote, error } = await adminSupabase
      .from("quotes")
      .select("*, booking:bookings(*, customer:customers(*), address:customer_addresses(*)), items:quote_items(*)")
      .eq("token", token)
      .single();

    if (error) {
      console.error("[getQuoteByToken]", error);
      return null;
    }

    // Mark as viewed if sent
    if (quote.status === "sent") {
      await adminSupabase
        .from("quotes")
        .update({ status: "viewed", viewed_at: new Date().toISOString() })
        .eq("id", quote.id);
    }

    return quote;
  } catch (err) {
    console.error("[getQuoteByToken]", err);
    return null;
  }
}

export async function acceptQuoteCustomerAction(input: string | { token: string; payment_method?: string }) {
  try {
    const token = typeof input === "string" ? input : input.token;
    const paymentMethod = typeof input === "string" ? "bank_transfer" : input.payment_method || "bank_transfer";
    const adminSupabase = createSupabaseAdminClient();

    const { data: quote, error: findErr } = await adminSupabase
      .from("quotes")
      .select("id, booking_id, total, status")
      .eq("token", token)
      .single();

    if (findErr || !quote) throw new Error("Quote not found");

    const acceptedAt = new Date().toISOString();

    // 1. Update quote status
    await adminSupabase.from("quotes").update({ status: "accepted", accepted_at: acceptedAt }).eq("id", quote.id);

    // 2. Update booking status
    await adminSupabase.from("bookings").update({ status: "quotation_accepted" }).eq("id", quote.booking_id);

    // 3. Generate invoice automatically
    const invRef = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const { data: invoice } = await adminSupabase
      .from("invoices")
      .insert({
        invoice_number: invRef,
        booking_id: quote.booking_id,
        quote_id: quote.id,
        status: "unpaid",
        issue_date: new Date().toISOString().split("T")[0],
        due_date: dueDate.toISOString().split("T")[0],
        subtotal: quote.total,
        tax_amount: 0,
        total_amount: quote.total,
        amount_paid: 0,
        balance_due: quote.total,
      })
      .select("token")
      .single();

    // Update booking status to invoice_generated
    await adminSupabase.from("bookings").update({ status: "invoice_generated" }).eq("id", quote.booking_id);

    // Audit log
    await adminSupabase.from("audit_logs").insert({
      action: "quote.accepted",
      record_type: "quotes",
      record_id: quote.id,
      new_value: { invoice_token: invoice?.token, payment_method: paymentMethod },
    });

    revalidatePath(`/q/${token}`);
    revalidatePath("/dashboard/quotes");
    revalidatePath("/dashboard/invoices");

    return {
      success: true,
      invoiceToken: invoice?.token,
    };
  } catch (err: unknown) {
    console.error("[acceptQuoteCustomerAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to accept quote";
    return { success: false, error: errorMessage };
  }
}

export async function updateQuoteStatusAction(quoteId: string, status: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();
    await adminSupabase.from("quotes").update({ status }).eq("id", quoteId);

    revalidatePath(`/dashboard/quotes/${quoteId}`);
    revalidatePath("/dashboard/quotes");
    return { success: true };
  } catch (err: unknown) {
    console.error("[updateQuoteStatusAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to update status";
    return { success: false, error: errorMessage };
  }
}
