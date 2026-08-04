"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { deleteCleanerAction } from "@/server/job-actions";

export function DeleteCleanerButton({ cleanerId, cleanerName }: { cleanerId: string; cleanerName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = confirm(
      `Are you sure you want to delete cleaner "${cleanerName}"? This action cannot be undone.`,
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const res = await deleteCleanerAction(cleanerId);
      if (!res.success) {
        toast.error(res.error || "Failed to delete cleaner");
        return;
      }

      toast.success("Cleaner account deleted");
      router.push("/dashboard/cleaners");
    } catch {
      toast.error("Failed to delete cleaner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading} className="gap-1.5">
      <Trash2 className="size-3.5" /> {loading ? "Deleting..." : "Delete Cleaner"}
    </Button>
  );
}
