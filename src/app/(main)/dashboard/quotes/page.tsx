import Link from "next/link";
import { FileText, Eye, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getQuotesList } from "@/server/quote-actions";

export default async function QuotesListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const statusFilter = params.status || "all";
  const quotes = await getQuotesList(statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "sent":
        return (
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
            Sent
          </Badge>
        );
      case "viewed":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            Viewed by Customer
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Accepted
          </Badge>
        );
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
          <p className="text-sm text-muted-foreground">
            Track created, sent, and accepted quotations for cleaning bookings.
          </p>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6 flex flex-wrap items-center gap-2">
          <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" asChild>
            <Link href="/dashboard/quotes">All Quotes</Link>
          </Button>
          <Button variant={statusFilter === "sent" ? "default" : "outline"} size="sm" asChild>
            <Link href="/dashboard/quotes?status=sent">Sent</Link>
          </Button>
          <Button variant={statusFilter === "viewed" ? "default" : "outline"} size="sm" asChild>
            <Link href="/dashboard/quotes?status=viewed">Viewed</Link>
          </Button>
          <Button variant={statusFilter === "accepted" ? "default" : "outline"} size="sm" asChild>
            <Link href="/dashboard/quotes?status=accepted">Accepted</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Quotations ({quotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FileText className="size-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-base">No quotations found</p>
              <p className="text-xs text-muted-foreground">
                Quotations created for booking enquiries will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Version</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Booking Ref</th>
                    <th className="px-4 py-3">Appointment Date</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 font-bold">Version {q.version}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium">{q.booking?.customer?.full_name || "Guest Customer"}</div>
                        <div className="text-xs text-muted-foreground">{q.booking?.customer?.email}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">{q.booking?.reference}</td>
                      <td className="px-4 py-3.5 text-xs">
                        {q.appointment_date || "Not set"} ({q.appointment_time || "TBD"})
                      </td>
                      <td className="px-4 py-3.5 font-bold text-sm">£{q.total?.toFixed(2)}</td>
                      <td className="px-4 py-3.5">{getStatusBadge(q.status)}</td>
                      <td className="px-4 py-3.5 text-right flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/q/${q.token}`} target="_blank">
                            <ExternalLink className="size-3.5 mr-1" /> Public Link
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
