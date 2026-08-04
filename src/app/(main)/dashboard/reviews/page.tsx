import { Star, CheckCircle2, Clock, MessageSquare, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { getReviewsListAdminAction } from "@/server/review-actions";
import { ReviewItemActions } from "./_components/review-item-actions";

export default async function AdminReviewsPage() {
  const reviews = await getReviewsListAdminAction();

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Reviews Manager</h1>
          <p className="text-xs text-muted-foreground">
            Approve customer reviews submitted after completed cleaning jobs to publish them on your public site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            {pendingCount} Pending Approval
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            {approvedCount} Live & Published
          </Badge>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="border-border border-dashed text-center py-12">
            <CardContent className="space-y-3">
              <MessageSquare className="size-8 text-muted-foreground mx-auto" />
              <h3 className="font-semibold text-lg">No Reviews Submitted Yet</h3>
              <p className="text-xs text-muted-foreground">
                Customer reviews submitted upon job completion will appear here for admin moderation.
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((r) => (
            <Card key={r.id} className="border-border shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base">{r.customer_name}</span>
                      {r.status === "approved" ? (
                        <Badge className="bg-emerald-600 text-white gap-1 text-[10px]">
                          <CheckCircle2 className="size-3" /> Published Live
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]"
                        >
                          <Clock className="size-3" /> Pending Admin Review
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Submitted on {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <ReviewItemActions reviewId={r.id} status={r.status} />
                </div>

                {/* Rating & Review Body */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`size-4 ${
                          s <= r.rating ? "text-amber-500 fill-amber-500" : "text-muted border-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-muted-foreground ml-1.5">{r.rating}.0 / 5.0</span>
                  </div>

                  {r.title && <h4 className="font-semibold text-sm">{r.title}</h4>}
                  <p className="text-sm text-foreground/90 italic bg-muted/30 p-3 rounded-xl border border-border">
                    &quot;{r.comment}&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
