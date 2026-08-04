"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Play, XCircle, CheckSquare, Camera, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { updateCleanerJobStatusAction } from "@/server/job-actions";

interface Props {
  jobId: string;
  bookingStatus: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  hasBeforePhoto?: boolean;
  hasAfterPhoto?: boolean;
}

export function CleanerJobActions({
  jobId,
  bookingStatus,
  acceptedAt,
  startedAt,
  completedAt,
  hasBeforePhoto = false,
  hasAfterPhoto = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cleanerNotes, setCleanerNotes] = useState("");

  const isPhotoComplete = hasBeforePhoto && hasAfterPhoto;

  const handleAction = async (action: "accept" | "decline" | "start" | "complete") => {
    if (action === "complete" && !isPhotoComplete) {
      toast.error(
        "Photo evidence required: Please upload at least one 'Before' photo and one 'After' photo above before completing.",
      );
      return;
    }

    let declinedReason: string | undefined;
    if (action === "decline") {
      const reason = prompt("Please provide a reason for declining this job:");
      if (!reason) return;
      declinedReason = reason;
    }

    setLoading(true);
    try {
      const res = await updateCleanerJobStatusAction({
        job_id: jobId,
        action,
        declined_reason: declinedReason,
        cleaner_notes: cleanerNotes,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success(`Job marked as ${action}ed successfully!`);
      router.refresh();
    } catch {
      toast.error("Failed to update job action");
    } finally {
      setLoading(false);
    }
  };

  // Explicit lifecycle state resolution
  let effectiveStatus = "assigned";

  if (completedAt || bookingStatus === "completed_pending_review" || bookingStatus === "completed") {
    effectiveStatus = bookingStatus === "completed" ? "closed" : "completed_pending_review";
  } else if (startedAt || bookingStatus === "in_progress") {
    effectiveStatus = "in_progress";
  } else if (acceptedAt || bookingStatus === "cleaner_accepted") {
    effectiveStatus = "accepted";
  } else {
    effectiveStatus = "assigned";
  }

  const isAssigned = effectiveStatus === "assigned";
  const isAccepted = effectiveStatus === "accepted";
  const isInProgress = effectiveStatus === "in_progress";
  const isPendingReview = effectiveStatus === "completed_pending_review";
  const isCompleted = effectiveStatus === "closed";

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {isAssigned && (
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11"
            onClick={() => handleAction("accept")}
            disabled={loading}
          >
            <CheckCircle2 className="size-4" /> Accept Job
          </Button>
          <Button
            variant="destructive"
            className="flex-1 h-11 gap-2"
            onClick={() => handleAction("decline")}
            disabled={loading}
          >
            <XCircle className="size-4" /> Decline Job
          </Button>
        </div>
      )}

      {isAccepted && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
            Job accepted! Click below when you arrive at the property to start work.
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 text-base font-semibold"
            onClick={() => handleAction("start")}
            disabled={loading}
          >
            <Play className="size-5" /> Start Job Now
          </Button>
        </div>
      )}

      {isInProgress && (
        <div className="space-y-3">
          {!isPhotoComplete ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs flex items-start gap-2.5 font-medium">
              <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Before & After Photo Evidence Required</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  You must upload at least 1 <strong>Before</strong> photo and 1 <strong>After</strong> photo in the
                  section above before submitting this job.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              Photo evidence uploaded! Add any final notes below and submit your completed job.
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Completion Notes for Admin</label>
            <Textarea
              rows={2}
              placeholder="e.g. All rooms cleaned, oven descaled, property locked up."
              value={cleanerNotes}
              onChange={(e) => setCleanerNotes(e.target.value)}
            />
          </div>

          <Button
            className={`w-full gap-2 h-12 text-base font-semibold ${
              isPhotoComplete
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            onClick={() => handleAction("complete")}
            disabled={loading || !isPhotoComplete}
          >
            <CheckSquare className="size-5" /> Complete Job & Submit Review
          </Button>
        </div>
      )}

      {isPendingReview && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-center space-y-1 text-xs">
          <CheckCircle2 className="size-5 text-amber-600 mx-auto" />
          <p className="font-bold">Job Submitted — Pending Admin Review</p>
          <p className="text-muted-foreground">
            Your completed work and uploaded photos are being reviewed by the company.
          </p>
        </div>
      )}

      {isCompleted && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-center space-y-1 text-xs">
          <CheckCircle2 className="size-5 text-emerald-600 mx-auto" />
          <p className="font-bold">Job Approved & Closed</p>
        </div>
      )}
    </div>
  );
}
