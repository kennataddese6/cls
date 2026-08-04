"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { recordPaymentAction } from "@/server/invoice-actions";

interface Props {
  invoiceId: string;
  remainingBalance: number;
}

export function RecordPaymentForm({ invoiceId, remainingBalance }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(remainingBalance);
  const [method, setMethod] = useState<"bank_transfer" | "cash">("bank_transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecordPayment = async () => {
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setLoading(true);
    try {
      const res = await recordPaymentAction({
        invoice_id: invoiceId,
        amount: Number(amount),
        method,
        reference,
        notes,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success("Payment recorded successfully!");
      router.refresh();
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <h3 className="font-semibold text-base flex items-center gap-2">
        <Banknote className="size-4 text-emerald-600" /> Record Payment Received
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Payment Amount (£)</label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={method}
            onChange={(e) => setMethod(e.target.value as "bank_transfer" | "cash")}
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Payment Reference (Optional)</label>
          <Input
            placeholder="e.g. Bank Ref #TXN-998822"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      </div>

      <Button
        onClick={handleRecordPayment}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
      >
        <CheckCircle2 className="size-4" /> {loading ? "Recording Payment..." : "Record Payment"}
      </Button>
    </div>
  );
}
