"use client";

import { useState } from "react";
import { Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { submitCustomerReviewAction } from "@/server/review-actions";

interface Props {
  bookingId: string;
  customerName: string;
  serviceType: string;
}

export function ReviewModalDialog({ bookingId, customerName, serviceType }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [name, setName] = useState(customerName || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please write a short review comment.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCustomerReviewAction({
        booking_id: bookingId,
        customer_name: name || customerName,
        rating,
        title: title || `${serviceType} Review`,
        comment,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to submit review");
        return;
      }

      setSubmitted(true);
      toast.success(res.message);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 font-medium shadow-sm">
          <Star className="size-3.5 fill-current" /> Leave a Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Star className="size-5 text-amber-500 fill-amber-500" /> Share Your Experience
          </DialogTitle>
          <DialogDescription>
            How was your {serviceType}? Your feedback helps us maintain the highest standards.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <h4 className="font-bold text-base">Review Submitted!</h4>
            <p className="text-xs text-muted-foreground">
              Thank you for reviewing Sam Spotless Cleaning! Your review is pending company approval to appear on our
              landing page.
            </p>
            <Button variant="outline" className="w-full mt-2" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Rating Stars */}
            <div className="space-y-1.5 text-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Star Rating
              </label>
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`size-7 ${
                        star <= rating ? "text-amber-500 fill-amber-500" : "text-muted border-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Your Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Jenkins" required />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Review Headline</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Outstanding deep clean & polite staff!"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Detailed Comments</label>
              <Textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about the cleaner's punctuality, thoroughness, and results..."
                required
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-primary font-semibold">
              {submitting ? "Submitting..." : "Submit Review for Approval"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
