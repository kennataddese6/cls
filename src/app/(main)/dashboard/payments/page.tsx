import Link from "next/link";
import { Banknote, CreditCard, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PaymentsListPage() {
  const supabase = await createSupabaseServerClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("*, invoice:invoices(*, customer:customers(*))")
    .order("created_at", { ascending: false });

  const paymentList = payments || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sans">Payment Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Complete transaction history of all payments recorded against customer invoices.
          </p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Recorded Transactions ({paymentList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentList.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Banknote className="size-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-base">No recorded payments yet</p>
              <p className="text-xs text-muted-foreground">
                Payments recorded against unpaid invoices will be listed here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Invoice Ref</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3 font-bold">Amount Paid</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paymentList.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 text-xs">{p.payment_date}</td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                        {p.invoice?.invoice_number}
                      </td>
                      <td className="px-4 py-3.5 font-medium">{p.invoice?.customer?.full_name}</td>
                      <td className="px-4 py-3.5 capitalize text-xs">
                        <Badge variant="outline">{p.method.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{p.reference || "N/A"}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600 text-sm">£{p.amount?.toFixed(2)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/invoices/${p.invoice_id}`}>
                            <Eye className="size-3.5 mr-1" /> View Invoice
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
