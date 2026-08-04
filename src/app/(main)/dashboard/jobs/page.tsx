import Link from "next/link";
import { Briefcase, Eye, Calendar, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getJobsList } from "@/server/job-actions";

export default async function JobsListPage() {
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
            Pending Review
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-emerald-600 text-white">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status?.replace("_", " ")}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cleaning Jobs & Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Track operational job execution, assigned cleaners, schedules, and completion reviews.
          </p>
        </div>

        <Button variant="outline" className="gap-1.5" asChild>
          <Link href="/dashboard/jobs/calendar">
            <Calendar className="size-4" /> View Schedule Calendar
          </Link>
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">All Jobs ({jobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Briefcase className="size-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-base">No jobs assigned yet</p>
              <p className="text-xs text-muted-foreground">
                Assign cleaners to accepted quotes to begin operational tracking.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Booking Ref</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Assigned Cleaner</th>
                    <th className="px-4 py-3">Scheduled Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">{j.booking?.reference}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium">{j.booking?.customer?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{j.booking?.address?.city}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-xs">
                        {j.cleaner?.profile?.full_name || "Unassigned"}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {j.scheduled_date} ({j.scheduled_time || "Morning"})
                      </td>
                      <td className="px-4 py-3.5">{getStatusBadge(j.booking?.status || "assigned")}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/jobs/${j.id}`}>
                            <Eye className="size-3.5 mr-1" /> View Job
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
