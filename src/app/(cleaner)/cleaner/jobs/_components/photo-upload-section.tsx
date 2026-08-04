"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { uploadJobPhotoAction } from "@/server/job-actions";

export interface PhotoItem {
  id: string;
  category?: "before" | "after";
  photo_type?: "before" | "after";
  storage_path?: string;
  url?: string;
  created_at?: string;
}

interface Props {
  jobId: string;
  bookingId: string;
  existingPhotos: PhotoItem[];
}

export function PhotoUploadSection({ jobId, bookingId, existingPhotos }: Props) {
  const router = useRouter();
  const [uploadingCategory, setUploadingCategory] = useState<"before" | "after" | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>(existingPhotos || []);

  useEffect(() => {
    setPhotos(existingPhotos || []);
  }, [existingPhotos]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: "before" | "after") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCategory(category);
    try {
      const formData = new FormData();
      formData.append("job_id", jobId);
      formData.append("booking_id", bookingId);
      formData.append("category", category);
      formData.append("file", file);

      const res = await uploadJobPhotoAction(formData);

      if (!res.success || !res.url) {
        toast.error(res.error || "Failed to upload photo");
        return;
      }

      const newPhoto: PhotoItem = {
        id: `photo-${Date.now()}`,
        category,
        photo_type: category,
        storage_path: res.url,
        url: res.url,
      };

      setPhotos((prev) => [newPhoto, ...prev]);
      toast.success(`${category.toUpperCase()} photo uploaded successfully!`);
      router.refresh();
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingCategory(null);
    }
  };

  const beforePhotos = photos.filter((p) => (p.category || p.photo_type) === "before");
  const afterPhotos = photos.filter((p) => (p.category || p.photo_type) === "after");

  return (
    <div className="space-y-6 pt-4 border-t border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Camera className="size-4 text-primary" /> Before & After Evidence Photos
        </h3>
        <Badge variant="outline" className="text-xs">
          {photos.length} Uploaded
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Before Photos Box */}
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="size-3.5" /> BEFORE PHOTOS ({beforePhotos.length})
            </span>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingCategory !== null}
                onChange={(e) => handleFileUpload(e, "before")}
              />
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline">
                <Upload className="size-3" /> {uploadingCategory === "before" ? "Uploading..." : "+ Upload Before"}
              </span>
            </label>
          </div>

          {beforePhotos.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-destructive/30 rounded-lg">
              No BEFORE photos uploaded yet. Click above to upload property condition photos prior to cleaning.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {beforePhotos.map((p, idx) => {
                const photoSrc = p.storage_path || p.url || "";
                return (
                  <div
                    key={p.id || idx}
                    className="relative h-32 rounded-lg overflow-hidden border border-border bg-black/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoSrc} alt="Before clean photo" className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* After Photos Box */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> AFTER PHOTOS ({afterPhotos.length})
            </span>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingCategory !== null}
                onChange={(e) => handleFileUpload(e, "after")}
              />
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
                <Upload className="size-3" /> {uploadingCategory === "after" ? "Uploading..." : "+ Upload After"}
              </span>
            </label>
          </div>

          {afterPhotos.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-emerald-500/30 rounded-lg">
              No AFTER photos uploaded yet. Upload pristine property photos after completing the clean.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {afterPhotos.map((p, idx) => {
                const photoSrc = p.storage_path || p.url || "";
                return (
                  <div
                    key={p.id || idx}
                    className="relative h-32 rounded-lg overflow-hidden border border-border bg-black/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoSrc} alt="After clean photo" className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
