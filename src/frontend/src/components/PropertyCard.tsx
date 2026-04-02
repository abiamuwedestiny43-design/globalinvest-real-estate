import { Link } from "@tanstack/react-router";
import {
  Bath,
  Bed,
  GitCompareArrows,
  MapPin,
  Maximize2,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { Property } from "../backend";
import { PropertyStatus } from "../backend";
import { useCompare } from "../context/CompareContext";
import { usePropertyAverageRating } from "../hooks/useQueries";

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  JPY: 149,
};

interface PropertyCardProps {
  property: Property;
  displayCurrency?: string;
  index?: number;
}

export function PropertyRatingBadge({ propertyId }: { propertyId: bigint }) {
  const { data: avg } = usePropertyAverageRating(propertyId);
  if (!avg || avg === 0) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      <span>{avg.toFixed(1)}</span>
    </span>
  );
}

export function formatPrice(
  price: number,
  fromCurrency: string,
  toCurrency: string,
): string {
  const rate =
    (EXCHANGE_RATES[toCurrency] ?? 1) / (EXCHANGE_RATES[fromCurrency] ?? 1);
  const converted = price * rate;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: toCurrency,
    maximumFractionDigits: 0,
  }).format(converted);
}

const STATUS_STYLES: Record<PropertyStatus, string> = {
  [PropertyStatus.available]:
    "bg-emerald-500/20 text-emerald-600 ring-1 ring-emerald-500/30",
  [PropertyStatus.sold]: "bg-red-500/15 text-red-600 ring-1 ring-red-500/25",
  [PropertyStatus.draft]:
    "bg-amber-400/20 text-amber-700 ring-1 ring-amber-400/30",
};

export default function PropertyCard({
  property,
  displayCurrency = "USD",
  index = 1,
}: PropertyCardProps) {
  const imageUrl =
    property.images.length > 0 ? property.images[0].getDirectURL() : null;
  const { addToCompare, removeFromCompare, isInCompare, compareIds } =
    useCompare();
  const inCompare = isInCompare(property.id);
  const compareDisabled = !inCompare && compareIds.length >= 3;

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(property.id);
    } else if (!compareDisabled) {
      addToCompare(property.id);
    }
  }

  return (
    <Link
      to="/property/$id"
      params={{ id: property.id.toString() }}
      data-ocid={`property.item.${index}`}
      className="group block"
    >
      <article className="bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.015] hover:border-primary/30">
        {/* 16:9 image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${property.title} \u2014 ${property.city}, ${property.country}`}
              className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}

          {/* Featured badge */}
          {(property as any).featured && (
            <div className="absolute top-3 left-3 z-10">
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-900 shadow-sm">
                <Star className="w-3 h-3 fill-amber-900" />
                Featured
              </span>
            </div>
          )}

          {/* Status badge */}
          <div
            className={
              (property as any).featured
                ? "absolute top-10 left-3 mt-1"
                : "absolute top-3 left-3"
            }
          >
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${STATUS_STYLES[property.status]}`}
            >
              {property.status.charAt(0).toUpperCase() +
                property.status.slice(1)}
            </span>
          </div>

          {/* Property type badge */}
          <div className="absolute top-3 right-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-sm text-white/95 capitalize">
              {property.propertyType}
            </span>
          </div>

          {/* Verified Agent badge */}
          <div className="absolute bottom-3 left-3">
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="w-3 h-3" />
              Verified Agent
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display font-semibold text-base line-clamp-1 mb-1 group-hover:text-primary transition-colors duration-200">
            {property.title}
          </h3>

          <p className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">
              {property.city}, {property.country}
            </span>
          </p>

          {(Number(property.bedrooms) > 0 ||
            Number(property.bathrooms) > 0 ||
            property.area > 0) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              {Number(property.bedrooms) > 0 && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-primary/60" />
                  {property.bedrooms.toString()}
                </span>
              )}
              {Number(property.bathrooms) > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-primary/60" />
                  {property.bathrooms.toString()}
                </span>
              )}
              {property.area > 0 && (
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-primary/60" />
                  {property.area} m\u00b2
                </span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
            <div>
              <div className="font-display font-bold text-xl text-primary leading-tight">
                {formatPrice(
                  property.price,
                  property.currency,
                  displayCurrency,
                )}
              </div>
              <PropertyRatingBadge propertyId={property.id} />
            </div>
            <button
              type="button"
              onClick={handleCompare}
              disabled={compareDisabled}
              aria-label={inCompare ? "Remove from compare" : "Add to compare"}
              data-ocid={`property.compare.toggle.${index}`}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                inCompare
                  ? "bg-primary text-primary-foreground border-primary"
                  : compareDisabled
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              {inCompare ? "Added" : "Compare"}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
