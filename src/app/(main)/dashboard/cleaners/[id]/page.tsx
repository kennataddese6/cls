import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getCleanerById } from "@/server/job-actions";
import { EditCleanerDialog } from "./_components/edit-cleaner-dialog";
import { DeleteCleanerButton } from "./_components/delete-cleaner-button";
import { ResetPasswordDialog } from "./_components/reset-password-dialog";

export default async function CleanerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cleaner = await getCleanerById(id);

  if (!cleaner) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Available
          </Badge>
        );
      case "busy":
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            Busy
          </Badge>
        );
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/cleaners">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{cleaner.profile?.full_name || "Cleaner Profile"}</h1>
              {getStatusBadge(cleaner.status)}
            </div>
            <p className="text-xs text-muted-foreground font-mono">Cleaner ID: {cleaner.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ResetPasswordDialog cleanerId={cleaner.id} cleanerName={cleaner.profile?.full_name || "Cleaner"} />
          <EditCleanerDialog
            cleaner={{
              id: cleaner.id,
              fullName: cleaner.profile?.full_name || "",
              phone: cleaner.profile?.phone || "",
              cleanerType: cleaner.cleaner_type,
              companyName: cleaner.company_name || "",
              address: cleaner.address || "",
              serviceAreas: cleaner.service_areas?.join(", ") || "",
              status: cleaner.status,
              notes: cleaner.notes || "",
            }}
          />
          <DeleteCleanerButton cleanerId={cleaner.id} cleanerName={cleaner.profile?.full_name || "Cleaner"} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" /> Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Email:</span>
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  <Mail className="size-3.5 text-muted-foreground" /> {cleaner.profile?.email || "Not provided"}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Phone:</span>
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  <Phone className="size-3.5 text-muted-foreground" /> {cleaner.profile?.phone || "Not provided"}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Cleaner Type:</span>
                <p className="font-medium capitalize mt-0.5">
                  {cleaner.cleaner_type} {cleaner.company_name ? `(${cleaner.company_name})` : ""}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Service Areas:</span>
                <p className="font-medium mt-0.5">{cleaner.service_areas?.join(", ") || "General"}</p>
              </div>

              {cleaner.notes && (
                <div>
                  <span className="text-xs text-muted-foreground">Internal Notes:</span>
                  <p className="font-medium text-xs mt-0.5 p-2.5 rounded-lg bg-muted/40 border border-border">
                    {cleaner.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assigned Jobs */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Assigned Work History ({cleaner.jobs?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {cleaner.jobs?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No jobs assigned to this cleaner yet.</p>
              ) : (
                <div className="space-y-3">
                  {cleaner.jobs?.map(
                    (j: {
                      id: string;
                      scheduled_date: string;
                      scheduled_time: string;
                      booking?: { reference: string; status: string };
                    }) => (
                      <div
                        key={j.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border text-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">{j.booking?.reference}</span>
                            <Badge variant="outline" className="capitalize">
                              {j.booking?.status?.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Scheduled: {j.scheduled_date} ({j.scheduled_time})
                          </p>
                        </div>

                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/jobs/${j.id}`}>
                            <Eye className="size-3.5 mr-1" /> View Job
                          </Link>
                        </Button>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
