import { Sparkles, Check, Home, Building2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getServicesListAction } from "@/server/service-actions";
import { AddServiceDialog } from "./_components/add-service-dialog";
import { EditServiceDialog } from "./_components/edit-service-dialog";
import { DeleteServiceButton } from "./_components/delete-service-button";

export default async function AdminServicesPage() {
  const services = await getServicesListAction();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="size-6 text-primary" /> Services & Pricing Manager
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage offered cleaning packages, edit prices, duration, and feature checklists.
          </p>
        </div>

        <AddServiceDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((s) => (
          <Card
            key={s.id}
            className="flex flex-col justify-between border-border hover:border-primary/40 transition-colors"
          >
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-mono">
                  {s.duration || "Standard"}
                </Badge>
                <span className="text-2xl font-extrabold text-primary font-mono">{s.price}</span>
              </div>
              <CardTitle className="text-xl">{s.title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed">{s.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Checklist Features ({s.checklist?.length || 0})
                </span>
                <ul className="space-y-1.5 text-xs">
                  {(s.checklist || []).slice(0, 5).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                  {(s.checklist || []).length > 5 && (
                    <p className="text-[10px] text-muted-foreground italic pt-1">
                      +{(s.checklist || []).length - 5} more features
                    </p>
                  )}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <EditServiceDialog service={s} />
                <DeleteServiceButton id={s.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
