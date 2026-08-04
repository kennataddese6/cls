import { Sparkles } from "lucide-react";
import { APP_CONFIG } from "@/config/app-config";
import { getCustomerTrackedBookingsAction } from "@/server/booking-tracker-actions";
import { TrackedBookingsView } from "./_components/tracked-bookings-view";

export default async function CustomerTrackBookingsPage() {
  const trackedBookings = await getCustomerTrackedBookingsAction();

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{APP_CONFIG.name} Tracker</h1>
            <p className="text-xs text-muted-foreground">Track your booked cleaning services & status</p>
          </div>
        </div>

        {/* Tracker View */}
        <TrackedBookingsView initialBookings={trackedBookings} />
      </div>
    </div>
  );
}
