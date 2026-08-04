import Link from "next/link";
import { ReceiptText, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getInvoicesList } from "@/server/invoice-actions";

export default async function InvoicesListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const statusFilter = params.status || "all";
  const invoices = await getInvoicesList(statusFilter);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices & Payments</h1>
          <p className="text-sm text-muted-foreground">
            Auto-generated invoices, payment records, and customer receipt management.
          </p>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6 flex flex-wrap items-center gap-2">
          <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" asChild>
            <Link href="/dashboard/invoices">All Invoices</Link>
          </Button>
          <Button variant={statusFilter === "unpaid" ? "default" : "outline"} size="sm" asChild>
            <Link href="/dashboard/invoices?status=unpaid">Unpaid</Link>
          </Button>
          <Button variant={statusFilter === "paid" ? "default" : "outline"} size="sm" asChild>
            <Link href="/dashboard/invoices?status=paid">Paid</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Invoices ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ReceiptText className="size-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-base">No invoices found</p>
              <p className="text-xs text-muted-foreground">
                Invoices generated automatically upon quotation acceptance will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Invoice Number</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Booking Ref</th>
                    <th className="px-4 py-3">Issued Date</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Amount Paid</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">{inv.invoice_number}</td>
                      <td className="px-4 py-3.5 font-medium">{inv.customer?.full_name || "Customer"}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{inv.booking?.reference}</td>
                      <td className="px-4 py-3.5 text-xs">{new Date(inv.issued_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5 font-bold">£{inv.total?.toFixed(2)}</td>
                      <td className="px-4 py-3.5 font-medium text-emerald-600">£{inv.amount_paid?.toFixed(2)}</td>
                      <td className="px-4 py-3.5">{getStatusBadge(inv.status)}</td>
                      <td className="px-4 py-3.5 text-right flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/invoices/${inv.id}`}>
                            <Eye className="size-3.5 mr-1" /> View & Pay
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/i/${inv.token}`} target="_blank">
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
