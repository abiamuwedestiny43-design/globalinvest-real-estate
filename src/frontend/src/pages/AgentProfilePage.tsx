import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  CheckCircle2,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AgentProfile, Property } from "../backend";
import { PropertyStatus } from "../backend";
import AgentReviewsSection from "../components/AgentReviewsSection";
import { useActor } from "../hooks/useActor";

const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-blue-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-emerald-600",
  "bg-cyan-600",
  "bg-indigo-600",
];

const MOCK_TRANSACTIONS = [
  {
    property: "Luxury Penthouse Dubai",
    buyer: "J.A.",
    price: 2_100_000,
    date: "Mar 2026",
    status: "Completed",
  },
  {
    property: "Marina Bay Apartment",
    buyer: "S.C.",
    price: 890_000,
    date: "Feb 2026",
    status: "Completed",
  },
  {
    property: "Commercial Office London",
    buyer: "M.F.",
    price: 4_200_000,
    date: "Jan 2026",
    status: "Completed",
  },
  {
    property: "Beachfront Villa Marbella",
    buyer: "R.K.",
    price: 1_750_000,
    date: "Dec 2025",
    status: "Completed",
  },
  {
    property: "Tokyo Modern Residence",
    buyer: "H.T.",
    price: 960_000,
    date: "Nov 2025",
    status: "Completed",
  },
];

const MOCK_TESTIMONIALS = [
  {
    quote:
      "An absolute professional — made our international purchase completely seamless.",
    author: "David K.",
    location: "London",
    stars: 5,
  },
  {
    quote:
      "Found us the perfect investment property in under 3 weeks. Outstanding service.",
    author: "Priya M.",
    location: "Mumbai",
    stars: 5,
  },
  {
    quote:
      "Exceptional knowledge of the Dubai market. Highly recommended to any investor.",
    author: "Omar R.",
    location: "Dubai",
    stars: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-foreground">
        {rating > 0 ? rating.toFixed(1) : "—"}
      </span>
    </div>
  );
}

