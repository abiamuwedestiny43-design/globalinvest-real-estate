import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, ShieldCheck, Star } from "lucide-react";
import { motion } from "motion/react";

const FEATURED_AGENTS = [
  {
    id: 1,
    name: "Sofia Reyes",
    specialty: "Luxury Residential",
    location: "Dubai, UAE",
    listings: 24,
    rating: 4.9,
    initials: "SR",
    gradient: "from-teal-500 to-cyan-600",
    images: [
      "/assets/generated/prop-sofia-1.dim_600x400.jpg",
      "/assets/generated/prop-sofia-2.dim_600x400.jpg",
    ] as [string, string],
  },
  {
    id: 2,
    name: "James Hartwell",
    specialty: "Investment Properties",
    location: "London, UK",
    listings: 18,
    rating: 5.0,
    initials: "JH",
    gradient: "from-slate-600 to-slate-800",
    images: [
      "/assets/generated/prop-james-1.dim_600x400.jpg",
      "/assets/generated/prop-james-2.dim_600x400.jpg",
    ] as [string, string],
  },
  {
    id: 3,
    name: "Priya Mehta",
    specialty: "Commercial Real Estate",
    location: "Mumbai, India",
    listings: 31,
    rating: 4.8,
    initials: "PM",
    gradient: "from-orange-500 to-rose-600",
    images: [
      "/assets/generated/prop-priya-1.dim_600x400.jpg",
      "/assets/generated/prop-priya-2.dim_600x400.jpg",
    ] as [string, string],
  },
  {
    id: 4,
    name: "Chen Wei",
    specialty: "Residential & Villas",
    location: "Singapore",
    listings: 15,
    rating: 4.9,
    initials: "CW",
    gradient: "from-emerald-500 to-teal-700",
    images: [
      "/assets/generated/prop-chen-1.dim_600x400.jpg",
      "/assets/generated/prop-chen-2.dim_600x400.jpg",
    ] as [string, string],
  },
  {
    id: 5,
    name: "Omar Al-Rashid",
    specialty: "Ultra-Luxury Estates",
    location: "Doha, Qatar",
    listings: 12,
    rating: 5.0,
    initials: "OA",
    gradient: "from-amber-500 to-yellow-600",
    images: [
      "/assets/generated/prop-omar-1.dim_600x400.jpg",
      "/assets/generated/prop-omar-2.dim_600x400.jpg",
    ] as [string, string],
  },
  {
    id: 6,
    name: "Maria Fernandez",
    specialty: "Beachfront Properties",
    location: "Marbella, Spain",
    listings: 22,
    rating: 4.9,
    initials: "MF",
    gradient: "from-blue-500 to-indigo-700",
    images: [
      "/assets/generated/prop-maria-1.dim_600x400.jpg",
      "/assets/generated/prop-maria-2.dim_600x400.jpg",
    ] as [string, string],
  },
];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${
            n <= full
              ? "text-yellow-400 fill-yellow-400"
              : n === full + 1 && hasHalf
                ? "text-yellow-400 fill-yellow-200"
                : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-foreground tabular-nums">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function FeaturedAgents() {
  return (
    <section
      className="relative py-20 overflow-hidden"
      aria-label="Featured agents"
      style={{
        backgroundImage: `url('/assets/generated/prop-featured-hero.dim_1200x500.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 pointer-events-none" />

      <div className="relative container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-teal-300 text-xs font-semibold tracking-widest uppercase mb-3">
            Top Performers
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Featured Agents
          </h2>
          <p className="text-white/70 text-base max-w-lg mx-auto">
            Work with our top-rated, globally verified agents
          </p>
          <span className="section-accent-bar" />
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_AGENTS.map((agent, i) => (
            <motion.article
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              data-ocid={`featured_agents.item.${i + 1}`}
              className="group bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:ring-2 hover:ring-primary/30 transition-all duration-300 overflow-hidden"
            >
              {/* Property image strip */}
              <div className="relative grid grid-cols-2 h-[140px] overflow-hidden">
                <img
                  src={agent.images[0]}
                  alt={`${agent.name} listing 1`}
                  className="w-full h-full object-cover"
                />
                <div className="relative">
                  <img
                    src={agent.images[1]}
                    alt={`${agent.name} listing 2`}
                    className="w-full h-full object-cover"
                  />
                  {/* Sample Listings badge */}
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Sample Listings
                  </span>
                </div>
                {/* Gradient bottom fade into card */}
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
              </div>

              <div className="p-6">
                {/* Avatar + badge row */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                    aria-hidden="true"
                  >
                    {agent.initials}
                  </div>
                  <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 text-xs font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Agent
                  </Badge>
                </div>

                {/* Name & specialty */}
                <h3 className="font-display font-semibold text-lg text-foreground mb-0.5 group-hover:text-primary transition-colors">
                  {agent.name}
                </h3>
                <p className="text-primary text-xs font-medium uppercase tracking-wide mb-2">
                  {agent.specialty}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {agent.location}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between py-3 border-y border-border mb-4">
                  <div className="text-center">
                    <p className="font-display font-bold text-lg text-foreground">
                      {agent.listings}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Active Listings
                    </p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <StarRating rating={agent.rating} />
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Rating
                    </p>
                  </div>
                </div>

                {/* CTA — now links to /agents */}
                <Link to="/agents">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    data-ocid={`featured_agents.view_listings.button.${i + 1}`}
                  >
                    View Listings <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Footer link — stays on /browse */}
        <div className="text-center mt-10">
          <Link to="/browse">
            <Button
              variant="ghost"
              className="text-white hover:text-white/80 font-medium"
              data-ocid="featured_agents.browse_all.button"
            >
              Browse All Available Properties{" "}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
