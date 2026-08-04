import Link from "next/link";
import { UserCheck, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getCleanersList } from "@/server/job-actions";
import { EditCleanerDialog } from "./[id]/_components/edit-cleaner-dialog";
import { DeleteCleanerButton } from "./[id]/_components/delete-cleaner-button";
import { ResetPasswordDialog } from "./[id]/_components/reset-password-dialog";

export default async function CleanersListPage() {
  const cleaners = await getCleanersList();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cleaners Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage active cleaners, availability statuses, edit profiles, and service coverage areas.
          </p>
        </div>

        <Button className="gap-1.5" asChild>
          <Link href="/dashboard/cleaners/new">
            <Plus className="size-4" /> Add New Cleaner
          </Link>
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Registered Cleaners ({cleaners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cleaners.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <UserCheck className="size-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-base">No cleaners registered yet</p>
              <p className="text-xs text-muted-foreground">
                Create cleaner accounts to assign jobs and generate secure job links.
              </p>
              <Button size="sm" asChild>
                <Link href="/dashboard/cleaners/new">+ Add First Cleaner</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Cleaner Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Email & Phone</th>
                    <th className="px-4 py-3">Service Areas</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cleaners.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 font-semibold">
                        {c.profile?.full_name || "Cleaner"}
                        {c.company_name && (
                          <div className="text-xs text-muted-foreground font-normal">{c.company_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 capitalize text-xs">{c.cleaner_type}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <div className="font-medium text-foreground">{c.profile?.email || "No email"}</div>
                        <div>{c.profile?.phone || "No phone"}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs">{c.service_areas?.join(", ") || "General"}</td>
                      <td className="px-4 py-3.5">{getStatusBadge(c.status)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/cleaners/${c.id}`}>
                              <Eye className="size-3.5 mr-1" /> View
                            </Link>
                          </Button>
                          <ResetPasswordDialog cleanerId={c.id} cleanerName={c.profile?.full_name || "Cleaner"} />
                          <EditCleanerDialog
                            cleaner={{
                              id: c.id,
                              fullName: c.profile?.full_name || "",
                              phone: c.profile?.phone || "",
                              cleanerType: c.cleaner_type,
                              companyName: c.company_name || "",
                              address: c.address || "",
                              serviceAreas: c.service_areas?.join(", ") || "",
                              status: c.status,
                              notes: c.notes || "",
                            }}
                          />
                          <DeleteCleanerButton cleanerId={c.id} cleanerName={c.profile?.full_name || "Cleaner"} />
                        </div>
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
