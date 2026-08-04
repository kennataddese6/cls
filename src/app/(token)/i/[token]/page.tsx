import { notFound } from "next/navigation";
import { Sparkles, CheckCircle2, Clock, CreditCard, Building, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/config/app-config";

import { getInvoiceByToken } from "@/server/invoice-actions";

export default async function CustomerInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invoice = await getInvoiceByToken(token);

  if (!invoice) {
    notFound();
  }

  const isPaid = invoice.status === "paid";
  const remainingBalance = Math.max(0, (invoice.total || 0) - (invoice.amount_paid || 0));

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
              <p className="text-xs text-muted-foreground">Official Cleaning Invoice</p>
            </div>
          </div>

          <Badge
            variant={isPaid ? "default" : "outline"}
            className={isPaid ? "bg-emerald-600 text-white" : "border-amber-500 text-amber-600 font-bold"}
          >
            {isPaid ? "PAID IN FULL" : "PAYMENT DUE"}
          </Badge>
        </div>

        {/* Invoice Card */}
        <Card className="border-border shadow-md">
          <CardHeader className="border-b border-border pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-mono">{invoice.invoice_number}</CardTitle>
                <CardDescription>Billed to {invoice.customer?.full_name}</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Total Amount
                </span>
                <p className="text-3xl font-bold text-primary">£{invoice.total?.toFixed(2)}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border text-sm">
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase">Booking Reference:</span>
                <p className="font-mono font-bold text-primary mt-0.5">{invoice.booking?.reference}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-semibold uppercase">Issue Date:</span>
                <p className="font-medium mt-0.5">{new Date(invoice.issued_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Itemised Breakdown */}
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
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.quote?.items?.map(
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
                <span className="font-medium text-foreground">£{invoice.subtotal?.toFixed(2)}</span>
              </div>
              {invoice.vat_amount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT:</span>
                  <span className="font-medium text-foreground">£{invoice.vat_amount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Amount Paid:</span>
                <span className="font-medium text-emerald-600">£{invoice.amount_paid?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>Remaining Balance:</span>
                <span className="text-primary">£{remainingBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Instructions if unpaid */}
            {!isPaid && (
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3 text-sm">
                <h4 className="font-bold flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" /> Bank Transfer Payment Instructions
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Bank Name:</span>
                    <p className="font-semibold">Barclays UK</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Name:</span>
                    <p className="font-semibold">Cleaning Management Co Ltd</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sort Code:</span>
                    <p className="font-mono font-semibold">20-00-00</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Number:</span>
                    <p className="font-mono font-semibold">55443322</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Please use reference{" "}
                  <span className="font-mono font-bold text-primary">{invoice.invoice_number}</span> when making
                  payment.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
