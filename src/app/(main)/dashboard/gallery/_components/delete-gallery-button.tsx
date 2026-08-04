"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { deleteGalleryItemAction } from "@/server/gallery-actions";

export function DeleteGalleryButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;

    setLoading(true);
    try {
      const res = await deleteGalleryItemAction(id);
      if (!res.success) {
        toast.error(res.error || "Failed to delete item");
        return;
      }

      toast.success("Gallery item deleted!");
      router.refresh();
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
      title="Delete showcase photo"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
