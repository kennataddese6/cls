"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Copy, Check, Link as LinkIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { assignCleanerToJobAction } from "@/server/job-actions";

interface CleanerOption {
  id: string;
  name: string;
}

interface Props {
  bookingId: string;
  cleaners: CleanerOption[];
  currentCleanerId?: string;
  currentDate?: string;
  currentTime?: string;
  existingToken?: string;
}

export function AssignCleanerDialog({
  bookingId,
  cleaners,
  currentCleanerId,
  currentDate,
  currentTime,
  existingToken,
}: Props) {
  const router = useRouter();
  const [selectedCleaner, setSelectedCleaner] = useState(currentCleanerId || cleaners[0]?.id || "");
  const [scheduledDate, setScheduledDate] = useState(
    currentDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
  );
  const [scheduledTime, setScheduledTime] = useState(currentTime || "Morning (09:00 AM)");
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(existingToken || "");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAssign = async () => {
    if (!selectedCleaner) {
      toast.error("Please select a cleaner to assign");
      return;
    }

    setLoading(true);
    try {
      const res = await assignCleanerToJobAction({
        booking_id: bookingId,
        cleaner_id: selectedCleaner,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
      });

      if (!res.success || !res.secureToken) {
        toast.error(res.error || "Failed to assign job");
        return;
      }

      setGeneratedToken(res.secureToken);
      toast.success("Cleaner assigned successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to assign cleaner");
    } finally {
      setLoading(false);
    }
  };

  const secureUrl = generatedToken ? `${window.location.origin}/jobs/${generatedToken}` : "";

  const copySecureLink = () => {
    if (!secureUrl) return;
    navigator.clipboard.writeText(secureUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Secure Job Link copied to clipboard! Send to cleaner via WhatsApp.");
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h3 className="font-semibold text-base flex items-center gap-2">
        <UserCheck className="size-4 text-primary" /> Assign Cleaner & Schedule
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="space-y-1 sm:col-span-3">
          <label className="text-xs font-medium text-muted-foreground">Select Cleaner *</label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={selectedCleaner}
            onChange={(e) => setSelectedCleaner(e.target.value)}
          >
            {cleaners.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Scheduled Date</label>
          <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Scheduled Time Window</label>
          <Input
            placeholder="e.g. Morning (09:00 AM)"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleAssign} disabled={loading} className="w-full gap-2">
        <Send className="size-4" /> {loading ? "Assigning Cleaner..." : "Confirm Cleaner Assignment"}
      </Button>

      {generatedToken && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <LinkIcon className="size-3.5" /> SECURE CLEANER JOB LINK
            </span>
            <Badge variant="outline" className="text-[10px]">
              WhatsApp Ready
            </Badge>
          </div>

          <p className="font-mono text-xs bg-card p-2.5 rounded-lg border border-border break-all">{secureUrl}</p>

          <Button variant="outline" size="sm" onClick={copySecureLink} className="w-full gap-2">
            {copiedLink ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            {copiedLink ? "Link Copied to Clipboard!" : "Copy WhatsApp Link"}
          </Button>
        </div>
      )}
    </div>
  );
}
