import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  Flame,
  Globe,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PropertyType } from "../backend";
import { CurrencyConverterWidget } from "../components/CurrencyConverterWidget";
import { FeaturedAgents } from "../components/FeaturedAgents";
import { GlobalBusinessLeaders } from "../components/GlobalBusinessLeaders";
import { IndiaBusinessLeaders } from "../components/IndiaBusinessLeaders";
import { MarketInsightsSection } from "../components/MarketInsightsSection";
import { MiddleEastBusinessLeaders } from "../components/MiddleEastBusinessLeaders";
import { NewsMarketUpdatesSection } from "../components/NewsMarketUpdatesSection";
import PropertyCard from "../components/PropertyCard";
import { QatariBusinessLeaders } from "../components/QatariBusinessLeaders";
import { TopAgentsLeaderboard } from "../components/TopAgentsLeaderboard";
import { TopListingsCarousel } from "../components/TopListingsCarousel";
import { usePublishedProperties } from "../hooks/useQueries";

const HERO_IMAGES = [
  {
    src: "/assets/generated/hero-skyline.dim_1920x1080.jpg",
    label: "NYC Skyline Penthouse",
  },
  {
    src: "/assets/generated/hero-villa.dim_1920x1080.jpg",
    label: "Mediterranean Villa",
  },
  {
    src: "/assets/generated/hero-lounge.dim_1920x1080.jpg",
    label: "Luxury Apartment Lounge",
  },
  {
    src: "/assets/generated/hero-house.dim_1920x1080.jpg",
    label: "Premium Residence",
  },
  {
    src: "/assets/generated/property-penthouse-nyc.dim_800x600.jpg",
    label: "NYC Penthouse",
  },
  {
    src: "/assets/generated/property-villa-spain.dim_800x600.jpg",
    label: "Spain Villa",
  },
];

const OIL_IMAGES = [
  {
    src: "/assets/whatsapp_image_2026-04-02_at_03.36.38-019d4b1e-555f-7758-9387-0ded35353ded.jpeg",
    alt: "Offshore oil drilling platform at sea",
  },
  {
    src: "/assets/whatsapp_image_2026-04-02_at_03.36.39-019d4b1e-5210-7599-9524-ace080ee9f99.jpeg",
    alt: "Oil refinery at sunset with glowing towers",
  },
  {
    src: "/assets/whatsapp_image_2026-04-02_at_03.42.33-019d4b1e-503d-739b-a758-d17561207cb1.jpeg",
    alt: "Industrial workers at oil processing facility",
  },
  {
    src: "/assets/whatsapp_image_2026-04-02_at_03.42.33_1-019d4b1e-5453-7447-94cf-9fcfed4373a1.jpeg",
    alt: "Aerial view of oil refinery complex at dusk",
  },
];

