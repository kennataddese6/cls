import Image from "next/image";
import { Camera, Sparkles, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { getGalleryItemsAction } from "@/server/gallery-actions";
import { AddGalleryDialog } from "./_components/add-gallery-dialog";
import { DeleteGalleryButton } from "./_components/delete-gallery-button";

export default async function AdminGalleryPage() {
  const galleryItems = await getGalleryItemsAction();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Camera className="size-6 text-primary" /> Public Gallery Manager
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage before & after cleaning showcase photos displayed on the public website.
          </p>
        </div>

        <AddGalleryDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {galleryItems.map((item) => (
          <Card key={item.id} className="overflow-hidden border-border group">
            <div className="relative h-56 w-full bg-muted overflow-hidden">
              <Image src={item.image_url} alt={item.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-xs font-semibold">
                    {item.category}
                  </Badge>
                  <DeleteGalleryButton id={item.id} />
                </div>
                <h3 className="font-bold text-white text-lg leading-tight">{item.title}</h3>
              </div>
            </div>

            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <span className="font-bold text-destructive uppercase tracking-wider flex items-center gap-1">
                  <Camera className="size-3" /> BEFORE
                </span>
                <p className="text-muted-foreground leading-relaxed">{item.before_description}</p>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <span className="font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="size-3" /> AFTER
                </span>
                <p className="text-muted-foreground leading-relaxed">{item.after_description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
