"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { approveReviewAction, deleteReviewAction } from "@/server/review-actions";

interface Props {
  reviewId: string;
  status: string;
}

export function ReviewItemActions({ reviewId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await approveReviewAction(reviewId);
      if (res.success) {
        toast.success("Review approved! It will now appear on your public website.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to approve review");
      }
    } catch {
      toast.error("Failed to approve review");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setLoading(true);
    try {
      const res = await deleteReviewAction(reviewId);
      if (res.success) {
        toast.success("Review deleted.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete review");
      }
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {status !== "approved" && (
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-semibold"
          onClick={handleApprove}
          disabled={loading}
        >
          <CheckCircle2 className="size-3.5" /> Approve Review
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
