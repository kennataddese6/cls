import Link from "next/link";

import { ArrowRight, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TestimonialsPage() {
  const reviews = [
    {
      quote:
        "The end of tenancy clean was flawless! My landlord returned 100% of my deposit without any questions. The photo evidence link was super reassuring.",
      author: "Sarah Jenkins",
      role: "Tenant in London",
      location: "Islington",
      rating: 5,
    },
    {
      quote:
        "Extremely professional service. Having before and after photos uploaded directly to the job record gives total peace of mind.",
      author: "David Knight",
      role: "Homeowner",
      location: "Kensington",
      rating: 5,
    },
    {
      quote:
        "We use them for our office cleaning twice a week. Reliable, punctual, and the invoice workflow is super smooth for our accounting team.",
      author: "Emma Taylor",
      role: "Office Manager",
      location: "City of London",
      rating: 5,
    },
    {
      quote:
        "I booked a deep clean after moving into our new property. The team left the oven, bathrooms, and carpets looking like brand new!",
      author: "Michael Roberts",
      role: "Property Buyer",
      location: "Richmond",
      rating: 5,
    },
    {
      quote:
        "The quote process was super transparent. No surprise fees. Accepted online and the cleaner arrived right on time.",
      author: "Rachel Adams",
      role: "Landlord",
      location: "Chelsea",
      rating: 5,
    },
    {
      quote:
        "Top quality commercial clean for our restaurant space. Highly recommended for any business needing thorough hygiene standards.",
      author: "James Wilson",
      role: "Restaurant Owner",
      location: "Soho",
      rating: 5,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="text-primary border-primary/30">
          Customer Feedback
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">What Our Clients Say</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Read genuine reviews from homeowners, tenants, property managers, and business owners who rely on our cleaning
          services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r, idx) => (
          <Card key={idx} className="flex flex-col justify-between border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-1 text-amber-500">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">&quot;{r.quote}&quot;</p>
              <div className="pt-2 border-t border-border">
                <p className="font-semibold text-sm">{r.author}</p>
                <p className="text-xs text-muted-foreground">
                  {r.role} • {r.location}
                </p>
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
