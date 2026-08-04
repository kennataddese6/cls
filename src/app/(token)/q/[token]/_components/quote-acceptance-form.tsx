"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { acceptQuoteCustomerAction } from "@/server/quote-actions";

interface Props {
  token: string;
}

export function QuoteAcceptanceForm({ token }: Props) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cash">("bank_transfer");
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!agreed) {
      toast.error("Please agree to the quotation terms before accepting");
      return;
    }

    setLoading(true);
    try {
      const res = await acceptQuoteCustomerAction({
        token,
        payment_method: paymentMethod,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success("Quotation accepted! Invoice generated.");
      router.refresh();
    } catch {
      toast.error("Failed to accept quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Accept Quotation</h3>
        <p className="text-xs text-muted-foreground">
          Please select your preferred payment method upon completion and confirm your acceptance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setPaymentMethod("bank_transfer")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            paymentMethod === "bank_transfer"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="size-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">Bank Transfer</p>
              <p className="text-[11px] text-muted-foreground">Pay via direct bank transfer upon invoice</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setPaymentMethod("cash")}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            paymentMethod === "cash" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Banknote className="size-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">Cash Payment</p>
              <p className="text-[11px] text-muted-foreground">Pay cash to cleaner on job completion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-3 p-4 rounded-xl bg-muted/40 border border-border">
        <Checkbox id="terms-check" checked={agreed} onCheckedChange={(checked) => setAgreed(Boolean(checked))} />
        <label htmlFor="terms-check" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          I agree to the quotation terms, schedule, and cancellation policy outlined above.
        </label>
      </div>

      <Button
        size="lg"
        className="w-full h-12 text-base font-semibold gap-2"
        onClick={handleAccept}
        disabled={loading || !agreed}
      >
        <CheckCircle2 className="size-5" /> {loading ? "Accepting Quotation..." : "Accept Quotation Now"}
      </Button>
    </div>
  );
}
