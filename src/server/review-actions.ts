"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface ReviewItem {
  id: string;
  booking_id?: string;
  customer_name: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected" | "deleted";
  created_at: string;
}

const DEFAULT_INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-seed-1",
    customer_name: "Eleanor Vance",
    rating: 5,
    title: "Exceptional Spring Clean!",
    comment: "The team arrived right on time and transformed our 4-bedroom house. The oven and kitchen look brand new!",
    status: "approved",
    created_at: "2026-08-01T12:00:00.000Z",
  },
  {
    id: "rev-seed-2",
    customer_name: "Marcus Sterling",
    rating: 5,
    title: "100% Deposit Returned",
    comment:
      "Used Sam Spotless for our end of tenancy clean. Landlord approved without any deductions. Highly recommended!",
    status: "approved",
    created_at: "2026-07-28T14:30:00.000Z",
  },
  {
    id: "rev-seed-3",
    customer_name: "Sarah Jenkins",
    rating: 5,
    title: "Punctual & Thorough Commercial Service",
    comment: "They clean our clinic offices weekly. Extremely trustworthy, polite, and detail-oriented staff.",
    status: "approved",
    created_at: "2026-07-20T09:15:00.000Z",
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
    const adminSupabase = createSupabaseAdminClient();
    const reviewId = `rev-${Date.now()}`;

    const newReview: ReviewItem = {
      id: reviewId,
      booking_id: data.booking_id,
      customer_name: data.customer_name || "Valued Customer",
      rating: Math.min(5, Math.max(1, data.rating || 5)),
      title: data.title || "Customer Review",
      comment: data.comment,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { error } = await adminSupabase.from("audit_logs").insert({
      action: "review.submitted",
      record_type: "reviews",
      record_id: crypto.randomUUID(),
      new_value: newReview as any,
    });

    if (error) {
      console.error("[submitCustomerReviewAction insert error]", error.message);
      throw new Error(error.message);
    }

    revalidatePath("/testimonials");
    revalidatePath("/dashboard/reviews");
    revalidatePath("/track");
    revalidatePath("/");
    return { success: true, message: "Thank you! Your review has been submitted for admin approval." };
  } catch (err: any) {
    console.error("[submitCustomerReviewAction error]", err);
    return { success: false, error: err.message || "Failed to submit review" };
  }
}

export async function getReviewsListAdminAction(): Promise<ReviewItem[]> {
  try {
    const adminSupabase = createSupabaseAdminClient();
    const { data: logs, error } = await adminSupabase
      .from("audit_logs")
      .select("*")
      .eq("record_type", "reviews")
      .order("created_at", { ascending: true });

    if (error || !logs) {
      return DEFAULT_INITIAL_REVIEWS;
    }

    const reviewsMap = new Map<string, ReviewItem>();

    // Load defaults first
    for (const r of DEFAULT_INITIAL_REVIEWS) {
      reviewsMap.set(r.id, r);
    }

    // Process audit logs sequentially
    for (const log of logs) {
      const val = log.new_value as any;
      if (!val) continue;

      if (log.action === "review.submitted" && val.id) {
        reviewsMap.set(val.id, {
          id: val.id,
          booking_id: val.booking_id,
          customer_name: val.customer_name || "Customer",
          rating: val.rating || 5,
          title: val.title || "Review",
          comment: val.comment || "",
          status: val.status || "pending",
          created_at: val.created_at || log.created_at,
        });
      } else if (log.action === "review.approved" && val.id) {
        const existing = reviewsMap.get(val.id);
        if (existing) {
          existing.status = "approved";
        }
      } else if (log.action === "review.deleted" && val.id) {
        reviewsMap.delete(val.id);
      }
    }

    const allReviews = Array.from(reviewsMap.values());
    allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return allReviews;
  } catch (err) {
    console.error("[getReviewsListAdminAction error]", err);
    return DEFAULT_INITIAL_REVIEWS;
  }
}

export async function approveReviewAction(reviewId: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();

    const { error } = await adminSupabase.from("audit_logs").insert({
      action: "review.approved",
      record_type: "reviews",
      record_id: crypto.randomUUID(),
      new_value: { id: reviewId, status: "approved" },
    });

    if (error) throw new Error(error.message);

    revalidatePath("/testimonials");
    revalidatePath("/dashboard/reviews");
    revalidatePath("/track");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[approveReviewAction error]", err);
    return { success: false, error: err.message || "Failed to approve review" };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    const adminSupabase = createSupabaseAdminClient();

    const { error } = await adminSupabase.from("audit_logs").insert({
      action: "review.deleted",
      record_type: "reviews",
      record_id: crypto.randomUUID(),
      new_value: { id: reviewId, status: "deleted" },
    });

    if (error) throw new Error(error.message);

    revalidatePath("/testimonials");
    revalidatePath("/dashboard/reviews");
    revalidatePath("/track");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[deleteReviewAction error]", err);
    return { success: false, error: err.message || "Failed to delete review" };
  }
}

export async function getPublicApprovedReviewsAction(): Promise<ReviewItem[]> {
  try {
    const reviews = await getReviewsListAdminAction();
    return reviews.filter((r) => r.status === "approved");
  } catch {
    return DEFAULT_INITIAL_REVIEWS;
  }
}
