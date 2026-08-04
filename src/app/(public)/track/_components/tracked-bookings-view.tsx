"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Calendar, Clock, CheckCircle2, FileText, ArrowRight, ShieldCheck, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import type { LiveBookingDetails } from "@/server/booking-tracker-actions";
import { ReviewModalDialog } from "./review-modal-dialog";

interface Props {
  initialBookings: LiveBookingDetails[];
}

export function TrackedBookingsView({ initialBookings }: Props) {
  const [searchRef, setSearchRef] = useState("");
  const [bookings, setBookings] = useState<LiveBookingDetails[]>(initialBookings);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "quotation_sent":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30">Quote Sent</Badge>;
      case "quotation_accepted":
      case "cleaner_assigned":
      case "cleaner_accepted":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">Scheduled</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">In Progress</Badge>;
      case "completed_pending_review":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Under Final Review</Badge>;
      case "completed":
      case "paid":
        return <Badge className="bg-emerald-600 text-white font-bold">Completed & Verified</Badge>;
      default:
        return <Badge variant="outline">{status.replace("_", " ")}</Badge>;
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.reference.toLowerCase().includes(searchRef.toLowerCase()) ||
      b.service_type.toLowerCase().includes(searchRef.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      {/* Tracker Search Header */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Track Your Cleaning Bookings</CardTitle>
          <CardDescription>
            Live status tracking saved to your browser cookies. View quotes, invoices, cleaner assignment, and leave
            reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by reference e.g. CLS-2026-0001 or service name..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="border-border border-dashed text-center py-12">
          <CardContent className="space-y-3">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Calendar className="size-6" />
            </div>
            <h3 className="font-semibold text-lg">No Tracked Bookings Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Bookings made on this browser are automatically tracked here. Book your first cleaning service to get
              started!
            </p>
            <Button asChild className="mt-2 bg-primary">
              <Link href="/book">Book a Clean Now</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isCompleted = b.status === "completed" || b.status === "paid";

            return (
              <Card key={b.id} className="border-border shadow-sm hover:border-primary/40 transition-colors">
                <CardContent className="p-6 space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-lg text-primary">{b.reference}</span>
                        {getStatusBadge(b.status)}
                      </div>
                      <p className="text-sm font-semibold mt-0.5">{b.service_type}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.quote_token && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/q/${b.quote_token}`}>
                            <FileText className="size-3.5 mr-1" /> View Quote
                          </Link>
                        </Button>
                      )}

                      {b.invoice_token && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/i/${b.invoice_token}`}>
                            <FileText className="size-3.5 mr-1 text-emerald-600" /> Invoice
                          </Link>
                        </Button>
                      )}

                      {isCompleted && (
                        <ReviewModalDialog
                          bookingId={b.id}
                          customerName={b.customer_name || "Customer"}
                          serviceType={b.service_type}
                        />
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Assigned Cleaner:</span>
                      <p className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                        <User className="size-3.5 text-primary" /> {b.cleaner_name || "Assigning Cleaner..."}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Scheduled Execution:</span>
                      <p className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                        <Calendar className="size-3.5 text-primary" /> {b.scheduled_date} ({b.scheduled_time})
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Service Amount:</span>
                      <p className="font-bold text-base text-primary mt-0.5">£{b.total_price?.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
