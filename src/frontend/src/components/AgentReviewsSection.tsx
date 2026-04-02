import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAgentAverageRating,
  useAgentReviews,
  useHasSubmittedAgentReview,
  useSubmitAgentReview,
} from "../hooks/useQueries";

function StarRating({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "w-6 h-6" : size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
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
          data-ocid={`agent_review.star.${s}`}
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

export default function AgentReviewsSection({
  agentId,
}: { agentId: Principal }) {
  const { identity } = useInternetIdentity();
  const { data: reviews = [], isLoading: reviewsLoading } =
    useAgentReviews(agentId);
  const { data: avgRating = 0 } = useAgentAverageRating(agentId);
  const { data: alreadyReviewed } = useHasSubmittedAgentReview(agentId);
  const submitAgentReview = useSubmitAgentReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [transactionId, setTransactionId] = useState("");
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
    submitAgentReview.mutate(
      {
        agentId,
        transactionId: transactionId.trim(),
        rating: BigInt(rating),
        comment: comment.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Review submitted!");
          setSubmitted(true);
          setRating(0);
          setComment("");
          setTransactionId("");
        },
        onError: () => toast.error("Failed to submit review."),
      },
    );
  }

  return (
    <div
      className="bg-card rounded-2xl border border-border shadow-sm p-6"
      data-ocid="agent_reviews.panel"
    >
      <h2 className="font-display text-xl font-semibold mb-4">Agent Reviews</h2>

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
          data-ocid="agent_reviews.loading_state"
        >
          Loading reviews…
        </p>
      ) : reviews.length === 0 ? (
        <p
          className="text-muted-foreground text-sm mb-6"
          data-ocid="agent_reviews.empty_state"
        >
          No reviews yet. Be the first to rate this agent!
        </p>
      ) : (
        <ul className="space-y-4 mb-6" data-ocid="agent_reviews.list">
          {reviews.map((review, i) => (
            <li
              key={review.id.toString()}
              className="border-b border-border pb-4 last:border-0 last:pb-0"
              data-ocid={`agent_reviews.item.${i + 1}`}
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
              {review.comment && (
                <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
                  {review.comment}
                </p>
              )}
              {review.transactionId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Transaction:{" "}
                  <span className="font-mono">{review.transactionId}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Write a review */}
      {!isLoggedIn ? (
        <div
          className="rounded-xl bg-muted/50 p-4 text-center"
          data-ocid="agent_reviews.login_prompt"
        >
          <p className="text-sm text-muted-foreground">
            Log in to rate this agent.
          </p>
        </div>
      ) : alreadyReviewed || submitted ? (
        <div
          className="rounded-xl bg-muted/50 p-4 text-center"
          data-ocid="agent_reviews.already_reviewed"
        >
          <p className="text-sm text-muted-foreground">
            You’ve already reviewed this agent.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border-t border-border pt-5 space-y-4"
          data-ocid="agent_reviews.form"
        >
          <h3 className="font-semibold text-sm">Rate This Agent</h3>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Your rating</p>
            <InteractiveStars value={rating} onChange={setRating} />
          </div>
          <div>
            <Label htmlFor="agent-review-comment" className="text-xs mb-1">
              Your comment
            </Label>
            <Textarea
              id="agent-review-comment"
              placeholder="Share your experience working with this agent…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
              data-ocid="agent_reviews.textarea"
            />
          </div>
          <div>
            <Label htmlFor="agent-review-txn" className="text-xs mb-1">
              Transaction ID (optional)
            </Label>
            <Input
              id="agent-review-txn"
              placeholder="e.g. TXN-20240301-001"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="h-9 text-sm"
              data-ocid="agent_reviews.input"
            />
          </div>
          <Button
            type="submit"
            disabled={submitAgentReview.isPending}
            className="w-full"
            data-ocid="agent_reviews.submit_button"
          >
            {submitAgentReview.isPending ? "Submitting…" : "Submit Review"}
          </Button>
        </form>
      )}
    </div>
  );
}
