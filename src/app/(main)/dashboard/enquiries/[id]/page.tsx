import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Home,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getEnquiryById } from "@/server/enquiry-actions";
import { EnquiryActionsBar } from "../_components/enquiry-actions-bar";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enquiry = await getEnquiryById(id);

  if (!enquiry) {
    notFound();
  }

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/enquiries">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight font-mono">{enquiry.reference}</h1>
            {getStatusBadge(enquiry.status)}
          </div>
          <p className="text-sm text-muted-foreground pl-11">
            Submitted on {new Date(enquiry.created_at).toLocaleDateString()}
          </p>
        </div>

        <EnquiryActionsBar bookingId={enquiry.id} currentStatus={enquiry.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Booking & Customer Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Panel */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" /> Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Full Name:</span>
                <p className="font-semibold">{enquiry.customer?.full_name || "Guest Customer"}</p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Email:</span>
                <p className="font-semibold flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" /> {enquiry.customer?.email}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Phone:</span>
                <p className="font-semibold flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" /> {enquiry.customer?.phone || "Not provided"}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Address:</span>
                <p className="font-semibold flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  {enquiry.address?.line1}, {enquiry.address?.city}, {enquiry.address?.postcode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Specification */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="size-4 text-primary" /> Service Specification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-border">
                <div>
                  <span className="text-xs text-muted-foreground">Service Type:</span>
                  <p className="font-semibold capitalize">{enquiry.service_type?.replace("_", " ")} Clean</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Property Type:</span>
                  <p className="font-semibold capitalize">{enquiry.property_type}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Bedrooms / Bathrooms:</span>
                  <p className="font-semibold">
                    {enquiry.bedrooms} Bed • {enquiry.bathrooms} Bath
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-border">
                <div>
                  <span className="text-xs text-muted-foreground">Preferred Date:</span>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="size-3.5 text-muted-foreground" /> {enquiry.preferred_date}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Arrival Window:</span>
                  <p className="font-semibold flex items-center gap-1">
                    <Clock className="size-3.5 text-muted-foreground" /> {enquiry.arrival_window || "Morning"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Alternative Date:</span>
                  <p className="font-semibold">{enquiry.alternative_date || "None"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Key Arrangements:</span>
                  <p className="font-medium text-xs">{enquiry.key_arrangements || "Customer present"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Pets / Hazards:</span>
                  <p className="font-medium text-xs">
                    {enquiry.has_pets ? "Pets on property" : "No pets"} •{" "}
                    {enquiry.has_hazards ? "Hazards reported" : "No hazards"}
                  </p>
                </div>
              </div>

              {enquiry.customer_notes && (
                <div className="pt-2">
                  <span className="text-xs text-muted-foreground">Customer Notes / Special Requests:</span>
                  <div className="mt-1 p-3 rounded-lg bg-muted/40 text-xs italic">
                    &quot;{enquiry.customer_notes}&quot;
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline & Quotes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Timeline */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Audit Log & Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {enquiry.auditLogs?.length === 0 ? (
                <p className="text-xs text-muted-foreground">No status history recorded yet.</p>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-border">
                  {enquiry.auditLogs.map(
                    (log: { id: string; action: string; created_at: string; new_value?: { status?: string } }) => (
                      <div key={log.id} className="relative pl-6 space-y-1">
                        <div className="absolute left-0 top-1 size-4 rounded-full bg-primary border-2 border-background" />
                        <p className="font-semibold text-xs capitalize">{log.action.replace(".", " ")}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotes Created */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Quotations</CardTitle>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/quotes/new?bookingId=${enquiry.id}`}>+ New Quote</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {enquiry.quotes?.length === 0 ? (
                <p className="text-xs text-muted-foreground">No quotation generated for this enquiry yet.</p>
              ) : (
                <div className="space-y-2">
                  {enquiry.quotes.map((q: { id: string; version: number; total: number; status: string }) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border text-xs"
                    >
                      <div>
                        <span className="font-semibold">Version {q.version}</span>
                        <p className="text-muted-foreground font-bold text-sm">£{q.total?.toFixed(2)}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {q.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
