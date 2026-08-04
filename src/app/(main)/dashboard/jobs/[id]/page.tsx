import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Camera,
  CheckCircle2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getJobById, getCleanersList } from "@/server/job-actions";
import { AssignCleanerDialog } from "../_components/assign-cleaner-dialog";
import { ApproveJobButton } from "./_components/approve-job-button";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobById(id);
  const cleaners = await getCleanersList();

  if (!job) {
    notFound();
  }

  const cleanerOptions = cleaners.map((c: { id: string; profile?: { full_name?: string } }) => ({
    id: c.id,
    name: c.profile?.full_name || "Cleaner",
  }));

  const bookingStatus = job.booking?.status || "cleaner_assigned";
  const isCompleted = bookingStatus === "completed";
  const isPendingReview = !isCompleted && (bookingStatus === "completed_pending_review" || Boolean(job.completed_at));

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return (
        <Badge variant="secondary" className="bg-emerald-600 text-white font-bold">
          Completed & Closed
        </Badge>
      );
    }
    if (status === "completed_pending_review" || (!isCompleted && job.completed_at)) {
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
          Pending Admin Review
        </Badge>
      );
    }
    if (status === "in_progress" || job.started_at) {
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
          In Progress
        </Badge>
      );
    }
    if (status === "cleaner_accepted" || job.accepted_at) {
      return (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
          Cleaner Accepted
        </Badge>
      );
    }
    return <Badge variant="outline">{status.replace("_", " ")}</Badge>;
  };

  const beforePhotos = (job.booking?.photos || []).filter((p: { category: string }) => p.category === "before");
  const afterPhotos = (job.booking?.photos || []).filter((p: { category: string }) => p.category === "after");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/jobs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight font-mono">{job.booking?.reference}</h1>
              {getStatusBadge(bookingStatus)}
            </div>
            <p className="text-xs text-muted-foreground">
              Assigned Cleaner:{" "}
              <span className="font-semibold text-foreground">{job.cleaner?.profile?.full_name || "Unassigned"}</span>
            </p>
          </div>
        </div>

        {isPendingReview && <ApproveJobButton jobId={job.id} bookingId={job.booking_id} />}
      </div>

      {/* Pending Review Banner */}
      {isPendingReview && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-700">
              <CheckCircle2 className="size-5 text-amber-600" /> Cleaner Has Completed Work & Submitted Photos
            </div>
            <p className="text-xs text-muted-foreground">
              Review before & after evidence photos below and approve job completion to finalize the record.
            </p>
            {job.cleaner_notes && (
              <p className="text-xs font-semibold text-amber-900 mt-1 flex items-center gap-1">
                <MessageSquare className="size-3.5" /> Cleaner Notes: &quot;{job.cleaner_notes}&quot;
              </p>
            )}
          </div>

          <ApproveJobButton jobId={job.id} bookingId={job.booking_id} />
        </div>
      )}

      {/* Completed Success Banner */}
      {isCompleted && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-bold text-emerald-800 text-sm">Job Approved & Completed</h3>
            <p className="text-xs text-emerald-700">
              This job has been completed by cleaner {job.cleaner?.profile?.full_name || ""} and approved by
              administration.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Specification & Photo Gallery */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" /> Job & Property Location
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Customer Name:</span>
                <p className="font-semibold">{job.booking?.customer?.full_name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Phone:</span>
                <p className="font-semibold flex items-center gap-1 mt-0.5">
                  <Phone className="size-3.5 text-muted-foreground" /> {job.booking?.customer?.phone || "N/A"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground">Property Address:</span>
                <p className="font-semibold flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  {job.booking?.address?.line1}, {job.booking?.address?.city}, {job.booking?.address?.postcode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Before & After Photo Evidence Gallery */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="size-4 text-primary" /> Before & After Evidence Photos
              </CardTitle>
              <CardDescription>Visual evidence submitted by the assigned cleaner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Photos */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="size-3.5" /> BEFORE PHOTOS ({beforePhotos.length})
                  </span>

                  {beforePhotos.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-6 text-center">No BEFORE photos uploaded.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {beforePhotos.map((p: { id: string; storage_path: string }) => (
                        <div
                          key={p.id}
                          className="relative h-32 rounded-lg overflow-hidden border border-border bg-card"
                        >
                          <Image src={p.storage_path} alt="Before photo" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* After Photos */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="size-3.5" /> AFTER PHOTOS ({afterPhotos.length})
                  </span>

                  {afterPhotos.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-6 text-center">No AFTER photos uploaded.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {afterPhotos.map((p: { id: string; storage_path: string }) => (
                        <div
                          key={p.id}
                          className="relative h-32 rounded-lg overflow-hidden border border-border bg-card"
                        >
                          <Image src={p.storage_path} alt="After photo" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Controls or Completed Summary */}
        <div className="lg:col-span-4 space-y-6">
          {!isCompleted ? (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Assignment Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <AssignCleanerDialog
                  bookingId={job.booking_id}
                  cleaners={cleanerOptions}
                  currentCleanerId={job.cleaner_id}
                  currentDate={job.scheduled_date}
                  currentTime={job.scheduled_time}
                  existingToken={job.secure_token}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-emerald-500/5 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="size-5 text-emerald-600" /> Job Completed & Closed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>
                  This job has been fully executed by the cleaner, reviewed and approved by administration, and closed.
                </p>
                <div className="p-3 rounded-lg bg-background border border-border space-y-1">
                  <span className="font-semibold text-foreground">Assigned Cleaner:</span>
                  <p className="font-medium text-foreground">{job.cleaner?.profile?.full_name || "Assigned Cleaner"}</p>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border space-y-1">
                  <span className="font-semibold text-foreground">Scheduled Date:</span>
                  <p className="font-medium text-foreground">
                    {job.scheduled_date} ({job.scheduled_time})
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
