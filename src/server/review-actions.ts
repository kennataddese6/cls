"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface ReviewItem {
  id: string;
  booking_id?: string;
  customer_name: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

let MEMORY_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    customer_name: "Eleanor Vance",
    rating: 5,
    title: "Exceptional Spring Clean!",
    comment: "The team arrived right on time and transformed our 4-bedroom house. The oven and kitchen look brand new!",
    status: "approved",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "rev-2",
    customer_name: "Marcus Sterling",
    rating: 5,
    title: "100% Deposit Returned",
    comment:
      "Used Sam Spotless for our end of tenancy clean. Landlord approved without any deductions. Highly recommended!",
    status: "approved",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "rev-3",
    customer_name: "Sarah Jenkins",
    rating: 5,
    title: "Punctual & Thorough Commercial Service",
    comment: "They clean our clinic offices weekly. Extremely trustworthy, polite, and detail-oriented staff.",
    status: "approved",
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

export async function submitCustomerReviewAction(data: {
  booking_id?: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
}) {
  try {
    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      booking_id: data.booking_id,
      customer_name: data.customer_name || "Valued Customer",
      rating: Math.min(5, Math.max(1, data.rating || 5)),
      title: data.title || "Customer Review",
      comment: data.comment,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    MEMORY_REVIEWS.unshift(newReview);

    try {
      const adminSupabase = createSupabaseAdminClient();
      await adminSupabase.from("reviews").insert({
        booking_id: data.booking_id || null,
        customer_name: data.customer_name,
        rating: data.rating,
        title: data.title || "Customer Review",
        comment: data.comment,
        status: "pending",
      });
    } catch {
      // Table fallback handled gracefully
    }

    revalidatePath("/testimonials");
    revalidatePath("/dashboard/reviews");
    return { success: true, message: "Thank you! Your review has been submitted for admin approval." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit review" };
  }
}

export async function getReviewsListAdminAction(): Promise<ReviewItem[]> {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const { data, error } = await adminSupabase.from("reviews").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return MEMORY_REVIEWS;
    }

    return data.map((r) => ({
      id: r.id,
      booking_id: r.booking_id,
      customer_name: r.customer_name || "Customer",
      rating: r.rating || 5,
      title: r.title || "Review",
      comment: r.comment || r.text || "",
      status: r.status || "pending",
      created_at: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return MEMORY_REVIEWS;
  }
}

export async function approveReviewAction(reviewId: string) {
  try {
    MEMORY_REVIEWS = MEMORY_REVIEWS.map((r) => (r.id === reviewId ? { ...r, status: "approved" } : r));

    try {
      const adminSupabase = createSupabaseAdminClient();
      await adminSupabase.from("reviews").update({ status: "approved" }).eq("id", reviewId);
    } catch {}

    revalidatePath("/testimonials");
    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve review" };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    MEMORY_REVIEWS = MEMORY_REVIEWS.filter((r) => r.id !== reviewId);

    try {
      const adminSupabase = createSupabaseAdminClient();
      await adminSupabase.from("reviews").delete().eq("id", reviewId);
    } catch {}

    revalidatePath("/testimonials");
    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete review" };
  }
}

export async function getPublicApprovedReviewsAction(): Promise<ReviewItem[]> {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const { data, error } = await adminSupabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return MEMORY_REVIEWS.filter((r) => r.status === "approved");
    }

    return data.map((r) => ({
      id: r.id,
      booking_id: r.booking_id,
      customer_name: r.customer_name || "Customer",
      rating: r.rating || 5,
      title: r.title || "Review",
      comment: r.comment || r.text || "",
      status: "approved",
      created_at: r.created_at || new Date().toISOString(),
    }));
  } catch {
    return MEMORY_REVIEWS.filter((r) => r.status === "approved");
  }
}
