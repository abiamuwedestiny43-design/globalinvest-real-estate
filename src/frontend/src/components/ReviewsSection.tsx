import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useHasSubmittedReview,
  usePropertyAverageRating,
  usePropertyReviews,
  useSubmitReview,
} from "../hooks/useQueries";

function StarRating({
  rating,
  max = 5,
  size = "md",
}: {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "w-6 h-6" : size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const stars = [1, 2, 3, 4, 5].slice(0, max);
  return (
    <span className="flex items-center gap-0.5">
      {stars.map((n) => {
        const filled = n <= Math.round(rating);
        return (
          <Star
            key={n}
            className={`${sizeClass} ${
              filled
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground/30 fill-transparent"
            }`}
          />
        );
      })}
    </span>
  );
}

function InteractiveStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          aria-label={`Rate ${s} stars`}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          data-ocid={`review.star.${s}`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hovered || value)
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground/30 fill-transparent"
            }`}
          />
        </button>
      ))}
    </span>
  );
}

function formatDate(ns: bigint) {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReviewsSection({ propertyId }: { propertyId: bigint }) {
  const { identity } = useInternetIdentity();
  const { data: reviews = [], isLoading: reviewsLoading } =
    usePropertyReviews(propertyId);
  const { data: avgRating = 0 } = usePropertyAverageRating(propertyId);
  const { data: alreadyReviewed } = useHasSubmittedReview(propertyId);
  const submitReview = useSubmitReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isLoggedIn = !!identity;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment.");
      return;
    }
    submitReview.mutate(
      { propertyId, rating: BigInt(rating), comment: comment.trim() },
      {
        onSuccess: () => {
          toast.success("Review submitted!");
          setSubmitted(true);
          setRating(0);
          setComment("");
        },
        onError: () => toast.error("Failed to submit review."),
      },
    );
  }

  return (
    <div
      className="bg-card rounded-2xl border border-border shadow-card p-6"
      data-ocid="reviews.panel"
    >
      <h2 className="font-display text-xl font-semibold mb-4">Guest Reviews</h2>

      {/* Average rating summary */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-display text-4xl font-bold text-foreground">
          {avgRating > 0 ? avgRating.toFixed(1) : "\u2014"}
        </span>
        <div>
          <StarRating rating={avgRating} size="lg" />
          <p className="text-sm text-muted-foreground mt-0.5">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Review list */}
      {reviewsLoading ? (
        <p
          className="text-muted-foreground text-sm"
          data-ocid="reviews.loading_state"
        >
          Loading reviews…
        </p>
      ) : reviews.length === 0 ? (
        <p
          className="text-muted-foreground text-sm mb-6"
          data-ocid="reviews.empty_state"
        >
          No reviews yet. Be the first to leave one!
        </p>
      ) : (
        <ul className="space-y-4 mb-6" data-ocid="reviews.list">
          {reviews.map((review, i) => (
            <li
              key={review.id.toString()}
              className="border-b border-border pb-4 last:border-0 last:pb-0"
              data-ocid={`reviews.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{review.buyerName}</p>
                  <StarRating rating={Number(review.rating)} size="sm" />
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(review.createdAt)}
                </time>
              </div>
              <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Write a review */}
      {!isLoggedIn ? (
        <div
          className="rounded-xl bg-muted/50 p-4 text-center"
          data-ocid="reviews.login_prompt"
        >
          <p className="text-sm text-muted-foreground">
            Log in to leave a review.
          </p>
        </div>
      ) : alreadyReviewed || submitted ? (
        <div
          className="rounded-xl bg-muted/50 p-4 text-center"
          data-ocid="reviews.already_reviewed"
        >
          <p className="text-sm text-muted-foreground">
            You've already reviewed this property.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border-t border-border pt-5 space-y-4"
          data-ocid="reviews.form"
        >
          <h3 className="font-semibold text-sm">Write a Review</h3>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Your rating</p>
            <InteractiveStars value={rating} onChange={setRating} />
          </div>
          <div>
            <Textarea
              placeholder="Share your experience with this property…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
              data-ocid="review.textarea"
            />
          </div>
          <Button
            type="submit"
            disabled={submitReview.isPending}
            className="w-full"
            data-ocid="review.submit_button"
          >
            {submitReview.isPending ? "Submitting…" : "Submit Review"}
          </Button>
        </form>
      )}
    </div>
  );
}
