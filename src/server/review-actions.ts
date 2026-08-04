"use server";

import fs from "node:fs";
import path from "node:path";
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

const DATA_FILE_PATH = path.join(process.cwd(), "src/data/reviews.json");

function readReviewsFromFile(): ReviewItem[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("[readReviewsFromFile]", e);
  }
  return [];
}

function writeReviewsToFile(reviews: ReviewItem[]): void {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(reviews, null, 2), "utf-8");
  } catch (e) {
    console.error("[writeReviewsToFile]", e);
  }
}

export async function submitCustomerReviewAction(data: {
  booking_id?: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
}) {
  try {
    const reviews = readReviewsFromFile();

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

    reviews.unshift(newReview);
    writeReviewsToFile(reviews);

    // Also log to Supabase Cloud audit_logs
    try {
      const adminSupabase = createSupabaseAdminClient();
      await adminSupabase.from("audit_logs").insert({
        action: "review.submitted",
        record_type: "reviews",
        record_id: newReview.id,
        new_value: newReview as any,
      });
    } catch {}

    revalidatePath("/testimonials");
    revalidatePath("/dashboard/reviews");
    revalidatePath("/track");
    return { success: true, message: "Thank you! Your review has been submitted for admin approval." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit review" };
  }
}

export async function getReviewsListAdminAction(): Promise<ReviewItem[]> {
  try {
    return readReviewsFromFile();
  } catch {
    return [];
  }
}

export async function approveReviewAction(reviewId: string) {
  try {
    const reviews = readReviewsFromFile();
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, status: "approved" as const } : r));

    writeReviewsToFile(updated);

    try {
      const adminSupabase = createSupabaseAdminClient();
      await adminSupabase.from("audit_logs").insert({
        action: "review.approved",
        record_type: "reviews",
        record_id: reviewId,
      });
    } catch {}

    revalidatePath("/testimonials");
    revalidatePath("/dashboard/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve review" };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    const reviews = readReviewsFromFile();
    const updated = reviews.filter((r) => r.id !== reviewId);

    writeReviewsToFile(updated);

    revalidatePath("/testimonials");
    revalidatePath("/dashboard/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete review" };
  }
}

export async function getPublicApprovedReviewsAction(): Promise<ReviewItem[]> {
  try {
    const reviews = readReviewsFromFile();
    return reviews.filter((r) => r.status === "approved");
  } catch {
    return [];
  }
}
