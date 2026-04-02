import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, BookmarkCheck, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PropertyStatus, type PropertyType } from "../backend";
import type { FilterCriteria } from "../backend";
import PropertyCard from "../components/PropertyCard";
import PropertyFilters from "../components/PropertyFilters";
import { usePublishedProperties } from "../hooks/useQueries";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];
const SAVED_SEARCHES_KEY = "globalinvest_saved_searches";

interface SavedSearch {
  id: string;
  name: string;
  city: string;
  propertyType: string;
  maxPrice: number;
  minBedrooms: number;
  savedAt: string;
}

function loadSavedSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(SAVED_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function BrowsePage() {
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [maxPrice, setMaxPrice] = useState(10_000_000);
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [displayCurrency, setDisplayCurrency] = useState("USD");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchSaved, setSearchSaved] = useState(false);
  const [approvalFilter, setApprovalFilter] = useState<
    "all" | "featured" | "new"
  >("all");

  const criteria: FilterCriteria = {
    ...(city ? { city } : {}),
    ...(propertyType?.trim()
      ? { propertyType: propertyType as PropertyType }
      : {}),
    ...(maxPrice < 10_000_000 ? { maxPrice } : {}),
    ...(minBedrooms > 0 ? { minBedrooms: BigInt(minBedrooms) } : {}),
  };

  const { data: properties, isLoading } = usePublishedProperties(criteria);

  const sorted = [...(properties ?? [])].sort((a, b) => {
    if ((a as any).featured && !(b as any).featured) return -1;
    if (!(a as any).featured && (b as any).featured) return 1;
    return 0;
  });

  const visible = sorted.filter((p) => {
    if (p.status !== PropertyStatus.available) return false;
    if (
      searchInput &&
      !p.title.toLowerCase().includes(searchInput.toLowerCase()) &&
      !p.city.toLowerCase().includes(searchInput.toLowerCase()) &&
      !p.country.toLowerCase().includes(searchInput.toLowerCase())
    ) {
      return false;
    }
    if (approvalFilter === "featured") {
      return (p as any).featured === true || (p as any).isPromoted === true;
    }
    if (approvalFilter === "new") {
      return (p as any).featured !== true && (p as any).isPromoted !== true;
    }
    return true;
  });

  const hasActiveFilters =
    !!city ||
    !!propertyType ||
    maxPrice < 10_000_000 ||
    minBedrooms > 0 ||
    !!searchInput ||
    approvalFilter !== "all";

  function clearFilters() {
    setCity("");
    setPropertyType("");
    setMaxPrice(10_000_000);
    setMinBedrooms(0);
    setSearchInput("");
    setSearchSaved(false);
    setApprovalFilter("all");
  }

  function saveCurrentSearch() {
    const parts: string[] = [];
    if (city) parts.push(city);
    if (propertyType) parts.push(propertyType.toLowerCase());
    if (maxPrice < 10_000_000) parts.push(`<$${(maxPrice / 1000).toFixed(0)}k`);
    if (minBedrooms > 0) parts.push(`${minBedrooms}+ beds`);
    const name =
      parts.length > 0
        ? parts.join(" · ")
        : `Search ${new Date().toLocaleDateString()}`;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      city,
      propertyType: propertyType as string,
      maxPrice,
      minBedrooms,
      savedAt: new Date().toISOString(),
    };

    const existing = loadSavedSearches();
    localStorage.setItem(
      SAVED_SEARCHES_KEY,
      JSON.stringify([newSearch, ...existing]),
    );
    setSearchSaved(true);
    toast.success("Search saved! Find it in your Buyer Dashboard.");
  }

  const filtersProps = {
    city,
    setCity,
    propertyType: propertyType as PropertyType | "",
    setPropertyType,
    maxPrice,
    setMaxPrice,
    minBedrooms,
    setMinBedrooms,
    displayCurrency,
    setDisplayCurrency,
    onClear: clearFilters,
    approvalFilter,
    setApprovalFilter,
  };

  const approvalFilterLabel: Record<string, string> = {
    featured: "Featured / Promoted",
    new: "New Listings",
  };

  return (
    <div id="main-content">
      {/* Page header */}
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
                Available Properties
              </h1>
              <p className="text-muted-foreground text-sm">
                {isLoading
                  ? "Loading..."
                  : `${visible.length} properties available worldwide`}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant={searchSaved ? "outline" : "default"}
                size="sm"
                onClick={saveCurrentSearch}
                disabled={searchSaved}
                className={
                  searchSaved
                    ? "text-teal-700 border-teal-300 bg-teal-50"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }
                data-ocid="browse.save_search.button"
              >
                {searchSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-1.5" /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-1.5" /> Save Search
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Top filter bar on desktop */}
        <div className="hidden lg:flex items-center gap-4 mb-8 p-4 bg-card rounded-xl border border-border shadow-xs">
          <div className="flex items-center flex-1 gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-muted-foreground">
              Filters:
            </span>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Search by city or country..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSearchSaved(false);
              }}
              className="h-9"
              data-ocid="browse.search.input"
            />
          </div>
          <PropertyFilters {...filtersProps} />
          {/* Active filter chips */}
          {approvalFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
              {approvalFilterLabel[approvalFilter]}
              <button
                type="button"
                onClick={() => setApprovalFilter("all")}
                className="ml-0.5 hover:text-primary/70"
                aria-label="Remove listing status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground shrink-0"
              data-ocid="browse.clear_filters.button"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters on tablet */}
          <aside className="hidden md:block lg:hidden w-56 shrink-0">
            <div className="bg-card rounded-xl border border-border p-5 sticky top-24">
              <PropertyFilters {...filtersProps} />
            </div>
          </aside>

          {/* Mobile filter toggle */}
          <div className="md:hidden w-full mb-4 flex items-center justify-between">
            <div className="flex-1 mr-3">
              <Input
                placeholder="Search properties..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchSaved(false);
                }}
                className="h-9"
                data-ocid="browse.search.input"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-ocid="browse.filters.toggle"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
            </Button>
          </div>

          {/* Mobile filter overlay */}
          {sidebarOpen && (
            <dialog
              open
              className="fixed inset-0 z-50 bg-transparent p-0 w-full h-full max-w-none max-h-none"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/50 w-full h-full border-0 cursor-default"
                onClick={() => setSidebarOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
                aria-label="Close filters"
              />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-card p-5 overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    data-ocid="browse.filters.close"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <PropertyFilters {...filtersProps} />
              </div>
            </dialog>
          )}

          {/* Listing grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                data-ocid="browse.loading_state"
              >
                {SKELETON_KEYS.map((k) => (
                  <div
                    key={k}
                    className="rounded-xl overflow-hidden border border-border"
                  >
                    <Skeleton className="aspect-[16/9] w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-5 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-24" data-ocid="browse.empty_state">
                <p className="text-5xl mb-4">🏠</p>
                <h3 className="font-display text-xl font-semibold mb-2">
                  No properties found
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Try adjusting your filters or clearing them to see more
                  results.
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  data-ocid="browse.no_results.clear.button"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {visible.map((p, i) => (
                  <PropertyCard
                    key={p.id.toString()}
                    property={p}
                    displayCurrency={displayCurrency}
                    index={i + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
