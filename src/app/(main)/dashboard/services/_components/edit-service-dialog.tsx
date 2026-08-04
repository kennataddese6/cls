"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
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

import { updateServiceAction, type ServiceItem } from "@/server/service-actions";

export function EditServiceDialog({ service }: { service: ServiceItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(service.title);
  const [price, setPrice] = useState(service.price);
  const [duration, setDuration] = useState(service.duration);
  const [description, setDescription] = useState(service.description);
  const [checklistText, setChecklistText] = useState((service.checklist || []).join("\n"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) {
      toast.error("Please fill in required fields");
      return;
    }

    const checklist = checklistText
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    setLoading(true);
    try {
      const res = await updateServiceAction(service.id, {
        title,
        price,
        duration,
        description,
        checklist,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to update service");
        setLoading(false);
        return;
      }

      toast.success("Service updated successfully!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Pencil className="size-3.5" /> Edit Price & Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5 text-primary" /> Edit Service: {service.title}
          </DialogTitle>
          <DialogDescription>Update pricing, duration, description, and feature checklist items.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Service Title *</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (e.g. £120.00) *</Label>
              <Input
                id="edit-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="font-bold text-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duration">Estimated Duration</Label>
              <Input id="edit-duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-checklist">Checklist Items (One per line)</Label>
            <Textarea
              id="edit-checklist"
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              rows={5}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
