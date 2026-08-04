import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { saveCustomerBookingCookieAction } from "@/server/booking-tracker-actions";

export default async function BookingConfirmationPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const params = await searchParams;
  const reference = params.ref ?? "CLS-2026-0001";

  // Automatically save booking reference to customer's browser cookie
  await saveCustomerBookingCookieAction(reference, reference);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="size-10" />
      </div>

      <div className="space-y-3">
        <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
          Booking Request Received & Saved to Browser
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Thank You for Your Booking!</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Your booking enquiry has been logged successfully and saved to your browser cookies so you can track its
          progress anytime.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Job Reference Number
            </span>
            <p className="text-3xl font-mono font-bold text-primary">{reference}</p>
          </div>

          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            We will send updates and your official quotation link directly to your email address. You can also view live
            status updates anytime on our tracker page.
          </p>

          <Button asChild className="w-full bg-primary font-semibold gap-2">
            <Link href="/track">
              <Search className="size-4" /> Track Live Booking Status
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
          <FileText className="size-5 text-primary" />
          <h4 className="font-semibold text-sm">1. Quote Review</h4>
          <p className="text-xs text-muted-foreground">Admin sends itemised quote via email within 24h.</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
          <CheckCircle2 className="size-5 text-primary" />
          <h4 className="font-semibold text-sm">2. Online Accept</h4>
          <p className="text-xs text-muted-foreground">Review and accept terms online in one click.</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
          <ShieldCheck className="size-5 text-primary" />
          <h4 className="font-semibold text-sm">3. Job Evidence</h4>
          <p className="text-xs text-muted-foreground">Cleaner assigned with before & after photo report.</p>
        </div>
      </div>

      <div className="pt-4 flex justify-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/services">
            Browse Services <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
