"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { adminApproveJobCompletionAction } from "@/server/job-actions";

export function ApproveJobButton({ jobId, bookingId }: { jobId: string; bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await adminApproveJobCompletionAction(jobId, bookingId);
      if (!res.success) {
        toast.error(res.error || "Failed to approve job completion");
        return;
      }

      toast.success("Job completion approved successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to approve job completion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleApprove}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11 px-5 text-sm font-semibold"
    >
      <CheckCircle2 className="size-4" /> {loading ? "Approving..." : "Approve Job Completion"}
    </Button>
  );
}
