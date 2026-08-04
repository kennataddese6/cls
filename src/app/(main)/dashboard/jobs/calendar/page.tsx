import Link from "next/link";
import { Calendar as CalendarIcon, ArrowLeft, Briefcase, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getJobsList } from "@/server/job-actions";

export default async function JobCalendarPage() {
  const jobs = await getJobsList();

  // Group jobs by date
  const groupedJobs: Record<string, typeof jobs> = {};
  jobs.forEach((j) => {
    const dateKey = j.scheduled_date || "Unscheduled";
    if (!groupedJobs[dateKey]) groupedJobs[dateKey] = [];
    groupedJobs[dateKey].push(j);
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/jobs">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Schedule Calendar</h1>
            <p className="text-sm text-muted-foreground">Day-by-day operational schedule of assigned cleaner jobs.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedJobs).length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              No scheduled jobs found in calendar.
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedJobs).map(([date, dateJobs]) => (
            <Card key={date} className="border-border">
              <CardHeader className="bg-muted/40 py-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CalendarIcon className="size-4 text-primary" /> {date} ({dateJobs.length} Jobs)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {dateJobs.map((j) => (
                  <div
                    key={j.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-card border border-border gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{j.booking?.reference}</span>
                        <Badge variant="outline" className="capitalize">
                          {j.booking?.status?.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="font-semibold text-sm">
                        Cleaner: {j.cleaner?.profile?.full_name || "Unassigned"} • Time: {j.scheduled_time || "Morning"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Customer: {j.booking?.customer?.full_name} • Location: {j.booking?.address?.line1},{" "}
                        {j.booking?.address?.city}
                      </p>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/jobs/${j.id}`}>
                        <Eye className="size-3.5 mr-1" /> Job Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
