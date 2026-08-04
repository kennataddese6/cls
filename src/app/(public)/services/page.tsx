import Link from "next/link";

import { ArrowRight, Building2, Check, Home, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServicesPage() {
  const services = [
    {
      title: "Standard Domestic Cleaning",
      price: "£80.00",
      duration: "2 hours",
      icon: Home,
      description: "Comprehensive home cleaning covering kitchens, bathrooms, living areas, and bedrooms.",
      checklist: [
        "Dusting all accessible surfaces and furniture",
        "Vacuuming carpets and rugs",
        "Wiping and mopping hard floor surfaces",
        "Sanitising kitchen countertops and sink",
        "Scrubbing toilets, basins, and showers",
        "Emptying waste bins",
      ],
    },
    {
      title: "Deep Spring Cleaning",
      price: "£150.00",
      duration: "4 hours",
      icon: Sparkles,
      description: "Thorough deep clean targeting built-up dirt, limescale, appliances, and hard-to-reach spaces.",
      checklist: [
        "Everything in Standard Cleaning",
        "Deep oven and range hood cleaning",
        "Wiping inside kitchen appliances",
        "Wiping doors, frames, and light switches",
        "Cleaning skirting boards and window sills",
        "Limescale and soap scum removal in bathrooms",
      ],
    },
    {
      title: "End of Tenancy Cleaning",
      price: "£220.00",
      duration: "6 hours",
      icon: ShieldCheck,
      description: "Strict deposit-guaranteed cleaning for tenants, estate agents, and landlords.",
      checklist: [
        "100% Deposit return guarantee clean",
        "Deep cleaning inside all cupboards & drawers",
        "Full kitchen and appliance degreasing",
        "Deep bathroom descaling and sanitisation",
        "Internal window and frame cleaning",
        "Timestamped before & after photo evidence report",
      ],
    },
    {
      title: "Office & Commercial Cleaning",
      price: "£120.00",
      duration: "3 hours",
      icon: Building2,
      description: "Flexible, high-standard commercial cleaning for offices, clinics, and retail properties.",
      checklist: [
        "Workstation and desk sanitisation",
        "Keyboard and phone sanitisation",
        "Staff kitchen and breakroom cleaning",
        "Restroom cleaning and restocking check",
        "High-traffic floor care and vacuuming",
        "Tailored cleaning schedules (daily/weekly)",
      ],
    },
  ];

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
        {services.map((s, idx) => {
          const IconComp = s.icon;
          return (
            <Card
              key={idx}
              className="flex flex-col justify-between border-border hover:border-primary/50 transition-colors"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <IconComp className="size-5" />
                  </div>
                  <span className="text-2xl font-bold text-primary">{s.price}</span>
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
                    {s.checklist.map((item, i) => (
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
          );
        })}
      </div>
    </div>
  );
}
