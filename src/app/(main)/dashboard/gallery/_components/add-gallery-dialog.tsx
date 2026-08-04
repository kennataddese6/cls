"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Camera, Sparkles, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createGalleryItemAction } from "@/server/gallery-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AddGalleryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Deep Clean");
  const [imageUrl, setImageUrl] = useState("/images/clean_home.png");
  const [beforeDesc, setBeforeDesc] = useState("");
  const [afterDesc, setAfterDesc] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const filename = `gallery-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const { data, error } = await supabase.storage.from("photos").upload(filename, file);

      if (error) {
        toast.error("Photo upload failed: " + error.message);
        setUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(data.path);
      setImageUrl(publicUrlData.publicUrl);
      toast.success("Photo uploaded successfully!");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !beforeDesc || !afterDesc) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await createGalleryItemAction({
        title,
        category,
        image_url: imageUrl,
        before_description: beforeDesc,
        after_description: afterDesc,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to add showcase");
        setLoading(false);
        return;
      }

      toast.success("Gallery showcase added successfully!");
      setOpen(false);
      setTitle("");
      setBeforeDesc("");
      setAfterDesc("");
      router.refresh();
    } catch {
      toast.error("Failed to save gallery item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="size-4" /> Add Showcase Photo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5 text-primary" /> New Gallery Showcase
          </DialogTitle>
          <DialogDescription>
            Add a new before & after transformation photo to the public website gallery.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Showcase Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Full Kitchen & Oven Deep Clean"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deep Clean">Deep Clean</SelectItem>
                  <SelectItem value="End of Tenancy">End of Tenancy</SelectItem>
                  <SelectItem value="Oven Clean">Oven Clean</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Carpet Clean">Carpet Clean</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Photo</Label>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="cursor-pointer text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Or Photo Image URL</Label>
            <Input
              id="imageUrl"
              placeholder="/images/clean_home.png or https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beforeDesc" className="text-destructive font-semibold flex items-center gap-1">
              <Camera className="size-3.5" /> BEFORE Condition Description *
            </Label>
            <Textarea
              id="beforeDesc"
              placeholder="e.g. Burnt grease accumulation and heavy carbon residue..."
              value={beforeDesc}
              onChange={(e) => setBeforeDesc(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="afterDesc" className="text-emerald-600 font-semibold flex items-center gap-1">
              <Sparkles className="size-3.5" /> AFTER Result Description *
            </Label>
            <Textarea
              id="afterDesc"
              placeholder="e.g. Restored stainless steel finish and sparkling clean glass door..."
              value={afterDesc}
              onChange={(e) => setAfterDesc(e.target.value)}
              rows={2}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading} className="gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Save Showcase Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
