import Link from "next/link";
import { Inbox, Search, Filter, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { getEnquiriesList } from "@/server/enquiry-actions";

export default async function EnquiriesListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const statusFilter = params.status || "all";
  const enquiries = await getEnquiriesList(statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new_enquiry":
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            New Enquiry
          </Badge>
        );
      case "under_review":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            Under Review
          </Badge>
        );
      case "quotation_sent":
        return (
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
            Quotation Sent
          </Badge>
        );
      case "quotation_accepted":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Quote Accepted
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status.replace("_", " ")}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Enquiries</h1>
          <p className="text-sm text-muted-foreground">
            Manage incoming booking requests, review property details, and send quotations.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-border">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={statusFilter === "all" ? "default" : "outline"} size="sm" asChild>
              <Link href="/dashboard/enquiries">All Enquiries</Link>
            </Button>
            <Button variant={statusFilter === "new_enquiry" ? "default" : "outline"} size="sm" asChild>
              <Link href="/dashboard/enquiries?status=new_enquiry">New Enquiry</Link>
            </Button>
            <Button variant={statusFilter === "under_review" ? "default" : "outline"} size="sm" asChild>
              <Link href="/dashboard/enquiries?status=under_review">Under Review</Link>
            </Button>
            <Button variant={statusFilter === "quotation_sent" ? "default" : "outline"} size="sm" asChild>
              <Link href="/dashboard/enquiries?status=quotation_sent">Quoted</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enquiries List Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Enquiries List ({enquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {enquiries.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Inbox className="size-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-base">No enquiries found</p>
              <p className="text-xs text-muted-foreground">No customer requests match the selected status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {enquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">{e.reference}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium">{e.customer?.full_name || "Guest"}</div>
                        <div className="text-xs text-muted-foreground">{e.customer?.email}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium capitalize">{e.service_type?.replace("_", " ")}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {e.address?.line1}, {e.address?.city} ({e.bedrooms} Bed, {e.bathrooms} Bath)
                      </td>
                      <td className="px-4 py-3.5 text-xs">{e.preferred_date}</td>
                      <td className="px-4 py-3.5">{getStatusBadge(e.status)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/enquiries/${e.id}`}>
                            <Eye className="size-3.5 mr-1" /> Review
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