const STATIC_PROPERTIES = [
  {
    id: BigInt(1),
    title: "Luxury Penthouse — Manhattan, NYC",
    city: "New York",
    country: "United States",
    price: 4_500_000,
    currency: "USD",
    propertyType: PropertyType.apartment,
    bedrooms: BigInt(3),
    bathrooms: BigInt(2),
    area: 280,
    image: "/assets/generated/property-penthouse-nyc.dim_800x600.jpg",
  },
  {
    id: BigInt(2),
    title: "Mediterranean Villa with Pool",
    city: "Marbella",
    country: "Spain",
    price: 2_800_000,
    currency: "EUR",
    propertyType: PropertyType.house,
    bedrooms: BigInt(5),
    bathrooms: BigInt(4),
    area: 520,
    image: "/assets/generated/property-villa-spain.dim_800x600.jpg",
  },
  {
    id: BigInt(3),
    title: "Dubai Marina Sky Tower",
    city: "Dubai",
    country: "UAE",
    price: 1_950_000,
    currency: "AED",
    propertyType: PropertyType.apartment,
    bedrooms: BigInt(2),
    bathrooms: BigInt(2),
    area: 165,
    image: "/assets/generated/property-apartment-dubai.dim_800x600.jpg",
  },
  {
    id: BigInt(4),
    title: "Canary Wharf Commercial Hub",
    city: "London",
    country: "United Kingdom",
    price: 8_200_000,
    currency: "GBP",
    propertyType: PropertyType.commercial,
    bedrooms: BigInt(0),
    bathrooms: BigInt(0),
    area: 1200,
    image: "/assets/generated/property-commercial-london.dim_800x600.jpg",
  },
  {
    id: BigInt(5),
    title: "Beachfront Paradise Villa",
    city: "Malé",
    country: "Maldives",
    price: 3_600_000,
    currency: "USD",
    propertyType: PropertyType.house,
    bedrooms: BigInt(4),
    bathrooms: BigInt(3),
    area: 380,
    image: "/assets/generated/property-beachfront-maldives.dim_800x600.jpg",
  },
  {
    id: BigInt(6),
    title: "Tokyo Modern Residence",
    city: "Tokyo",
    country: "Japan",
    price: 85_000_000,
    currency: "JPY",
    propertyType: PropertyType.house,
    bedrooms: BigInt(4),
    bathrooms: BigInt(3),
    area: 320,
    image: "/assets/generated/property-house-tokyo.dim_800x600.jpg",
  },
];

const PARTNERS = [
  { name: "Goldman Sachs", initials: "GS" },
  { name: "CBRE Group", initials: "CBRE" },
  { name: "JLL", initials: "JLL" },
  { name: "Knight Frank", initials: "KF" },
  { name: "Savills", initials: "SV" },
  { name: "Colliers", initials: "CO" },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    location: "Singapore",
    quote:
      "Found my dream investment property in Dubai within 2 weeks. The verified agent made the whole process seamless.",
    stars: 5,
  },
  {
    name: "James O'Brien",
    location: "Dublin, Ireland",
    quote:
      "As an agent, GlobalInvest has transformed how I reach international buyers. My listings now get global exposure.",
    stars: 5,
  },
  {
    name: "Priya Sharma",
    location: "Mumbai, India",
    quote:
      "The multi-currency feature is a game changer. I could compare London properties in Indian Rupees instantly.",
    stars: 5,
  },
];

const FEATURES = [
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Access premium properties across 50+ countries. From Dubai penthouses to Maldives villas — all in one platform.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Agents",
    desc: "Every agent undergoes strict identity and license verification. Trade with confidence knowing who you're dealing with.",
  },
  {
    icon: TrendingUp,
    title: "Multi-Currency",
    desc: "View prices in USD, EUR, GBP, AED, or JPY. Real-time currency conversion keeps you informed globally.",
  },
  {
    icon: Flame,
    title: "Oil Trading",
    desc: "Invest in crude oil and energy commodities. Access real-time price charts and trade with investment limits up to $10,000,000.",
  },
];

