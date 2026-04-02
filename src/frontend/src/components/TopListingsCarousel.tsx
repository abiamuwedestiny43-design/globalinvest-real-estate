import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import { PropertyType } from "../backend";

const STATIC_PROPERTIES = [
  {
    id: BigInt(1),
    title: "Luxury Penthouse — Manhattan, NYC",
    city: "New York",
    country: "United States",
    price: 4_500_000,
    currency: "USD",
    propertyType: PropertyType.apartment,
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
    image: "/assets/generated/property-house-tokyo.dim_800x600.jpg",
  },
];

export function TopListingsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="py-20 bg-muted/40" aria-label="Top listings carousel">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
              Handpicked Premium Properties
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Top Listings
            </h2>
          </div>
          {/* Arrow controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              aria-label="Scroll left"
              data-ocid="top_listings.pagination_prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="rounded-full border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              aria-label="Scroll right"
              data-ocid="top_listings.pagination_next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable card strip */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {STATIC_PROPERTIES.map((p, i) => (
            <motion.div
              key={p.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="snap-start shrink-0 w-[300px] sm:w-[340px]"
              data-ocid={`top_listings.item.${i + 1}`}
            >
              <article className="group bg-card rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:ring-2 hover:ring-primary/30 transition-all duration-300">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={p.image}
                    alt={`${p.title} — ${p.city}, ${p.country}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/55 text-white capitalize backdrop-blur-sm">
                      {String(p.propertyType)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="font-display font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {p.city}, {p.country}
                  </p>
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: p.currency,
                        maximumFractionDigits: 0,
                      }).format(p.price)}
                    </span>
                    <Link to="/browse">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                        data-ocid={`top_listings.view_details.button.${i + 1}`}
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
