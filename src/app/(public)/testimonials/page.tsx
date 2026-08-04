import Link from "next/link";
import { ArrowRight, Star, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicApprovedReviewsAction } from "@/server/review-actions";

export default async function TestimonialsPage() {
  const reviews = await getPublicApprovedReviewsAction();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="text-primary border-primary/30">
          Verified Customer Feedback
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">What Our Clients Say</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Read genuine reviews submitted by homeowners, tenants, and business owners after completed cleaning jobs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <Card key={r.id} className="flex flex-col justify-between border-border shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-amber-500">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-500" />
                  ))}
                </div>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-[10px] gap-1">
                  <ShieldCheck className="size-3" /> Verified Clean
                </Badge>
              </div>

              {r.title && <h3 className="font-bold text-sm text-foreground">{r.title}</h3>}
              <p className="text-sm text-muted-foreground italic leading-relaxed">&quot;{r.comment}&quot;</p>
              <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-foreground">{r.customer_name}</p>
                  <p className="text-muted-foreground text-[11px]">Sam Spotless Client</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-8">
        <Button size="lg" className="gap-2" asChild>
          <Link href="/book">
            Book Your Cleaning Today <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