export default function HomePage() {
  const [searchCity, setSearchCity] = useState("");
  const [searchType, setSearchType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5_000_000]);
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: liveProperties } = usePublishedProperties({});

  const displayProperties =
    liveProperties && liveProperties.length > 0
      ? liveProperties.slice(0, 6)
      : null;

  const suggestions = (() => {
    const seen = new Set<string>();
    const all: string[] = [];
    const addEntry = (value: string) => {
      if (value && !seen.has(value.toLowerCase())) {
        seen.add(value.toLowerCase());
        all.push(value);
      }
    };
    for (const p of STATIC_PROPERTIES) {
      addEntry(p.city);
      addEntry(p.country);
    }
    if (liveProperties) {
      for (const p of liveProperties) {
        addEntry(p.city);
        addEntry(p.country);
      }
    }
    return all;
  })();

  const filteredSuggestions =
    searchCity.trim().length > 0
      ? suggestions
          .filter((s) => s.toLowerCase().includes(searchCity.toLowerCase()))
          .slice(0, 6)
      : [];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function buildSearchParams() {
    const params: Record<string, string> = {};
    if (searchCity.trim()) params.city = searchCity.trim();
    if (searchType && searchType !== "all") params.propertyType = searchType;
    if (priceRange[0] > 0) params.minPrice = priceRange[0].toString();
    if (priceRange[1] < 5_000_000) params.maxPrice = priceRange[1].toString();
    return params;
  }

  function handleSearch() {
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    navigate({ to: "/browse", search: buildSearchParams() });
  }

  function handleSuggestionSelect(value: string) {
    setSearchCity(value);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    navigate({
      to: "/browse",
      search: { ...buildSearchParams(), city: value },
    });
  }

  function formatPriceLabel(val: number): string {
    if (val >= 1_000_000)
      return `$${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}M`;
    if (val >= 1_000) return `$${Math.round(val / 1_000)}K`;
    return `$${val}`;
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i < filteredSuggestions.length - 1 ? i + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i > 0 ? i - 1 : filteredSuggestions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionSelect(filteredSuggestions[highlightedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-[100svh] sm:min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{ touchAction: "pan-y" }}
        aria-label="Hero section"
      >
        <div className="absolute inset-0">
          <AnimatePresence mode="sync">
            <motion.div
              key={heroIndex}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${HERO_IMAGES[heroIndex].src}')`,
              }}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              role="img"
              aria-label={HERO_IMAGES[heroIndex].label}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        {/* Slide dot indicators — raised for mobile browser chrome */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMAGES.map((img, i) => (
            <button
              type="button"
              key={img.label}
              onClick={() => setHeroIndex(i)}
              className={`flex items-center justify-center transition-all duration-300 ${
                heroIndex === i ? "w-8 h-[44px]" : "w-[44px] h-[44px]"
              }`}
              aria-label={`Go to slide: ${img.label}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 pointer-events-none ${
                  heroIndex === i
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4 drop-shadow">
                Global Real Estate Marketplace
              </p>
              <h1 className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-5 leading-[1.05] drop-shadow-lg tracking-tight">
                Find Your Perfect Home,
                <br />
                <span
                  className="font-accent italic"
                  style={{ color: "oklch(0.82 0.16 78)" }}
                >
                  Anywhere in the World
                </span>
              </h1>
              <p className="text-white/80 text-base sm:text-lg max-w-xl mb-8 sm:mb-10 leading-relaxed">
                Browse verified listings across 50+ countries. Multi-currency
                pricing, trusted agents, secure global transactions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl border border-white/20"
            >
              <div ref={searchContainerRef} className="relative flex-1">
                <div className="flex items-center bg-white rounded-xl px-4">
                  <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                  <Input
                    placeholder="City, country or region..."
                    value={searchCity}
                    onChange={(e) => {
                      setSearchCity(e.target.value);
                      setShowSuggestions(true);
                      setHighlightedIndex(-1);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleSearchKeyDown}
                    className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-11 text-base"
                    autoComplete="off"
                    data-ocid="hero.search_input"
                  />
                </div>
                <AnimatePresence>
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                      aria-label="Location suggestions"
                    >
                      {filteredSuggestions.map((suggestion, idx) => (
                        <button
                          key={suggestion}
                          type="button"
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSuggestionSelect(suggestion);
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-3 cursor-pointer text-sm transition-colors text-left min-h-[44px] ${
                            highlightedIndex === idx
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <MapPin
                            className={`w-3.5 h-3.5 shrink-0 ${
                              highlightedIndex === idx
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger
                  className="w-full sm:w-44 bg-white rounded-xl border-0 text-foreground h-12"
                  data-ocid="hero.type.select"
                >
                  <SelectValue placeholder="Property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 h-12 rounded-xl font-medium"
                data-ocid="hero.search.button"
              >
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="max-w-2xl mt-2"
            >
              <button
                type="button"
                onClick={() => setShowPriceSlider((v) => !v)}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors pl-1 min-h-[44px]"
                data-ocid="hero.price_range.toggle"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${showPriceSlider ? "rotate-180" : ""}`}
                />
                Price Range
                {(priceRange[0] > 0 || priceRange[1] < 5_000_000) && (
                  <span className="ml-1 bg-primary/80 text-white text-xs px-2 py-0.5 rounded-full">
                    {formatPriceLabel(priceRange[0])} –{" "}
                    {formatPriceLabel(priceRange[1])}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showPriceSlider && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 sm:px-5 py-4 mt-2 border border-white/20">
                      <div className="flex justify-between text-white/80 text-xs font-medium mb-3">
                        <span>{formatPriceLabel(priceRange[0])}</span>
                        <span className="text-white font-semibold">
                          {formatPriceLabel(priceRange[0])} –{" "}
                          {formatPriceLabel(priceRange[1])}
                        </span>
                        <span>{formatPriceLabel(priceRange[1])}</span>
                      </div>
                      <Slider
                        min={0}
                        max={5_000_000}
                        step={50_000}
                        value={priceRange}
                        onValueChange={(val) => setPriceRange(val)}
                        className="[&_.thumb]:border-white [&_.thumb]:bg-primary"
                        data-ocid="hero.price_range.slider"
                      />
                      <div className="flex justify-between text-white/40 text-xs mt-2">
                        <span>$0</span>
                        <span>$5M</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8"
            >
              {[
                { value: "50+", label: "Countries" },
                { value: "12,000+", label: "Listings" },
                { value: "5", label: "Currencies" },
                { value: "100%", label: "Verified Agents" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center px-3 sm:px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 min-w-[60px] sm:min-w-[72px]"
                >
                  <span className="font-display font-bold text-white text-base sm:text-lg leading-tight">
                    {stat.value}
                  </span>
                  <span className="text-white/55 text-xs mt-0.5">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section
        className="container mx-auto px-4 sm:px-6 py-16 sm:py-20"
        aria-label="Featured properties"
      >
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
              Hand-Picked
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              Featured Properties
            </h2>
          </div>
          <Link to="/browse">
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10"
              data-ocid="featured.browse_all.button"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProperties
            ? displayProperties.map((p, i) => (
                <PropertyCard
                  key={p.id.toString()}
                  property={p}
                  index={i + 1}
                />
              ))
            : STATIC_PROPERTIES.map((p, i) => (
                <Link
                  key={p.id.toString()}
                  to="/browse"
                  data-ocid={`property.item.${i + 1}`}
                  className="group block"
                >
                  <article className="bg-card rounded-xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:ring-2 hover:ring-primary/30">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={p.image}
                        alt={`${p.title} — ${p.city}, ${p.country}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute bottom-3 left-3">
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground shadow-sm">
                          <ShieldCheck className="w-3 h-3" /> Verified Agent
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/50 text-white capitalize">
                          {p.propertyType}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {p.city}, {p.country}
                      </p>
                      <div className="pt-3 border-t border-border">
                        <span className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: p.currency,
                            maximumFractionDigits: 0,
                          }).format(p.price)}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
        </div>
      </section>

      {/* Featured Agents */}
      <FeaturedAgents />

      {/* Top Listings Carousel */}
      <TopListingsCarousel />

      {/* Top Agents Leaderboard */}
      <TopAgentsLeaderboard />

      {/* Market Insights */}
      <MarketInsightsSection />

      {/* Currency Converter */}
      <CurrencyConverterWidget />

      {/* News & Market Updates */}
      <NewsMarketUpdatesSection />

      {/* Why GlobalInvest */}
      <section
        className="bg-muted py-16 sm:py-20"
        aria-label="Why GlobalInvest"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              Why Choose Us
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
              The GlobalInvest Advantage
            </h2>
            <span className="section-accent-bar" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-2xl p-6 sm:p-8 border border-border text-center shadow-card hover:shadow-card-hover transition-all duration-300 hover:border-primary/25 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <feat.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Oil Trade Investment */}
      <section
        className="py-16 sm:py-20 bg-slate-950"
        aria-label="Oil Trade Investment"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
            {/* Image Grid — 60% */}
            <motion.div
              className="w-full lg:w-[60%] grid grid-cols-2 gap-2 lg:gap-3"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {OIL_IMAGES.map((img, i) => (
                <div
                  key={img.alt}
                  className="relative overflow-hidden rounded-xl aspect-[4/3] group"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-orange-500/90 text-white">
                      Offshore Drilling
                    </span>
                  )}
                  {i === 1 && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-orange-500/90 text-white">
                      Refinery Operations
                    </span>
                  )}
                  {i === 2 && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-orange-500/90 text-white">
                      Field Workers
                    </span>
                  )}
                  {i === 3 && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-orange-500/90 text-white">
                      Aerial View
                    </span>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Text Content — 40% */}
            <motion.div
              className="w-full lg:w-[40%]"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 sm:p-8 backdrop-blur-sm">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 mb-5">
                  <Flame className="w-3.5 h-3.5" />
                  Commodities Trading
                </span>

                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  Oil Trade Investment
                </h2>

                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
                  Invest in the world's most traded commodity. Access crude oil
                  and energy markets with transparent pricing, real-time data,
                  and investment limits up to $10,000,000.
                </p>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {[
                    {
                      icon: Flame,
                      label: "Crude Oil & Energy Markets",
                      color: "text-orange-400",
                      bg: "bg-orange-500/10",
                    },
                    {
                      icon: TrendingUp,
                      label: "Live Price Charts & Buy/Sell",
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      icon: ShieldCheck,
                      label: "Investment Limits up to $10,000,000",
                      color: "text-sky-400",
                      bg: "bg-sky-500/10",
                    },
                    {
                      icon: Globe,
                      label: "Multi-Asset Portfolio",
                      color: "text-violet-400",
                      bg: "bg-violet-500/10",
                    },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </span>
                      <span className="text-slate-300 text-sm font-medium">
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/trading">
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-base transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25"
                    data-ocid="oil.explore.primary_button"
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    Explore Oil Investments
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="container mx-auto px-4 sm:px-6 py-16 sm:py-20"
        aria-label="Testimonials"
      >
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            Success Stories
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
            Trusted by Investors Worldwide
          </h2>
          <span className="section-accent-bar" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-2xl p-6 sm:p-7 border border-border shadow-card hover:shadow-card-hover transition-shadow duration-300 hover:border-primary/20"
            >
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <GlobalBusinessLeaders />
      <IndiaBusinessLeaders />
      <MiddleEastBusinessLeaders />
      <QatariBusinessLeaders />

      {/* Partners */}
      <section
        className="bg-secondary py-12 sm:py-14"
        aria-label="Partner firms"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-secondary-foreground/50 text-xs uppercase tracking-widest mb-8">
            Trusted by Leading Real Estate Firms
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 items-center">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="w-24 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-default"
              >
                <span className="text-secondary-foreground font-bold text-sm">
                  {p.initials}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="container mx-auto px-4 sm:px-6 py-16 sm:py-20"
        aria-label="Call to action"
      >
        <div className="rounded-3xl overflow-hidden relative bg-secondary">
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('/assets/generated/hero-skyline.dim_1920x1080.jpg')",
            }}
          />
          <div className="relative z-10 p-8 sm:p-12 md:p-20 text-center">
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 text-secondary-foreground">
              Ready to List Your Property?
            </h2>
            <p className="text-secondary-foreground/70 mb-8 sm:mb-10 max-w-md mx-auto text-base sm:text-lg">
              Join thousands of verified agents on the world's leading global
              real estate platform.
            </p>
            <Link to="/onboarding">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-3 rounded-full text-base"
                data-ocid="cta.join_agent.button"
              >
                Become an Agent <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
