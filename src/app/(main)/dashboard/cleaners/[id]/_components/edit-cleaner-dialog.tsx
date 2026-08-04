"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { updateCleanerAction } from "@/server/job-actions";

interface CleanerProps {
  id: string;
  fullName: string;
  phone: string;
  cleanerType: "individual" | "company";
  companyName?: string;
  address?: string;
  serviceAreas?: string;
  status: "available" | "busy" | "inactive";
  notes?: string;
}

export function EditCleanerDialog({ cleaner }: { cleaner: CleanerProps }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState(cleaner.fullName);
  const [phone, setPhone] = useState(cleaner.phone);
  const [cleanerType, setCleanerType] = useState(cleaner.cleanerType);
  const [companyName, setCompanyName] = useState(cleaner.companyName || "");
  const [address, setAddress] = useState(cleaner.address || "");
  const [serviceAreas, setServiceAreas] = useState(cleaner.serviceAreas || "");
  const [status, setStatus] = useState(cleaner.status);
  const [notes, setNotes] = useState(cleaner.notes || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateCleanerAction({
        id: cleaner.id,
        full_name: fullName,
        phone,
        cleaner_type: cleanerType,
        company_name: companyName,
        address,
        service_areas: serviceAreas,
        status,
        notes,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to update cleaner");
        return;
      }

      toast.success("Cleaner profile updated!");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update cleaner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Edit3 className="size-3.5" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Cleaner Profile</DialogTitle>
          <DialogDescription>Update contact information, status, or coverage areas.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Availability Status</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as "available" | "busy" | "inactive")}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Cleaner Type</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={cleanerType}
                onChange={(e) => setCleanerType(e.target.value as "individual" | "company")}
              >
                <option value="individual">Individual</option>
                <option value="company">Company / Subcontractor</option>
              </select>
            </div>

            {cleanerType === "company" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
            )}

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Service Areas</label>
              <Input value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Internal Notes</label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-1.5">
              <Save className="size-4" /> {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
