"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface BookingSubmissionValues {
  service_type: "standard" | "deep" | "end_of_tenancy" | "office" | "commercial" | "carpet";
  full_name: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  postcode: string;
  property_type: "house" | "flat" | "office" | "commercial" | "other";
  bedrooms?: number;
  bathrooms?: number;
  parking_notes?: string;
  preferred_date: string;
  arrival_window: string;
  alternative_date?: string;
  required_tasks?: string;
  extras?: string;
  has_pets: boolean;
  has_hazards: boolean;
  key_arrangements?: string;
  customer_notes?: string;
}

export type BookingActionResult =
  | { success: true; bookingReference: string; bookingId: string }
  | { success: false; error: string };

export async function submitBookingAction(values: BookingSubmissionValues): Promise<BookingActionResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Create or get customer by email
    let customerId: string;

    const { data: existingCustomer } = await supabase.from("customers").select("id").eq("email", values.email).single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Update phone/name if provided
      await supabase
        .from("customers")
        .update({
          full_name: values.full_name,
          phone: values.phone,
        })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
        })
        .select("id")
        .single();

      if (custErr || !newCustomer) {
        throw new Error(custErr?.message || "Failed to create customer record");
      }
      customerId = newCustomer.id;
    }

    // 2. Create customer address
    const { data: addressRecord } = await supabase
      .from("customer_addresses")
      .insert({
        customer_id: customerId,
        line1: values.line1,
        city: values.city,
        postcode: values.postcode,
        property_type: values.property_type,
        bedrooms: values.bedrooms || 1,
        bathrooms: values.bathrooms || 1,
        parking_notes: values.parking_notes,
      })
      .select("id")
      .single();

    // 3. Create booking record (DB trigger auto generates reference CLS-YYYY-XXXX)
    const { data: bookingRecord, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        customer_id: customerId,
        address_id: addressRecord?.id,
        status: "new_enquiry",
        service_type: values.service_type,
        property_type: values.property_type,
        bedrooms: values.bedrooms || 1,
        bathrooms: values.bathrooms || 1,
        parking_notes: values.parking_notes,
        preferred_date: values.preferred_date,
        arrival_window: values.arrival_window,
        alternative_date: values.alternative_date || null,
        required_tasks: values.required_tasks,
        extras: values.extras,
        has_pets: values.has_pets,
        has_hazards: values.has_hazards,
        key_arrangements: values.key_arrangements,
        customer_notes: values.customer_notes,
      })
      .select("id, reference")
      .single();

    if (bookingErr || !bookingRecord) {
      throw new Error(bookingErr?.message || "Failed to create booking enquiry");
    }

    // 4. Log audit log
    await supabase.from("audit_logs").insert({
      action: "booking.created",
      record_type: "bookings",
      record_id: bookingRecord.id,
      new_value: {
        reference: bookingRecord.reference,
        status: "new_enquiry",
        service_type: values.service_type,
      },
    });

    return {
      success: true,
      bookingReference: bookingRecord.reference,
      bookingId: bookingRecord.id,
    };
  } catch (err: unknown) {
    console.error("[submitBookingAction]", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to submit booking enquiry";
    return { success: false, error: errorMessage };
  }
}
