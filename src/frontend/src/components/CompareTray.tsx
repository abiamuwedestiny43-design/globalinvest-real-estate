import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";
import { BarChart2, X } from "lucide-react";
import { useCompare } from "../context/CompareContext";
import { usePropertyDetails } from "../hooks/useQueries";

function TrayItem({ id, onRemove }: { id: bigint; onRemove: () => void }) {
  const { data: property } = usePropertyDetails(id);
  const imageUrl = property?.images?.[0]?.getDirectURL() ?? null;

  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 min-w-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="w-10 h-10 object-cover rounded shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded bg-primary/20 shrink-0" />
      )}
      <span className="text-sm font-medium truncate max-w-[100px] sm:max-w-[160px]">
        {property?.title ?? "Loading..."}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Remove from compare"
        data-ocid="compare.tray.delete_button"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function CompareTray() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const canCompare = compareIds.length >= 2;

  if (compareIds.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl compare-tray-enter"
      data-ocid="compare.tray.panel"
    >
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <BarChart2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Compare ({compareIds.length}/3)
          </span>
        </div>

        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          {compareIds.map((id) => (
            <TrayItem
              key={id.toString()}
              id={id}
              onRemove={() => removeFromCompare(id)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompare}
            data-ocid="compare.tray.cancel_button"
          >
            Clear
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size="sm"
                    disabled={!canCompare}
                    onClick={() => navigate({ to: "/compare" })}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-ocid="compare.tray.primary_button"
                  >
                    Compare Now
                  </Button>
                </span>
              </TooltipTrigger>
              {!canCompare && (
                <TooltipContent>Select at least 2 properties</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
