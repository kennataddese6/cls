import { notFound } from "next/navigation";
import { Sparkles, Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/config/app-config";

import { getQuoteByToken } from "@/server/quote-actions";
import { QuoteAcceptanceForm } from "./_components/quote-acceptance-form";

export default async function CustomerQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await getQuoteByToken(token);

  if (!quote) {
    notFound();
  }

  const isAccepted = quote.status === "accepted";

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <span className="font-bold text-lg leading-none">{APP_CONFIG.name}</span>
              <p className="text-xs text-muted-foreground">Official Cleaning Quotation</p>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-xs">
            Ref: {quote.booking?.reference}
          </Badge>
        </div>

        {/* Status Notification if Already Accepted */}
        {isAccepted && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 flex items-center gap-3">
            <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Quotation Accepted!</p>
              <p className="text-xs">
                Thank you! You accepted this quotation on {new Date(quote.accepted_at).toLocaleDateString()}. Your
                invoice has been generated.
              </p>
            </div>
          </div>
        )}

        {/* Main Quotation Document */}
        <Card className="border-border shadow-md">
          <CardHeader className="border-b border-border pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Quotation Version {quote.version}</CardTitle>
                <CardDescription>Prepared for {quote.booking?.customer?.full_name}</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Total Amount
                </span>
                <p className="text-3xl font-bold text-primary">£{quote.total?.toFixed(2)}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Customer & Appointment Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-muted/40 border border-border text-sm">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Service Location</span>
                <p className="font-medium flex items-start gap-1.5">
                  <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                  {quote.booking?.address?.line1}, {quote.booking?.address?.city}, {quote.booking?.address?.postcode}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Scheduled Appointment</span>
                <p className="font-medium flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary shrink-0" />
                  {quote.appointment_date || "To be confirmed"} ({quote.appointment_time || "Morning"})
                </p>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Scope of Work</h3>
              <p className="text-sm text-foreground leading-relaxed p-4 rounded-xl bg-card border border-border">
                {quote.scope}
              </p>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Itemised Breakdown
              </h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Unit Price</th>
                      <th className="px-4 py-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quote.items?.map(
                      (item: {
                        id: string;
                        description: string;
                        quantity: number;
                        unit_price: number;
                        total: number;
                      }) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium">{item.description}</td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">£{item.unit_price?.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-semibold">£{item.total?.toFixed(2)}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculation Totals */}
            <div className="max-w-xs ml-auto space-y-2 text-sm pt-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-medium text-foreground">£{quote.subtotal?.toFixed(2)}</span>
              </div>
              {quote.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-£{quote.discount_amount?.toFixed(2)}</span>
                </div>
              )}
              {quote.vat_rate > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT ({quote.vat_rate}%):</span>
                  <span className="font-medium text-foreground">£{quote.vat_amount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>Total Amount:</span>
                <span className="text-primary">£{quote.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Terms */}
            {quote.terms && (
              <div className="space-y-1.5 pt-4 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Terms & Conditions</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{quote.terms}</p>
              </div>
            )}

            {/* Acceptance Section (If not accepted yet) */}
            {!isAccepted && <QuoteAcceptanceForm token={token} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
