"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { updateEnquiryStatusAction } from "@/server/enquiry-actions";

interface Props {
  bookingId: string;
  currentStatus: string;
}

export function EnquiryActionsBar({ bookingId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkUnderReview = async () => {
    setLoading(true);
    try {
      const res = await updateEnquiryStatusAction(bookingId, "under_review");
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Enquiry marked as Under Review");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Please enter rejection reason (optional):");
    setLoading(true);
    try {
      const res = await updateEnquiryStatusAction(bookingId, "rejected", reason || undefined);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Enquiry marked as Rejected");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {currentStatus === "new_enquiry" && (
        <Button variant="outline" onClick={handleMarkUnderReview} disabled={loading} className="gap-1.5">
          <CheckCircle2 className="size-4 text-blue-500" /> Mark Under Review
        </Button>
      )}

      <Button className="gap-1.5" asChild>
        <Link href={`/dashboard/quotes/new?bookingId=${bookingId}`}>
          <FileText className="size-4" /> Create Quotation
        </Link>
      </Button>

      {currentStatus !== "rejected" && (
        <Button variant="destructive" size="sm" onClick={handleReject} disabled={loading} className="gap-1.5">
          <XCircle className="size-4" /> Reject Enquiry
        </Button>
      )}
    </div>
  );
}
