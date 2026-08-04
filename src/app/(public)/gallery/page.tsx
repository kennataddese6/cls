import Link from "next/link";
import Image from "next/image";

import { ArrowRight, Camera, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GalleryPage() {
  const galleryItems = [
    {
      title: "Kitchen Oven Deep Clean",
      category: "Deep Clean",
      image: "/images/oven_clean.png",
      before: "Heavy grease accumulation and burnt-on carbon residue.",
      after: "Immaculate, restored stainless steel finish and crystal clear glass door.",
    },
    {
      title: "Bathroom Tile & Grout Restoration",
      category: "End of Tenancy",
      image: "/images/clean_home.png",
      before: "Limescale buildup and mold staining on shower tiles.",
      after: "Disinfected, brilliant white grout and limescale-free glass screen.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="text-primary border-primary/30">
          Photo Evidence
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Before & After Showcase</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          See real results from our cleaning teams. Every job completed through our platform includes verified photo
          evidence uploaded by your assigned cleaner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {galleryItems.map((item, idx) => (
          <Card key={idx} className="overflow-hidden border-border">
            <div className="relative h-56 w-full overflow-hidden">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <span className="font-bold text-white text-base">{item.title}</span>
              </div>
            </div>
            <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Category</span>
              <Badge variant="secondary">{item.category}</Badge>
            </div>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <span className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="size-3.5" /> BEFORE
                </span>
                <p className="text-xs text-muted-foreground">{item.before}</p>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> AFTER
                </span>
                <p className="text-xs text-muted-foreground">{item.after}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-8">
        <Button size="lg" className="gap-2" asChild>
          <Link href="/book">
            Request Your Own Clean <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
