import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ReceiptText, User, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getInvoiceById } from "@/server/invoice-actions";
import { RecordPaymentForm } from "../_components/record-payment-form";
import { PrintInvoiceButton } from "@/components/invoice/print-invoice-button";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const remainingBalance = Math.max(0, (invoice.total || 0) - (invoice.amount_paid || 0));
  const isPaid = invoice.status === "paid";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            Unpaid
          </Badge>
        );
      case "part_paid":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            Part Paid
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Paid
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight font-mono">{invoice.invoice_number}</h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-xs text-muted-foreground">
              Booking Ref: <span className="font-mono">{invoice.booking?.reference}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PrintInvoiceButton />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/i/${invoice.token}`} target="_blank">
              <ExternalLink className="size-3.5 mr-1" /> Customer Link
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Invoice Items & Payments History */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-lg">Invoice Document Summary</CardTitle>
                <CardDescription>Issued to {invoice.customer?.full_name}</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Grand Total</span>
                <p className="text-2xl font-bold text-primary">£{invoice.total?.toFixed(2)}</p>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Items Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Itemised Charges
                </h4>
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

              {/* Payments History */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Recorded Payments
                </h4>
                {invoice.payments?.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No payments recorded against this invoice yet.</p>
                ) : (
                  <div className="space-y-2">
                    {invoice.payments?.map(
                      (p: { id: string; amount: number; method: string; payment_date: string; reference?: string }) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-emerald-700">£{p.amount?.toFixed(2)}</p>
                            <p className="text-muted-foreground capitalize">
                              Method: {p.method.replace("_", " ")} {p.reference ? `• Ref: ${p.reference}` : ""}
                            </p>
                          </div>
                          <span className="text-muted-foreground">{p.payment_date}</span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Balance & Record Payment Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground text-xs">Total Invoiced:</span>
                <span className="font-bold">£{invoice.total?.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground text-xs">Amount Paid:</span>
                <span className="font-bold text-emerald-600">£{invoice.amount_paid?.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-sm">Remaining Balance:</span>
                <span className="font-bold text-xl text-primary">£{remainingBalance.toFixed(2)}</span>
              </div>

              {!isPaid && <RecordPaymentForm invoiceId={invoice.id} remainingBalance={remainingBalance} />}

              {isPaid && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-center space-y-1">
                  <CheckCircle2 className="size-6 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">Fully Paid</p>
                  <p className="text-xs">Invoice marked as paid in full.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
