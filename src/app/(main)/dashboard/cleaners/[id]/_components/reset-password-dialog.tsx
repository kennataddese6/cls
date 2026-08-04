"use client";

import { useState } from "react";
import { KeyRound, Copy, Check, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { resetCleanerPasswordAction } from "@/server/job-actions";

export function ResetPasswordDialog({ cleanerId, cleanerName }: { cleanerId: string; cleanerName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [credentials, setCredentials] = useState<{
    email: string;
    newPassword: string;
  } | null>(null);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await resetCleanerPasswordAction(cleanerId);
      if (!res.success || !res.newPassword) {
        toast.error(res.error || "Failed to reset password");
        return;
      }

      setCredentials({
        email: res.email || "",
        newPassword: res.newPassword,
      });
      toast.success("Cleaner password reset successfully!");
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = () => {
    if (!credentials) return;
    const msg = `Hello ${cleanerName},\n\nYour cleaner account password has been reset by administration.\n\nLogin Email: ${credentials.email}\nNew Password: ${credentials.newPassword}\n\nLogin to your cleaner portal here:\nhttp://localhost:3000/auth/v1/login`;
    navigator.clipboard.writeText(msg);
    setCopied(true);
    toast.success("Credentials message copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
        >
          <KeyRound className="size-3.5" /> Reset Password
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-amber-500" /> Reset Cleaner Password
          </DialogTitle>
          <DialogDescription>Generate a new strong login password for {cleanerName}.</DialogDescription>
        </DialogHeader>

        {!credentials ? (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Resetting the password will immediately update the cleaner&apos;s authentication account. You can copy
                and send the new credentials via WhatsApp or SMS.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReset}
                disabled={loading}
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? "Resetting..." : "Confirm & Reset Password"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase">Cleaner Email:</span>
                <p className="font-mono text-sm font-bold mt-0.5">{credentials.email}</p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase">New Generated Password:</span>
                <p className="font-mono text-base font-bold text-primary mt-0.5 bg-background p-2 rounded border border-border">
                  {credentials.newPassword}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={copyMessage} className="gap-1.5 w-full">
                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                {copied ? "Copied to Clipboard!" : "Copy WhatsApp Credentials"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
