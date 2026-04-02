import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Crown, MapPin, ShieldCheck, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";

const LEADERBOARD_AGENTS = [
  {
    rank: 1,
    name: "Omar Al-Rashid",
    specialty: "Ultra-Luxury Estates",
    location: "Doha, Qatar",
    rating: 5.0,
    reviews: 47,
    listings: 12,
    sales: 89,
    initials: "OA",
    gradient: "from-amber-400 to-yellow-500",
    rankColor: "text-yellow-400",
    crownColor: "text-yellow-400",
    badge: "bg-yellow-400/15 text-yellow-600 border-yellow-400/30",
  },
  {
    rank: 2,
    name: "James Hartwell",
    specialty: "Investment Properties",
    location: "London, UK",
    rating: 5.0,
    reviews: 63,
    listings: 18,
    sales: 124,
    initials: "JH",
    gradient: "from-slate-400 to-slate-600",
    rankColor: "text-slate-400",
    crownColor: "text-slate-400",
    badge: "bg-slate-400/15 text-slate-600 border-slate-400/30",
  },
  {
    rank: 3,
    name: "Sofia Reyes",
    specialty: "Luxury Residential",
    location: "Dubai, UAE",
    rating: 4.9,
    reviews: 58,
    listings: 24,
    sales: 107,
    initials: "SR",
    gradient: "from-orange-400 to-amber-600",
    rankColor: "text-orange-400",
    crownColor: "text-orange-400",
    badge: "bg-orange-400/15 text-orange-600 border-orange-400/30",
  },
  {
    rank: 4,
    name: "Chen Wei",
    specialty: "Residential & Villas",
    location: "Singapore",
    rating: 4.9,
    reviews: 41,
    listings: 15,
    sales: 78,
    initials: "CW",
    gradient: "from-emerald-500 to-teal-600",
    rankColor: "text-foreground",
    crownColor: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
  },
  {
    rank: 5,
    name: "Priya Mehta",
    specialty: "Commercial Real Estate",
    location: "Mumbai, India",
    rating: 4.8,
    reviews: 52,
    listings: 31,
    sales: 95,
    initials: "PM",
    gradient: "from-orange-500 to-rose-600",
    rankColor: "text-foreground",
    crownColor: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
  },
  {
    rank: 6,
    name: "Maria Fernandez",
    specialty: "Beachfront Properties",
    location: "Marbella, Spain",
    rating: 4.9,
    reviews: 39,
    listings: 22,
    sales: 66,
    initials: "MF",
    gradient: "from-blue-500 to-indigo-600",
    rankColor: "text-foreground",
    crownColor: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3 h-3 ${
            n <= Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/20"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold tabular-nums">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

const RANK_ICONS = [Crown, Trophy, Trophy];

export function TopAgentsLeaderboard() {
  const topThree = LEADERBOARD_AGENTS.slice(0, 3);
  const rest = LEADERBOARD_AGENTS.slice(3);

  return (
    <section
      className="container mx-auto px-4 py-20"
      aria-label="Top agents leaderboard"
    >
      <div className="text-center mb-12">
        <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
          Performance Rankings
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold">
          Top Agents Leaderboard
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Our highest-rated agents, ranked by client reviews and verified sales.
        </p>
        <span className="section-accent-bar" />
      </div>

      {/* Podium — top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {topThree.map((agent, i) => {
          const RankIcon = RANK_ICONS[i];
          return (
            <motion.div
              key={agent.rank}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-card rounded-2xl border shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
                agent.rank === 1
                  ? "border-yellow-400/40 ring-1 ring-yellow-400/20"
                  : "border-border"
              }`}
            >
              {/* rank accent top bar */}
              <div
                className={`h-1 w-full bg-gradient-to-r ${agent.gradient}`}
              />
              <div className="p-6">
                {/* Rank badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <RankIcon
                      className={`w-5 h-5 ${agent.crownColor}`}
                      aria-hidden="true"
                    />
                    <span
                      className={`font-display font-bold text-2xl ${agent.rankColor}`}
                    >
                      #{agent.rank}
                    </span>
                  </div>
                  <Badge
                    className={`flex items-center gap-1 text-xs font-medium border ${agent.badge}`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </Badge>
                </div>

                {/* Avatar */}
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white font-bold text-xl shadow-md mb-4`}
                  aria-hidden="true"
                >
                  {agent.initials}
                </div>

                <h3 className="font-display font-semibold text-xl mb-0.5">
                  {agent.name}
                </h3>
                <p className="text-primary text-xs font-medium uppercase tracking-wide mb-1">
                  {agent.specialty}
                </p>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {agent.location}
                </div>

                <StarRow rating={agent.rating} />
                <p className="text-muted-foreground text-xs mt-0.5 mb-5">
                  {agent.reviews} verified reviews
                </p>

                <div className="grid grid-cols-2 gap-3 py-4 border-y border-border mb-5">
                  <div className="text-center">
                    <p className="font-display font-bold text-lg">
                      {agent.listings}
                    </p>
                    <p className="text-muted-foreground text-xs">Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-lg">
                      {agent.sales}
                    </p>
                    <p className="text-muted-foreground text-xs">Total Sales</p>
                  </div>
                </div>

                <Link to="/agents">
                  <Button
                    size="sm"
                    className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 transition-colors"
                  >
                    View Profile
                  </Button>
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Remaining ranked list */}
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 items-center px-6 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span className="w-8 text-center">#</span>
          <span>Agent</span>
          <span className="hidden sm:block text-right">Rating</span>
          <span className="hidden sm:block text-right">Listings</span>
          <span className="text-right">Sales</span>
        </div>
        {rest.map((agent, i) => (
          <motion.div
            key={agent.rank}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 items-center px-6 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
          >
            <span className="w-8 text-center font-display font-bold text-muted-foreground text-sm">
              {agent.rank}
            </span>
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}
              >
                {agent.initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{agent.name}</p>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{agent.location}</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <StarRow rating={agent.rating} />
              <p className="text-muted-foreground text-xs mt-0.5">
                {agent.reviews} reviews
              </p>
            </div>
            <p className="hidden sm:block text-right font-semibold text-sm">
              {agent.listings}
            </p>
            <p className="text-right font-semibold text-sm">{agent.sales}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/agents">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            Browse All Agents
          </Button>
        </Link>
      </div>
    </section>
  );
}
