import Link from "next/link";
import {
  Inbox,
  FileText,
  Briefcase,
  AlertCircle,
  ReceiptText,
  ArrowRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getDashboardKpis, getRecentBookings } from "@/server/enquiry-actions";

export default async function OverviewPage() {
  const kpis = await getDashboardKpis();
  const recentBookings = await getRecentBookings(6);

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
            Quoted
          </Badge>
        );
      case "quotation_accepted":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            Quote Accepted
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-emerald-600 text-white">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status.replace("_", " ")}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here is a summary of active enquiries, jobs, and revenue items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" asChild>
            <Link href="/dashboard/enquiries">
              View All Enquiries <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              New Enquiries
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Inbox className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.newEnquiries}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting admin review</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quotes Awaiting
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <FileText className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.quotesAwaiting}</div>
            <p className="text-xs text-muted-foreground mt-1">Sent to customers</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today&apos;s Jobs
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Briefcase className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.todaysJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Unassigned Jobs
            </CardTitle>
            <div className="size-8 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center">
              <AlertCircle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.unassignedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs cleaner assignment</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Overdue Invoices
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ReceiptText className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.overdueInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Enquiries & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Enquiries Feed */}
        <Card className="lg:col-span-8 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Enquiries & Bookings</CardTitle>
              <CardDescription>Latest customer requests submitted from website</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/enquiries">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No customer enquiries recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{b.reference}</span>
                        {getStatusBadge(b.status)}
                      </div>
                      <p className="text-sm font-medium">{b.customer?.full_name || "Guest Customer"}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.service_type?.replace("_", " ")} clean • {b.address?.city || "London"} • Date:{" "}
                        {b.preferred_date}
                      </p>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/enquiries/${b.id}`}>Review Enquiry</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Widget: Quick Operations */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Quick Workflow Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-left gap-2" asChild>
                <Link href="/dashboard/enquiries">
                  <Inbox className="size-4 text-amber-500" /> Review New Enquiries
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-left gap-2" asChild>
                <Link href="/dashboard/quotes">
                  <FileText className="size-4 text-purple-500" /> Manage Quotations
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-left gap-2" asChild>
                <Link href="/dashboard/jobs">
                  <Briefcase className="size-4 text-blue-500" /> Job Assignments & Schedule
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start text-left gap-2" asChild>
                <Link href="/dashboard/cleaners/new">
                  <Plus className="size-4 text-emerald-500" /> Create Cleaner Account
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <h4 className="font-semibold text-sm">System Workflow Active</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All booking enquiries, quote generation, and cleaner assignment links are linked with audit logging.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
