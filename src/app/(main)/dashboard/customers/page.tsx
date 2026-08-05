import Link from "next/link";
import { Users, Search, Eye, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getCustomersList } from "@/server/customer-actions";
import { EditCustomerDialog } from "./_components/edit-customer-dialog";

export default async function CustomersListPage() {
  const customers = await getCustomersList();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Database</h1>
          <p className="text-sm text-muted-foreground">
            View customer profiles, contact info, address book, and booking history.
          </p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">All Customers ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Users className="size-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-base">No customers registered yet</p>
              <p className="text-xs text-muted-foreground">
                Customer records will be created automatically when bookings are submitted.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Total Bookings</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((c) => {
                    const bookingCount = c.bookings?.[0]?.count || 0;
                    return (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3.5 font-semibold">{c.full_name}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">{c.email}</td>
                        <td className="px-4 py-3.5 text-xs">{c.phone || "N/A"}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant="secondary">{bookingCount} Bookings</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <EditCustomerDialog customer={c} />
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/customers/${c.id}`}>
                                <Eye className="size-3.5 mr-1" /> View Profile
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
