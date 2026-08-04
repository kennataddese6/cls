import Link from "next/link";
import { ArrowRight, Building2, Check, Home, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServicesListAction } from "@/server/service-actions";

export default async function ServicesPage() {
  const services = await getServicesListAction();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="text-primary border-primary/30">
          Transparent Pricing
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Cleaning Services & Packages</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          We offer clear, upfront pricing with no hidden fees. All cleaning services include professional supplies,
          equipment, and photo evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((s) => (
          <Card
            key={s.id}
            className="flex flex-col justify-between border-border hover:border-primary/50 transition-colors shadow-xs"
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="size-5" />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-primary font-mono">{s.price}</span>
                  <p className="text-[10px] text-muted-foreground">{s.duration}</p>
                </div>
              </div>
              <CardTitle className="text-2xl">{s.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">{s.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  What&apos;s Included:
                </h4>
                <ul className="space-y-2 text-sm">
                  {(s.checklist || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="w-full gap-2" asChild>
                <Link href={`/book?service=${encodeURIComponent(s.title)}`}>
                  Book {s.title} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