function PropertyMiniCard({ property }: { property: Property }) {
  const typeLabel =
    property.propertyType === "house"
      ? "House"
      : property.propertyType === "apartment"
        ? "Apartment"
        : property.propertyType === "land"
          ? "Land"
          : property.propertyType === "commercial"
            ? "Commercial"
            : "Other";

  return (
    <Link to="/property/$id" params={{ id: String(property.id) }}>
      <motion.article
        whileHover={{ y: -3, scale: 1.015 }}
        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:ring-2 hover:ring-primary/25 transition-shadow cursor-pointer"
      >
        <div className="h-2 bg-gradient-to-r from-primary to-[oklch(var(--accent))]" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-display font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1">
              {property.title}
            </h4>
            {property.featured && (
              <span className="shrink-0 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                ★ Featured
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-primary font-bold mb-3">
            <DollarSign className="w-3.5 h-3.5" />
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: property.currency || "USD",
              maximumFractionDigits: 0,
            }).format(property.price)}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              {String(property.bedrooms)} beds
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              {String(property.bathrooms)} baths
            </span>
            <span className="ml-auto text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
              {typeLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0 text-primary" />
            {property.city}, {property.country}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default function AgentProfilePage() {
  const { agentId } = useParams({ from: "/agents/$agentId" });
  const { actor, isFetching } = useActor();

  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    let cancelled = false;
    const safeActor = actor;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const principal = Principal.fromText(agentId);
        const [agentData, propsData] = await Promise.all([
          safeActor.getAgentProfile(principal),
          safeActor.getAgentProperties(principal),
        ]);
        if (!cancelled) {
          setAgent(agentData ?? null);
          setProperties(
            propsData.filter((p) => p.status === PropertyStatus.available),
          );
        }
      } catch {
        if (!cancelled) setError("Could not load agent profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching, agentId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setForm({ name: "", email: "", message: "" });
    toast.success("Message sent! The agent will be in touch shortly.");
  };

  const avatarColor =
    AVATAR_COLORS[agentId.charCodeAt(0) % AVATAR_COLORS.length];
  const initials = agent
    ? `${agent.firstName[0] ?? ""}${agent.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <main className="min-h-screen bg-background">
      {/* Back nav */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-2">
        <Link
          to="/agents"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="agent_profile.link"
        >
          <ArrowLeft className="w-4 h-4" />
          All Agents
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-4 py-8 space-y-6"
            data-ocid="agent_profile.loading_state"
          >
            <div className="flex gap-6 items-start">
              <Skeleton className="w-24 h-24 rounded-full shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </motion.div>
        ) : error || !agent ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-4 py-16 text-center"
            data-ocid="agent_profile.error_state"
          >
            <p className="text-destructive font-medium text-lg">
              {error ?? "Agent not found."}
            </p>
            <Link to="/agents">
              <Button className="mt-4" variant="outline">
                Back to Directory
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-5xl mx-auto px-4 py-8 space-y-10"
          >
            {/* Hero card */}
            <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="h-2 bg-gradient-to-r from-primary via-[oklch(var(--accent))] to-primary" />
              <div className="p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start">
                {/* Avatar */}
                <div
                  className={`w-24 h-24 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-3xl shadow-inner shrink-0`}
                >
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {agent.firstName} {agent.lastName}
                    </h1>
                    {agent.verified && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Agent
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-1">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{agent.agency}</span>
                  </div>

                  {agent.licenseNumber && (
                    <p className="text-xs text-muted-foreground mb-2">
                      License:{" "}
                      <span className="font-mono">{agent.licenseNumber}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 shrink-0 text-primary" />
                    {agent.contactInfo.city}, {agent.contactInfo.country}
                  </div>

                  <StarRating rating={agent.rating} />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column: bio + contact */}
              <div className="lg:col-span-1 space-y-6">
                {/* Bio */}
                {agent.bio && (
                  <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border rounded-xl p-5"
                  >
                    <h2 className="font-display font-semibold text-foreground mb-2">
                      About
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {agent.bio}
                    </p>
                  </motion.section>
                )}

                {/* Contact info */}
                <motion.section
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-card border border-border rounded-xl p-5 space-y-3"
                >
                  <h2 className="font-display font-semibold text-foreground mb-1">
                    Contact
                  </h2>
                  {agent.contactInfo.email && (
                    <a
                      href={`mailto:${agent.contactInfo.email}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail className="w-4 h-4 shrink-0" />
                      {agent.contactInfo.email}
                    </a>
                  )}
                  {agent.contactInfo.phone && (
                    <a
                      href={`tel:${agent.contactInfo.phone}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="w-4 h-4 shrink-0" />
                      {agent.contactInfo.phone}
                    </a>
                  )}
                  {agent.contactInfo.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      {agent.contactInfo.address}
                    </div>
                  )}
                </motion.section>

                {/* Contact form */}
                <motion.section
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-xl p-5"
                  data-ocid="agent_profile.panel"
                >
                  <h2 className="font-display font-semibold text-foreground mb-4">
                    Send a Message
                  </h2>
                  <form onSubmit={handleSend} className="space-y-3">
                    <div>
                      <Label htmlFor="contact-name" className="text-xs mb-1">
                        Your Name
                      </Label>
                      <Input
                        id="contact-name"
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="John Smith"
                        className="h-9 text-sm"
                        data-ocid="agent_profile.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email" className="text-xs mb-1">
                        Email
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        placeholder="john@example.com"
                        className="h-9 text-sm"
                        data-ocid="agent_profile.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-msg" className="text-xs mb-1">
                        Message
                      </Label>
                      <Textarea
                        id="contact-msg"
                        value={form.message}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, message: e.target.value }))
                        }
                        placeholder="I'm interested in your listings…"
                        rows={4}
                        className="text-sm resize-none"
                        data-ocid="agent_profile.textarea"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={sending}
                      data-ocid="agent_profile.submit_button"
                    >
                      {sending ? "Sending…" : "Send Message"}
                    </Button>
                  </form>
                </motion.section>
              </div>

              {/* Right column: listings + transactions + testimonials */}
              <div className="lg:col-span-2 space-y-8">
                {/* Listings */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">
                    Listings by {agent.firstName} {agent.lastName}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({properties.length})
                    </span>
                  </h2>

                  {properties.length === 0 ? (
                    <div
                      className="bg-muted/50 border border-border rounded-xl p-10 text-center"
                      data-ocid="agent_profile.empty_state"
                    >
                      <p className="text-muted-foreground">
                        No active listings.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {properties.map((p, i) => (
                        <motion.div
                          key={String(p.id)}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + i * 0.06 }}
                          data-ocid={`agent_profile.item.${i + 1}`}
                        >
                          <PropertyMiniCard property={p} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.section>

                {/* Transaction History */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                  data-ocid="agent_profile.table"
                >
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-display text-lg font-bold text-foreground">
                      Recent Transactions
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Completed deals by this agent
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {MOCK_TRANSACTIONS.map((tx, i) => (
                      <div
                        key={tx.property}
                        className={`flex flex-wrap items-center gap-3 px-6 py-4 ${
                          i % 2 === 0 ? "bg-card" : "bg-muted/30"
                        }`}
                        data-ocid={`agent_profile.row.${i + 1}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {tx.property}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Buyer: {tx.buyer}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm text-primary">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }).format(tx.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.date}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          {tx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Client Testimonials */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                >
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">
                    What Clients Say
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {MOCK_TESTIMONIALS.map((t, i) => (
                      <motion.div
                        key={t.author}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                        className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-300"
                        data-ocid={`agent_profile.card.${i + 1}`}
                      >
                        <Quote className="w-5 h-5 text-primary/40 mb-3" />
                        <div className="flex mb-3">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground italic leading-relaxed mb-4">
                          "{t.quote}"
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {t.author.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {t.author}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t.location}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              </div>
            </div>
            <AgentReviewsSection agentId={agent.principal} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
