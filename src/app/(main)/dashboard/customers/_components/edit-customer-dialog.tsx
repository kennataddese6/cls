"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, User, Mail, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateCustomerAction } from "@/server/customer-actions";

export function EditCustomerDialog({
  customer,
  triggerBtn,
}: {
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone?: string | null;
  };
  triggerBtn?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState(customer.full_name || "");
  const [email, setEmail] = useState(customer.email || "");
  const [phone, setPhone] = useState(customer.phone || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      toast.error("Full name and email are required");
      return;
    }

    setLoading(true);
    try {
      const res = await updateCustomerAction(customer.id, {
        full_name: fullName,
        email: email,
        phone: phone,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to update customer");
        return;
      }

      toast.success("Customer information updated successfully!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerBtn || (
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Edit3 className="size-3.5" /> Edit
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="size-4 text-primary" /> Edit Customer Information
          </DialogTitle>
          <DialogDescription>Update contact details and profile record for {customer.full_name}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground" /> Full Name *
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Eleanor Vance"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Mail className="size-3.5 text-muted-foreground" /> Email Address *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. eleanor@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" /> Phone Number
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +44 7700 900123" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5 bg-primary">
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
