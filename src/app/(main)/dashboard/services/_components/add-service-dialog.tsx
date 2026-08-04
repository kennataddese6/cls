"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Loader2 } from "lucide-react";
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

import { createServiceAction } from "@/server/service-actions";

export function AddServiceDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("£100.00");
  const [duration, setDuration] = useState("3 hours");
  const [description, setDescription] = useState("");
  const [checklistText, setChecklistText] = useState("");

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
      const res = await createServiceAction({
        title,
        price,
        duration,
        description,
        checklist,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to create service");
        setLoading(false);
        return;
      }

      toast.success("New cleaning service created!");
      setOpen(false);
      setTitle("");
      setPrice("£100.00");
      setDescription("");
      setChecklistText("");
      router.refresh();
    } catch {
      toast.error("Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="size-4" /> Add New Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> Create Cleaning Service
          </DialogTitle>
          <DialogDescription>
            Add a new cleaning package with pricing and description for the public website and booking options.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Move In / Out Deep Clean"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                placeholder="e.g. £150.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration</Label>
              <Input
                id="duration"
                placeholder="e.g. 4 hours"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Service Description *</Label>
            <Textarea
              id="description"
              placeholder="Thorough cleaning package covering..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checklist">Checklist Features (One per line)</Label>
            <Textarea
              id="checklist"
              placeholder={"Deep oven cleaning\nSanitising countertops\nWiping windows"}
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Save Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
