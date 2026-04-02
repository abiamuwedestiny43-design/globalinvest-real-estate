import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  CheckCircle2,
  Home,
  Key,
  ShieldCheck,
  Sofa,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type FilterCriteria, PropertyStatus, PropertyType } from "../backend";
import PropertyCard from "../components/PropertyCard";
import { usePublishedProperties } from "../hooks/useQueries";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "JPY"];
const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];

const LOUNGE_PERKS = [
  {
    icon: <Key className="w-7 h-7" />,
    title: "Flexible Terms",
    description:
      "Month-to-month or long-term leases available. Move in on your schedule, not ours.",
    badge: "New",
  },
  {
    icon: <ShieldCheck className="w-7 h-7" />,
    title: "Verified Landlords",
    description:
      "Every landlord is identity-verified and reviewed by our trust team before listing.",
    badge: null,
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: "Move-in Ready",
    description:
      "Listings marked Move-in Ready have been inspected and are available immediately.",
    badge: "Popular",
  },
];

export default function RentLoungePage() {
  const [city, setCity] = useState("");
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [maxRent, setMaxRent] = useState(20_000);
  const [displayCurrency, setDisplayCurrency] = useState("USD");

  const criteria: FilterCriteria = {
    propertyType: PropertyType.apartment,
    ...(city ? { city } : {}),
    ...(minBedrooms > 0 ? { minBedrooms: BigInt(minBedrooms) } : {}),
    ...(maxRent < 20_000 ? { maxPrice: maxRent } : {}),
  };

  const { data: properties, isLoading } = usePublishedProperties(criteria);

  const visible = (properties ?? []).filter(
    (p) => p.status === PropertyStatus.available,
  );

  function clearFilters() {
    setCity("");
    setMinBedrooms(0);
    setMaxRent(20_000);
  }

  return (
    <div className="min-h-screen bg-lounge-bg">
      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden"
        style={{ minHeight: 340 }}
        data-ocid="rent_lounge.section"
      >
        <img
          src="/assets/generated/rent-lounge-hero.dim_1400x500.jpg"
          alt="Cozy modern apartment lounge"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-lounge-overlay/90 via-lounge-overlay/60 to-transparent" />
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sofa className="w-6 h-6 text-lounge-accent" />
              <span className="text-lounge-accent font-semibold text-sm tracking-widest uppercase">
                Rent Lounge
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Find Your Perfect
              <br />
              <span className="text-lounge-accent">Rental Apartment</span>
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              Discover warm, welcoming apartments curated for people who
              appreciate comfort, community, and a place to truly call home.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden lg:block w-64 shrink-0"
          >
            <div className="bg-lounge-card rounded-2xl border border-lounge-border p-6 sticky top-24 shadow-lounge">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-lounge-accent" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-lounge-muted">
                    Refine
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-lounge-accent hover:underline"
                  data-ocid="rent_lounge.clear_filters.button"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-xs font-medium mb-2 block text-lounge-muted">
                    Display Currency
                  </Label>
                  <Select
                    value={displayCurrency}
                    onValueChange={setDisplayCurrency}
                  >
                    <SelectTrigger
                      className="border-lounge-border"
                      data-ocid="rent_lounge.currency.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-2 block text-lounge-muted">
                    City
                  </Label>
                  <Input
                    placeholder="e.g. Dubai, Paris..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="border-lounge-border bg-white/60"
                    data-ocid="rent_lounge.city.input"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium mb-3 block text-lounge-muted">
                    Min Bedrooms:{" "}
                    <span className="text-lounge-accent font-bold">
                      {minBedrooms}
                    </span>
                  </Label>
                  <Slider
                    min={0}
                    max={6}
                    step={1}
                    value={[minBedrooms]}
                    onValueChange={([v]) => setMinBedrooms(v)}
                    data-ocid="rent_lounge.min_bedrooms.input"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium mb-3 block text-lounge-muted">
                    Max Monthly Rent:{" "}
                    <span className="text-lounge-accent font-bold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: displayCurrency,
                        maximumFractionDigits: 0,
                      }).format(maxRent)}
                    </span>
                  </Label>
                  <Slider
                    min={0}
                    max={20_000}
                    step={100}
                    value={[maxRent]}
                    onValueChange={([v]) => setMaxRent(v)}
                    data-ocid="rent_lounge.max_rent.input"
                  />
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Listings */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-5 flex items-center justify-between"
            >
              <p className="text-lounge-muted text-sm">
                {isLoading
                  ? "Searching cozy apartments…"
                  : `${visible.length} apartment${visible.length !== 1 ? "s" : ""} available`}
              </p>
              <Badge
                variant="outline"
                className="border-lounge-accent text-lounge-accent"
              >
                Apartments Only
              </Badge>
            </motion.div>

            {isLoading ? (
              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                data-ocid="rent_lounge.loading_state"
              >
                {SKELETON_KEYS.map((k) => (
                  <div
                    key={k}
                    className="rounded-xl overflow-hidden border border-lounge-border"
                  >
                    <Skeleton className="h-52 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-5 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-lounge-card rounded-2xl border border-lounge-border"
                data-ocid="rent_lounge.empty_state"
              >
                <p className="text-5xl mb-4">🛋️</p>
                <h3 className="font-serif text-2xl font-semibold mb-2 text-foreground">
                  No apartments found
                </h3>
                <p className="text-lounge-muted text-sm mb-6 max-w-xs mx-auto">
                  Try loosening your filters — your perfect apartment might just
                  be around the corner.
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-lounge-accent text-lounge-accent hover:bg-lounge-accent/10"
                  data-ocid="rent_lounge.clear_filters.button"
                >
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={visible.length}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {visible.map((p, i) => (
                    <motion.div
                      key={p.id.toString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.4 }}
                      data-ocid={`rent_lounge.item.${i + 1}`}
                    >
                      <PropertyCard
                        property={p}
                        displayCurrency={displayCurrency}
                        index={i + 1}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Lounge Perks Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 mb-6"
          data-ocid="rent_lounge.section"
        >
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-lounge-accent" />
              <span className="text-lounge-accent font-semibold text-sm tracking-widest uppercase">
                Why the Lounge?
              </span>
            </div>
            <h2 className="font-serif text-3xl font-bold mb-3">Lounge Perks</h2>
            <p className="text-lounge-muted max-w-lg mx-auto">
              We've built the Rent Lounge with renters in mind — every feature
              is designed to make your next move effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LOUNGE_PERKS.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="bg-lounge-card rounded-2xl border border-lounge-border p-7 shadow-lounge hover:shadow-lounge-hover transition-shadow"
                data-ocid={`rent_lounge.item.${i + 1}`}
              >
                <div className="w-14 h-14 rounded-xl bg-lounge-accent/10 flex items-center justify-center mb-5 text-lounge-accent">
                  {perk.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-serif text-lg font-bold">{perk.title}</h3>
                  {perk.badge && (
                    <Badge className="bg-lounge-accent/20 text-lounge-accent border-0 text-xs">
                      {perk.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-lounge-muted text-sm leading-relaxed">
                  {perk.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
