import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { PropertyType } from "../backend";

import { CURRENCY_LIST, currencyLabel } from "../lib/currencies";
const CURRENCIES = CURRENCY_LIST;

interface PropertyFiltersProps {
  city: string;
  setCity: (v: string) => void;
  propertyType: PropertyType | "";
  setPropertyType: (v: PropertyType | "") => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  minBedrooms: number;
  setMinBedrooms: (v: number) => void;
  displayCurrency: string;
  setDisplayCurrency: (v: string) => void;
  onClear: () => void;
  approvalFilter: "all" | "featured" | "new";
  setApprovalFilter: (v: "all" | "featured" | "new") => void;
}

export default function PropertyFilters({
  city,
  setCity,
  propertyType,
  setPropertyType,
  maxPrice,
  setMaxPrice,
  minBedrooms,
  setMinBedrooms,
  displayCurrency,
  setDisplayCurrency,
  onClear,
  approvalFilter,
  setApprovalFilter,
}: PropertyFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Filters
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-accent hover:underline"
          data-ocid="browse.clear_filters.button"
        >
          Clear All
        </button>
      </div>

      <div>
        <Label className="text-xs font-medium mb-2 block">
          Display Currency
        </Label>
        <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
          <SelectTrigger data-ocid="browse.currency.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                {currencyLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-medium mb-2 block">City</Label>
        <Input
          placeholder="e.g. Dubai, London..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          data-ocid="browse.city.input"
        />
      </div>

      <div>
        <Label className="text-xs font-medium mb-2 block">Property Type</Label>
        <Select
          value={propertyType || "all"}
          onValueChange={(v) =>
            setPropertyType(v === "all" ? "" : (v as PropertyType))
          }
        >
          <SelectTrigger data-ocid="browse.type.select">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={PropertyType.house}>House</SelectItem>
            <SelectItem value={PropertyType.apartment}>Apartment</SelectItem>
            <SelectItem value={PropertyType.commercial}>Commercial</SelectItem>
            <SelectItem value={PropertyType.land}>Land</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-medium mb-2 block">
          Max Price:{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: displayCurrency,
            maximumFractionDigits: 0,
          }).format(maxPrice)}
        </Label>
        <Slider
          min={0}
          max={10_000_000}
          step={50_000}
          value={[maxPrice]}
          onValueChange={([v]) => setMaxPrice(v)}
          data-ocid="browse.max_price.input"
        />
      </div>

      <div>
        <Label className="text-xs font-medium mb-2 block">
          Min Bedrooms: {minBedrooms}
        </Label>
        <Slider
          min={0}
          max={10}
          step={1}
          value={[minBedrooms]}
          onValueChange={([v]) => setMinBedrooms(v)}
          data-ocid="browse.min_bedrooms.input"
        />
      </div>

      <div>
        <Label className="text-xs font-medium mb-2 block">Listing Status</Label>
        <Select
          value={approvalFilter}
          onValueChange={(v) =>
            setApprovalFilter(v as "all" | "featured" | "new")
          }
        >
          <SelectTrigger data-ocid="browse.listing_status.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="featured">Featured / Promoted</SelectItem>
            <SelectItem value="new">New Listings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={onClear}
        data-ocid="browse.filters.clear.button"
      >
        Clear Filters
      </Button>
    </div>
  );
}
