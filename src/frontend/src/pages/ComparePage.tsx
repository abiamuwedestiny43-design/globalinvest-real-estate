import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import { BarChart2, ExternalLink, X } from "lucide-react";
import { formatPrice } from "../components/PropertyCard";
import { useCompare } from "../context/CompareContext";
import { usePropertyDetails } from "../hooks/useQueries";

const COMPARE_ROWS: { label: string; key: string }[] = [
  { label: "Price", key: "price" },
  { label: "Property Type", key: "propertyType" },
  { label: "City", key: "city" },
  { label: "Country", key: "country" },
  { label: "Bedrooms", key: "bedrooms" },
  { label: "Bathrooms", key: "bathrooms" },
  { label: "Area", key: "area" },
  { label: "Status", key: "status" },
  { label: "Features", key: "features" },
];

function PropertyColumnHeader({ id }: { id: bigint }) {
  const { data: property, isLoading } = usePropertyDetails(id);
  const { removeFromCompare } = useCompare();
  const imageUrl = property?.images?.[0]?.getDirectURL() ?? null;

  if (isLoading) {
    return (
      <TableHead className="min-w-[200px] align-top p-4">
        <Skeleton className="h-32 w-full rounded-xl mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </TableHead>
    );
  }

  if (!property) return <TableHead className="min-w-[200px]" />;

  return (
    <TableHead className="min-w-[200px] align-top p-4 font-normal">
      <div className="relative mb-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full aspect-[4/3] object-cover rounded-xl"
          />
        ) : (
          <div className="w-full aspect-[4/3] bg-muted rounded-xl flex items-center justify-center">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => removeFromCompare(id)}
          className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm rounded-full p-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label="Remove from compare"
          data-ocid="compare.column.delete_button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="font-display font-semibold text-sm line-clamp-2 mb-1 text-foreground">
        {property.title}
      </p>
      <Link
        to="/property/$id"
        params={{ id: id.toString() }}
        className="text-xs text-primary hover:underline flex items-center gap-1"
        data-ocid="compare.column.link"
      >
        View Listing <ExternalLink className="w-3 h-3" />
      </Link>
    </TableHead>
  );
}

function CellValue({ id, rowKey }: { id: bigint; rowKey: string }) {
  const { data: property } = usePropertyDetails(id);
  if (!property)
    return (
      <TableCell className="text-muted-foreground text-sm p-4">—</TableCell>
    );

  let value: React.ReactNode = "—";

  if (rowKey === "price") {
    value = (
      <span className="font-semibold text-primary">
        {formatPrice(property.price, property.currency, property.currency)}
      </span>
    );
  } else if (rowKey === "propertyType") {
    value = (
      <Badge variant="secondary" className="capitalize text-xs">
        {property.propertyType}
      </Badge>
    );
  } else if (rowKey === "city") {
    value = property.city;
  } else if (rowKey === "country") {
    value = property.country;
  } else if (rowKey === "bedrooms") {
    value = property.bedrooms?.toString() ?? "—";
  } else if (rowKey === "bathrooms") {
    value = property.bathrooms?.toString() ?? "—";
  } else if (rowKey === "area") {
    value = property.area ? `${property.area} m²` : "—";
  } else if (rowKey === "status") {
    value = (
      <Badge
        className={`text-xs capitalize ${
          property.status === "available"
            ? "bg-green-100 text-green-700"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {property.status}
      </Badge>
    );
  } else if (rowKey === "features") {
    value =
      property.features?.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {property.features.slice(0, 4).map((f) => (
            <span
              key={f}
              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
            >
              {f}
            </span>
          ))}
          {property.features.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{property.features.length - 4} more
            </span>
          )}
        </div>
      ) : (
        "—"
      );
  }

  return <TableCell className="text-sm align-top p-4">{value}</TableCell>;
}

export default function ComparePage() {
  const { compareIds, clearCompare } = useCompare();

  if (compareIds.length === 0) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        id="main-content"
        data-ocid="compare.empty_state"
      >
        <BarChart2 className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold mb-3">
          Compare Properties
        </h1>
        <p className="text-muted-foreground mb-6">
          No properties selected. Browse listings and click “Compare” to add
          them here.
        </p>
        <Link to="/browse">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="compare.browse.button"
          >
            Browse Available Properties
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 py-10"
      id="main-content"
      data-ocid="compare.page"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">
            Compare Properties
          </h1>
          <p className="text-muted-foreground text-sm">
            Comparing {compareIds.length} propert
            {compareIds.length === 1 ? "y" : "ies"} side by side
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearCompare}
          data-ocid="compare.clear.button"
        >
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border shadow-card">
        <Table data-ocid="compare.table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px] bg-muted/50 font-semibold">
                Feature
              </TableHead>
              {compareIds.map((id) => (
                <PropertyColumnHeader key={id.toString()} id={id} />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {COMPARE_ROWS.map((row, i) => (
              <TableRow
                key={row.key}
                className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
              >
                <TableCell className="font-medium text-sm text-muted-foreground p-4 align-top w-[140px]">
                  {row.label}
                </TableCell>
                {compareIds.map((id) => (
                  <CellValue key={id.toString()} id={id} rowKey={row.key} />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
