"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  Calendar,
  Clock,
  FileText,
  Phone,
  Mail,
  ArrowRight,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { getCustomerTrackedBookingsAction, type LiveBookingDetails } from "@/server/booking-tracker-actions";
import { ReviewModalDialog } from "@/app/(public)/track/_components/review-modal-dialog";

export function CustomerFloatingWidget() {
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState<LiveBookingDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const data = await getCustomerTrackedBookingsAction();
        setBookings(data || []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [open]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "quotation_sent":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-[10px]">Quote Sent</Badge>;
      case "quotation_accepted":
      case "cleaner_assigned":
      case "cleaner_accepted":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">Scheduled</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">In Progress</Badge>;
      case "completed_pending_review":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">Submitted</Badge>
        );
      case "completed":
      case "paid":
        return <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Completed</Badge>;
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status.replace("_", " ")}
          </Badge>
        );
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full size-14 p-0 bg-primary text-primary-foreground shadow-2xl hover:scale-105 transition-transform duration-200 ring-4 ring-primary/20 relative flex items-center justify-center"
          >
            <ShoppingBag className="size-6" />
            {bookings.length > 0 && (
              <span className="absolute -top-1 -right-1 size-5 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold flex items-center justify-center shadow-md animate-pulse">
                {bookings.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card">
          {/* Header */}
          <SheetHeader className="p-5 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Sparkles className="size-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold">Booking Hub & Assistant</SheetTitle>
                <SheetDescription className="text-xs">
                  Track active bookings, view invoices, or book a new clean
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                asChild
                className="w-full bg-primary font-semibold gap-1.5 h-11 text-xs"
                onClick={() => setOpen(false)}
              >
                <Link href="/book">
                  <Plus className="size-4" /> Book New Clean
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full font-semibold gap-1.5 h-11 text-xs"
                onClick={() => setOpen(false)}
              >
                <Link href="/track">
                  <Calendar className="size-4" /> Full Tracker
                </Link>
              </Button>
            </div>

            {/* Tracked Customer Bookings Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Your Tracked Bookings ({bookings.length})
                </h4>
                <span className="text-[10px] text-muted-foreground">Saved to browser</span>
              </div>

              {loading ? (
                <div className="p-6 text-center text-xs text-muted-foreground">Loading tracked bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground bg-muted/30 border border-dashed border-border rounded-xl space-y-2">
                  <ShoppingBag className="size-6 text-muted-foreground mx-auto" />
                  <p className="font-semibold text-foreground">No Active Bookings Tracked</p>
                  <p>Bookings made on this device will automatically show up here for live tracking.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => {
                    const isCompleted = b.status === "completed" || b.status === "paid";

                    return (
                      <div key={b.id} className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-primary">{b.reference}</span>
                          {getStatusBadge(b.status)}
                        </div>

                        <div>
                          <p className="font-semibold text-foreground">{b.service_type}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="size-3 text-primary" /> {b.scheduled_date} ({b.scheduled_time})
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60">
                          <span className="font-bold text-foreground">£{b.total_price?.toFixed(2)}</span>

                          <div className="flex items-center gap-1.5">
                            {b.quote_token && (
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                asChild
                                title="View Quote"
                                onClick={() => setOpen(false)}
                              >
                                <Link href={`/q/${b.quote_token}`}>
                                  <FileText className="size-3.5 text-primary" />
                                </Link>
                              </Button>
                            )}

                            {b.invoice_token && (
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                asChild
                                title="View Invoice"
                                onClick={() => setOpen(false)}
                              >
                                <Link href={`/i/${b.invoice_token}`}>
                                  <FileText className="size-3.5 text-emerald-600" />
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct Support Section */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs">
              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                <Phone className="size-3.5 text-primary" /> Need Immediate Assistance?
              </h4>
              <p className="text-muted-foreground text-[11px]">
                Speak directly with Sam Spotless Cleaning support team:
              </p>
              <div className="space-y-1 font-semibold pt-1">
                <p className="flex items-center gap-1.5 text-primary">
                  <Phone className="size-3" /> Landline: 02035761607
                </p>
                <p className="flex items-center gap-1.5 text-primary">
                  <Phone className="size-3" /> Mobile / WhatsApp: +44 7442 052931
                </p>
                <p className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Mail className="size-3" /> sam@samspotlesscleaning.com
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
