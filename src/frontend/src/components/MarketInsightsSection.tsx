import {
  BarChart2,
  Building2,
  DollarSign,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

const CITY_PRICES = [
  { city: "New York City", price: 4.5, label: "$4.5M" },
  { city: "London", price: 3.8, label: "$3.8M" },
  { city: "Singapore", price: 2.8, label: "$2.8M" },
  { city: "Dubai", price: 2.1, label: "$2.1M" },
  { city: "Tokyo", price: 1.9, label: "$1.9M" },
  { city: "Marbella", price: 1.6, label: "$1.6M" },
];

const MAX_PRICE = 5.0;

export function MarketInsightsSection() {
  const { actor } = useActor();
  const [liveStats, setLiveStats] = useState<{
    totalListings: number;
    totalAgents: number;
    totalBuyers: number;
  } | null>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getPublicMarketStats()
      .then((s) => {
        setLiveStats({
          totalListings: Number(s.totalListings),
          totalAgents: Number(s.totalAgents),
          totalBuyers: Number(s.totalBuyers),
        });
      })
      .catch(() => {});
  }, [actor]);

  const STATS = [
    {
      icon: DollarSign,
      label: "Avg Property Price",
      value: "$2.4M",
      sub: "Global average",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      icon: TrendingUp,
      label: "Properties Sold This Month",
      value: "348",
      sub: "+12% vs last month",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: Building2,
      label: "Total Active Listings",
      value: liveStats ? liveStats.totalListings.toLocaleString() : "...",
      sub: liveStats
        ? `Across ${liveStats.totalAgents} verified agents`
        : "Loading...",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Users,
      label: "Registered Buyers",
      value: liveStats ? liveStats.totalBuyers.toLocaleString() : "...",
      sub: "On the platform",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      icon: MapPin,
      label: "Top City",
      value: "Dubai",
      sub: "Highest transaction volume",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: BarChart2,
      label: "Price Growth YoY",
      value: "+14.2%",
      sub: "Global luxury segment",
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <section className="bg-muted py-20" aria-label="Market Insights">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            Analytics
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Market Insights
          </h2>
          <p className="text-muted-foreground mt-3 text-base max-w-xl mx-auto">
            Real-time market analytics across global real estate markets
          </p>
          <span className="section-accent-bar" />
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/25 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    {stat.label}
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.sub}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Price Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-card"
        >
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Price Trends by City
          </h3>
          <p className="text-sm text-muted-foreground mb-8">
            Average residential property prices in top global markets (USD)
          </p>
          <div className="space-y-5">
            {CITY_PRICES.map((item, i) => (
              <motion.div
                key={item.city}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.3 + i * 0.07 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm font-medium text-foreground w-28 shrink-0">
                  {item.city}
                </span>
                <div className="flex-1 relative h-8 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${(item.price / MAX_PRICE) * 100}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.75,
                      delay: 0.4 + i * 0.07,
                      ease: "easeOut",
                    }}
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-[oklch(0.62_0.14_195)]"
                  />
                </div>
                <span className="text-sm font-bold text-primary w-16 text-right shrink-0">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
