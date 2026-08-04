import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Phone, MapPin, Calendar, Clock, Camera, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getJobById, getCleanersList, adminApproveJobCompletionAction } from "@/server/job-actions";
import { AssignCleanerDialog } from "../_components/assign-cleaner-dialog";

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

  const isPendingReview = job.booking?.status === "completed_pending_review";
  const isCompleted = job.booking?.status === "completed" || job.booking?.status === "paid";

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
              <Badge variant="outline" className="capitalize">
                {job.booking?.status?.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Assigned Cleaner:{" "}
              <span className="font-semibold text-foreground">{job.cleaner?.profile?.full_name || "Unassigned"}</span>
            </p>
          </div>
        </div>

        {isPendingReview && (
          <form
            action={async () => {
              "use server";
              await adminApproveJobCompletionAction(job.id, job.booking_id);
            }}
          >
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <CheckCircle2 className="size-4" /> Approve Job Completion
            </Button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job & Customer Specification */}
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

          {/* Photos Review */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="size-4 text-primary" /> Before & After Evidence Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.booking?.photos?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No evidence photos uploaded by cleaner yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {job.booking?.photos?.map((p: { id: string; category: string; storage_path: string }) => (
                    <div key={p.id} className="p-3 rounded-lg bg-muted/40 border border-border text-center space-y-1">
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {p.category}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground truncate">{p.storage_path}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assignment & Actions */}
        <div className="lg:col-span-4 space-y-6">
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
        </div>
      </div>
    </div>
  );
}
