import Link from "next/link";
import { Briefcase, Eye, Calendar, MapPin, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getJobsList } from "@/server/job-actions";

export default async function CleanerDashboardPage() {
  const jobs = await getJobsList();

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
        return <Badge variant="outline">{status?.replace("_", " ")}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Cleaner Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          View your assigned jobs, start work, upload before/after photos, and complete tasks.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Assigned Jobs ({jobs.length})</CardTitle>
          <CardDescription>Click on any job to view customer details and manage work status</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Briefcase className="size-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-base">No assigned jobs right now</p>
              <p className="text-xs text-muted-foreground">
                Jobs assigned to you by administration will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-card border border-border gap-4 shadow-sm hover:border-primary/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{j.booking?.reference}</span>
                      {getStatusBadge(j.booking?.status || "assigned")}
                    </div>

                    <h3 className="font-semibold text-base">{j.booking?.service_type?.replace("_", " ")} Clean</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-primary" /> {j.booking?.address?.line1},{" "}
                        {j.booking?.address?.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5 text-primary" /> {j.scheduled_date} ({j.scheduled_time})
                      </span>
                    </div>
                  </div>

                  <Button className="gap-1.5" asChild>
                    <Link href={`/cleaner/jobs/${j.id}`}>
                      Open Job <Eye className="size-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
