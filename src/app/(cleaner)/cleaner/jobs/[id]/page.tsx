import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getJobById } from "@/server/job-actions";
import { CleanerJobActions } from "../_components/cleaner-job-actions";
import { PhotoUploadSection } from "../_components/photo-upload-section";

export default async function CleanerJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  const bookingStatus = job.booking?.status || "cleaner_assigned";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "cleaner_assigned":
        return (
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
            Assigned
          </Badge>
        );
      case "cleaner_accepted":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
            Accepted
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            In Progress
          </Badge>
        );
      case "completed_pending_review":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Submitted
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-emerald-600 text-white">
            Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status.replace("_", " ")}</Badge>;
    }
  };

  const hasStarted = Boolean(
    job.started_at ||
      bookingStatus === "in_progress" ||
      bookingStatus === "completed_pending_review" ||
      bookingStatus === "completed" ||
      bookingStatus === "paid",
  );

  const existingPhotos = job.booking?.photos || [];
  const hasBeforePhoto = existingPhotos.some(
    (p: { category?: string; photo_type?: string }) => p.category === "before" || p.photo_type === "before",
  );
  const hasAfterPhoto = existingPhotos.some(
    (p: { category?: string; photo_type?: string }) => p.category === "after" || p.photo_type === "after",
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cleaner/dashboard">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono">{job.booking?.reference}</h1>
              {getStatusBadge(bookingStatus)}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {job.booking?.service_type?.replace("_", " ")} Clean
            </p>
          </div>
        </div>
      </div>

      {/* Customer Location & Contact Panel */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="size-4 text-primary" /> Customer & Location Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Customer Name:</span>
              <p className="font-semibold">{job.booking?.customer?.full_name}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Phone Number:</span>
              <p className="font-semibold flex items-center gap-1.5 text-primary mt-0.5">
                <Phone className="size-3.5" /> {job.booking?.customer?.phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-1">
            <span className="text-xs text-muted-foreground">Property Address:</span>
            <p className="font-semibold flex items-start gap-1.5">
              <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
              {job.booking?.address?.line1}, {job.booking?.address?.city}, {job.booking?.address?.postcode}
            </p>
            <p className="text-xs text-muted-foreground capitalize pl-5">
              {job.booking?.property_type} ({job.booking?.bedrooms} Bed, {job.booking?.bathrooms} Bath)
            </p>
          </div>

          <div className="pt-3 border-t border-border grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Scheduled Date:</span>
              <p className="font-semibold flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" /> {job.scheduled_date}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Arrival Window:</span>
              <p className="font-semibold flex items-center gap-1">
                <Clock className="size-3.5 text-primary" /> {job.scheduled_time}
              </p>
            </div>
          </div>

          {job.booking?.key_arrangements && (
            <div className="pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Key Access Instructions:</span>
              <p className="font-medium text-xs mt-0.5 p-2.5 rounded-lg bg-muted/40 border border-border">
                {job.booking?.key_arrangements}
              </p>
            </div>
          )}

          {job.booking?.customer_notes && (
            <div>
              <span className="text-xs text-muted-foreground">Customer Notes:</span>
              <p className="font-medium text-xs italic mt-0.5 p-2.5 rounded-lg bg-muted/40 border border-border">
                &quot;{job.booking?.customer_notes}&quot;
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice & Payment Information Card */}
      {job.booking?.invoices?.[0] && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ReceiptText className="size-4 text-primary" /> Invoice & Payment Status
              </span>
              <Badge
                variant={job.booking.invoices[0].status === "paid" ? "default" : "outline"}
                className={
                  job.booking.invoices[0].status === "paid"
                    ? "bg-emerald-600 text-white"
                    : "border-amber-500 text-amber-600 font-bold"
                }
              >
                {job.booking.invoices[0].status?.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/40 border border-border">
              <div>
                <span className="text-muted-foreground">Invoice Reference:</span>
                <p className="font-mono font-bold text-foreground mt-0.5">{job.booking.invoices[0].invoice_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Job Total Amount:</span>
                <p className="font-bold text-primary text-sm mt-0.5">£{job.booking.invoices[0].total?.toFixed(2)}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full gap-1.5" asChild>
              <Link href={`/i/${job.booking.invoices[0].token}`}>
                <ReceiptText className="size-3.5 text-primary" /> View Customer Invoice Document
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Controls */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Job Status & Actions</CardTitle>
          <CardDescription>Accept, start, or submit completed work</CardDescription>
        </CardHeader>
        <CardContent>
          <CleanerJobActions
            jobId={job.id}
            bookingStatus={bookingStatus}
            acceptedAt={job.accepted_at}
            startedAt={job.started_at}
            completedAt={job.completed_at}
            hasBeforePhoto={hasBeforePhoto}
            hasAfterPhoto={hasAfterPhoto}
          />
        </CardContent>
      </Card>

      {/* Photo Upload Section (Unlocked once job starts) */}
      {hasStarted ? (
        <Card className="border-border">
          <CardContent className="pt-4">
            <PhotoUploadSection jobId={job.id} bookingId={job.booking_id} existingPhotos={job.booking?.photos || []} />
          </CardContent>
        </Card>
      ) : (
        <div className="p-4 rounded-xl bg-muted/40 border border-border text-center text-xs text-muted-foreground space-y-1">
          <Camera className="size-5 text-muted-foreground mx-auto" />
          <p className="font-semibold text-foreground">Before & After Photo Upload Locked</p>
          <p>Accept the job and click &quot;Start Job Now&quot; to unlock photo evidence uploading.</p>
        </div>
      )}
    </div>
  );
}
