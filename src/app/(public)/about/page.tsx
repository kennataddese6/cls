import Link from "next/link";

import { ArrowRight, Award, Heart, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="text-primary border-primary/30">
          About Our Company
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Setting New Standards in Professional Cleaning</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Founded with a clear mission: to provide homeowners, tenants, and commercial businesses with immaculate spaces
          through reliable, transparent, and tech-enabled cleaning services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="text-center p-6 space-y-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <ShieldCheck className="size-6" />
          </div>
          <h3 className="font-semibold text-xl">Verified & Trusted</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every cleaner on our team undergoes comprehensive background checks, identity verification, and extensive
            hands-on training.
          </p>
        </Card>

        <Card className="text-center p-6 space-y-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Award className="size-6" />
          </div>
          <h3 className="font-semibold text-xl">Photo Evidence Quality</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We pioneered photo evidence validation — every completed job includes before and after photos uploaded
            directly to your job report.
          </p>
        </Card>

        <Card className="text-center p-6 space-y-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Heart className="size-6" />
          </div>
          <h3 className="font-semibold text-xl">Customer First</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We back every single clean with our 100% satisfaction guarantee. If anything isn&apos;t right, we fix it
            within 24 hours.
          </p>
        </Card>
      </div>

      <div className="rounded-3xl bg-muted/40 border border-border p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <Badge variant="outline" className="text-primary border-primary/30">
            Our Commitment
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">Why Customers Trust Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Whether you need a one-off deep clean, an end-of-tenancy guarantee clean, or regular office cleaning, we
            bring professional equipment, eco-friendly supplies, and total accountability to every single job.
          </p>
          <Button className="gap-2" asChild>
            <Link href="/book">
              Book a Cleaning Service <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-card border border-border">
            <h4 className="font-semibold text-base">Over 500+ Satisfied Clients</h4>
            <p className="text-xs text-muted-foreground">
              Serving homes, offices, and estate agencies across the region.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <h4 className="font-semibold text-base">Full Insurance Coverage</h4>
            <p className="text-xs text-muted-foreground">
              Comprehensive public liability insurance for complete peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
