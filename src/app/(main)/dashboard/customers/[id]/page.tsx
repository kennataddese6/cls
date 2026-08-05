import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getCustomerById } from "@/server/customer-actions";
import { EditCustomerDialog } from "../_components/edit-customer-dialog";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{customer.full_name}</h1>
            <p className="text-xs text-muted-foreground">Customer ID: {customer.id}</p>
          </div>
        </div>

        <EditCustomerDialog customer={customer} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile & Addresses */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" /> Profile Overview
              </CardTitle>
              <EditCustomerDialog customer={customer} />
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Email:</span>
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  <Mail className="size-3.5 text-muted-foreground" /> {customer.email}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Phone:</span>
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  <Phone className="size-3.5 text-muted-foreground" /> {customer.phone || "Not provided"}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground">Member Since:</span>
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  {new Date(customer.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Address Book */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> Property Address Book
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.addresses?.length === 0 ? (
                <p className="text-xs text-muted-foreground">No stored addresses.</p>
              ) : (
                customer.addresses.map(
                  (a: {
                    id: string;
                    line1: string;
                    city: string;
                    postcode: string;
                    property_type: string;
                    bedrooms: number;
                    bathrooms: number;
                  }) => (
                    <div key={a.id} className="p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
                      <p className="font-semibold text-sm">{a.line1}</p>
                      <p className="text-muted-foreground">
                        {a.city}, {a.postcode}
                      </p>
                      <p className="text-muted-foreground capitalize">
                        {a.property_type} • {a.bedrooms} Bed, {a.bathrooms} Bath
                      </p>
                    </div>
                  ),
                )
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Booking History */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Booking History ({customer.bookings?.length || 0})</CardTitle>
              <CardDescription>All job requests and cleaning history for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {customer.bookings?.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No bookings associated with this profile yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {customer.bookings.map(
                    (b: {
                      id: string;
                      reference: string;
                      status: string;
                      service_type: string;
                      preferred_date: string;
                    }) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border text-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">{b.reference}</span>
                            <Badge variant="outline" className="capitalize">
                              {b.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="font-medium text-xs capitalize">{b.service_type?.replace("_", " ")} Clean</p>
                          <p className="text-xs text-muted-foreground">Preferred Date: {b.preferred_date}</p>
                        </div>

                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/enquiries/${b.id}`}>
                            <Eye className="size-3.5 mr-1" /> View Booking
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
