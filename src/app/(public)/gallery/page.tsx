import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getGalleryItemsAction } from "@/server/gallery-actions";

export default async function GalleryPage() {
  const galleryItems = await getGalleryItemsAction();

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
        {galleryItems.map((item) => (
          <Card key={item.id} className="overflow-hidden border-border shadow-xs">
            <div className="relative h-64 w-full overflow-hidden bg-muted">
              <Image src={item.image_url} alt={item.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                <span className="font-bold text-white text-lg tracking-tight">{item.title}</span>
              </div>
            </div>
            <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Service Type</span>
              <Badge variant="secondary" className="font-semibold">
                {item.category}
              </Badge>
            </div>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <span className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="size-3.5" /> BEFORE
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.before_description}</p>
              </div>
              <div className="space-y-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> AFTER
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.after_description}</p>
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
