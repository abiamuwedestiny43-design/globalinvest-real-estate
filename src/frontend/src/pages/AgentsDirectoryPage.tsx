import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Principal as PrincipalCls } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  Eye,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { AgentProfile } from "../backend";
import { useActor } from "../hooks/useActor";
import { useAgentAverageRating } from "../hooks/useQueries";

const SPECIALTIES = [
  "All",
  "Residential",
  "Commercial",
  "Luxury",
  "International",
  "Rentals",
] as const;
type Specialty = (typeof SPECIALTIES)[number];

const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-blue-800",
  "bg-emerald-600",
  "bg-blue-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-orange-600",
  "bg-purple-600",
  "bg-slate-600",
  "bg-teal-700",
  "bg-pink-600",
  "bg-cyan-700",
];

interface Agent {
  id: number;
  name: string;
  agency: string;
  city: string;
  country: string;
  rating: number;
  reviews: number;
  listings: number;
  specialties: string[];
  bio: string;
  verified: boolean;
  initials: string;
  avatarColor: string;
  principalStr: string;
}

const FALLBACK_AGENTS: Agent[] = [
  {
    id: 1,
    name: "Sophia Al-Rashid",
    agency: "Emirates Elite Realty",
    city: "Dubai",
    country: "UAE",
    rating: 4.9,
    reviews: 142,
    listings: 38,
    specialties: ["Luxury", "International"],
    bio: "Specialising in ultra-prime Dubai properties for over 12 years. Fluent in Arabic, English, and French.",
    verified: true,
    initials: "SA",
    avatarColor: "bg-teal-600",
    principalStr: "",
  },
  {
    id: 2,
    name: "James Whitmore",
    agency: "Mayfair & Partners",
    city: "London",
    country: "UK",
    rating: 4.8,
    reviews: 98,
    listings: 24,
    specialties: ["Residential", "Luxury"],
    bio: "London's West End specialist with a decade of experience in prime central London sales and lettings.",
    verified: true,
    initials: "JW",
    avatarColor: "bg-blue-800",
    principalStr: "",
  },
  {
    id: 3,
    name: "Mei-Ling Tan",
    agency: "Orchard Global Properties",
    city: "Singapore",
    country: "Singapore",
    rating: 4.7,
    reviews: 115,
    listings: 31,
    specialties: ["Commercial", "International"],
    bio: "Connecting Asian investors with Singapore's premium commercial and mixed-use developments.",
    verified: true,
    initials: "MT",
    avatarColor: "bg-emerald-600",
    principalStr: "",
  },
  {
    id: 4,
    name: "Carlos Mendez",
    agency: "Manhattan Prestige Group",
    city: "New York",
    country: "USA",
    rating: 4.6,
    reviews: 87,
    listings: 19,
    specialties: ["Residential", "Rentals"],
    bio: "Manhattan and Brooklyn specialist helping buyers navigate NYC's competitive market since 2015.",
    verified: true,
    initials: "CM",
    avatarColor: "bg-blue-600",
    principalStr: "",
  },
  {
    id: 5,
    name: "Yuki Hashimoto",
    agency: "Tokyo Premier Estates",
    city: "Tokyo",
    country: "Japan",
    rating: 4.5,
    reviews: 63,
    listings: 14,
    specialties: ["Residential", "International"],
    bio: "Guiding expatriates and investors through Tokyo's unique property landscape with precision and care.",
    verified: false,
    initials: "YH",
    avatarColor: "bg-rose-600",
    principalStr: "",
  },
  {
    id: 6,
    name: "Olivia Bancroft",
    agency: "Harbour Bridge Realty",
    city: "Sydney",
    country: "Australia",
    rating: 4.8,
    reviews: 134,
    listings: 42,
    specialties: ["Luxury", "Residential"],
    bio: "Award-winning Sydney agent specialising in harborside and eastern suburbs prestige properties.",
    verified: true,
    initials: "OB",
    avatarColor: "bg-amber-600",
    principalStr: "",
  },
  {
    id: 7,
    name: "Arjun Kapoor",
    agency: "BKC Wealth Properties",
    city: "Mumbai",
    country: "India",
    rating: 4.4,
    reviews: 75,
    listings: 27,
    specialties: ["Commercial", "Residential"],
    bio: "Mumbai's BKC and South Bombay expert with deep expertise in commercial leasing and HNI residential sales.",
    verified: true,
    initials: "AK",
    avatarColor: "bg-orange-600",
    principalStr: "",
  },
  {
    id: 8,
    name: "Fatima Al-Thani",
    agency: "Pearl Qatar Realty",
    city: "Doha",
    country: "Qatar",
    rating: 4.9,
    reviews: 57,
    listings: 18,
    specialties: ["Luxury", "International"],
    bio: "Doha's foremost luxury property consultant, specialising in The Pearl-Qatar and West Bay Lagoon.",
    verified: true,
    initials: "FA",
    avatarColor: "bg-purple-600",
    principalStr: "",
  },
  {
    id: 9,
    name: "Lena Müller",
    agency: "Berliner Immobilien AG",
    city: "Berlin",
    country: "Germany",
    rating: 4.3,
    reviews: 44,
    listings: 11,
    specialties: ["Rentals", "Residential"],
    bio: "Berlin rental market specialist helping international clients find homes in Germany's vibrant capital.",
    verified: false,
    initials: "LM",
    avatarColor: "bg-slate-600",
    principalStr: "",
  },
  {
    id: 10,
    name: "Marcus du Plessis",
    agency: "Cape Atlantic Properties",
    city: "Cape Town",
    country: "South Africa",
    rating: 4.7,
    reviews: 89,
    listings: 33,
    specialties: ["Luxury", "Residential"],
    bio: "Cape Town's leading luxury agent covering the Atlantic Seaboard, Constantia, and Winelands estates.",
    verified: true,
    initials: "MD",
    avatarColor: "bg-teal-700",
    principalStr: "",
  },
  {
    id: 11,
    name: "Elena Vasquez",
    agency: "Barcelona Coast Realty",
    city: "Barcelona",
    country: "Spain",
    rating: 4.2,
    reviews: 36,
    listings: 8,
    specialties: ["International", "Rentals"],
    bio: "Helping international buyers invest in Barcelona's thriving residential and holiday rental market.",
    verified: false,
    initials: "EV",
    avatarColor: "bg-pink-600",
    principalStr: "",
  },
  {
    id: 12,
    name: "Hassan Al-Farsi",
    agency: "Abu Dhabi Capital Estates",
    city: "Abu Dhabi",
    country: "UAE",
    rating: 4.8,
    reviews: 101,
    listings: 48,
    specialties: ["Commercial", "Luxury", "International"],
    bio: "Leading commercial and luxury real estate consultant on Saadiyat Island and Al Reem Island.",
    verified: true,
    initials: "HF",
    avatarColor: "bg-cyan-700",
    principalStr: "",
  },
];

function deriveSpecialties(agency: string): string[] {
  const lower = agency.toLowerCase();
  if (
    lower.includes("luxury") ||
    lower.includes("prestige") ||
    lower.includes("elite")
  )
    return ["Luxury", "Residential"];
  if (
    lower.includes("commercial") ||
    lower.includes("capital") ||
    lower.includes("bkc")
  )
    return ["Commercial", "Residential"];
  if (lower.includes("international") || lower.includes("global"))
    return ["International", "Residential"];
  if (lower.includes("rent") || lower.includes("lounge")) return ["Rentals"];
  return ["Residential"];
}

function mapAgentProfile(a: AgentProfile, index: number): Agent {
  const firstName = a.firstName ?? "";
  const lastName = a.lastName ?? "";
  return {
    id: index + 1,
    name: `${firstName} ${lastName}`.trim(),
    agency: a.agency ?? "",
    city: a.contactInfo?.city ?? "",
    country: a.contactInfo?.country ?? "",
    rating: a.rating ?? 0,
    reviews: 0,
    listings: 0,
    specialties: deriveSpecialties(a.agency ?? ""),
    bio: a.bio ?? "",
    verified: a.verified ?? false,
    initials: `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase(),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    principalStr: a.principal.toString(),
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
      <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
      {rating > 0 ? rating.toFixed(1) : "—"}
    </span>
  );
}

function LiveAgentRating({
  principalStr,
  fallbackRating,
}: { principalStr: string; fallbackRating: number }) {
  const principal = useMemo(() => {
    if (!principalStr) return undefined;
    try {
      return PrincipalCls.fromText(principalStr);
    } catch {
      return undefined;
    }
  }, [principalStr]);
  const { data: liveRating } = useAgentAverageRating(principal);
  const rating =
    typeof liveRating === "number" && liveRating > 0
      ? liveRating
      : fallbackRating;
  return <StarRating rating={rating} />;
}
interface ContactDialogProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
}

function ContactDialog({ agent, open, onClose }: ContactDialogProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    toast.success(`Message sent to ${agent?.name}!`);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="agent.contact.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Contact {agent?.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="contact-name">Your Name *</Label>
              <Input
                id="contact-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Smith"
                required
                data-ocid="agent.contact.input"
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="contact-phone">Phone (optional)</Label>
              <Input
                id="contact-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div>
              <Label htmlFor="contact-subject">Subject</Label>
              <Input
                id="contact-subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Property inquiry"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="contact-message">Message *</Label>
            <Textarea
              id="contact-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="I'd like to learn more about available properties in your area..."
              rows={4}
              required
              data-ocid="agent.contact.textarea"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              data-ocid="agent.contact.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="agent.contact.submit_button"
            >
              {sending ? "Sending…" : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AgentsDirectoryPage() {
  const { actor, isFetching } = useActor();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState<Specialty>("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [contactAgent, setContactAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (!actor || isFetching) return;
    const safeActor = actor;
    let cancelled = false;
    async function load() {
      try {
        const data = await safeActor.getAgentsForVerification();
        if (!cancelled) {
          if (data && data.length > 0) {
            setAgents(data.map((a, i) => mapAgentProfile(a, i)));
          } else {
            setAgents(FALLBACK_AGENTS);
          }
        }
      } catch {
        if (!cancelled) {
          setFetchError(true);
          setAgents(FALLBACK_AGENTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.agency.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q);
      const matchesSpecialty =
        specialty === "All" || a.specialties.includes(specialty);
      const matchesVerified = !verifiedOnly || a.verified;
      return matchesSearch && matchesSpecialty && matchesVerified;
    });
  }, [agents, search, specialty, verifiedOnly]);

  const verifiedCount = agents.filter((a) => a.verified).length;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[oklch(var(--primary)/0.12)] via-background to-[oklch(var(--accent)/0.08)] py-20 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-medium">
              {loading ? "Loading" : verifiedCount} Verified Agents Worldwide
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              Find Your{" "}
              <span className="italic text-primary">Perfect Agent</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Browse our global network of verified real estate professionals
              across Dubai, London, New York, Singapore, and beyond.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, agency, or city…"
                className="pl-11 h-12 text-base rounded-xl border-border shadow-sm"
                data-ocid="agents.search_input"
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2 flex-1">
            {SPECIALTIES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSpecialty(s)}
                data-ocid={`agents.${s.toLowerCase()}.tab`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  specialty === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Switch
              id="verified-toggle"
              checked={verifiedOnly}
              onCheckedChange={setVerifiedOnly}
              data-ocid="agents.verified.toggle"
            />
            <Label
              htmlFor="verified-toggle"
              className="text-sm cursor-pointer select-none"
            >
              Verified Only
            </Label>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {fetchError && (
          <p className="text-xs text-muted-foreground mb-4">
            Could not reach backend — showing demo data.
          </p>
        )}

        {loading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            data-ocid="agents.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="h-1 bg-muted" />
                <div className="p-5 space-y-3">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              agents
              {specialty !== "All" && (
                <>
                  {" "}
                  in{" "}
                  <span className="font-semibold text-foreground">
                    {specialty}
                  </span>
                </>
              )}
              {verifiedOnly && " (verified only)"}
            </p>

            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20 text-muted-foreground"
                  data-ocid="agents.empty_state"
                >
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No agents found</p>
                  <p className="text-sm mt-1">
                    Try adjusting your search or filters
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map((agent, i) => (
                    <AgentCard
                      key={agent.principalStr || agent.id}
                      agent={agent}
                      index={i}
                      onContact={() => setContactAgent(agent)}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </section>

      <ContactDialog
        agent={contactAgent}
        open={contactAgent !== null}
        onClose={() => setContactAgent(null)}
      />
    </main>
  );
}

function AgentCard({
  agent,
  index,
  onContact,
}: {
  agent: Agent;
  index: number;
  onContact: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -4, scale: 1.015 }}
      className="group relative bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:ring-2 hover:ring-primary/30 transition-shadow cursor-default overflow-hidden"
      data-ocid={`agents.item.${index + 1}`}
    >
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary to-[oklch(var(--accent))]" />

      <div className="p-5">
        {/* Avatar + badge */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-14 h-14 rounded-full ${agent.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-inner`}
          >
            {agent.initials}
          </div>
          {agent.verified && (
            <span className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Name & agency */}
        <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
          {agent.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5 mb-2">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{agent.agency}</span>
        </div>

        {/* Rating + listings */}
        <div className="flex items-center gap-3 mb-3">
          <LiveAgentRating
            principalStr={agent.principalStr}
            fallbackRating={agent.rating}
          />
          <span className="text-xs text-muted-foreground">
            ({agent.reviews})
          </span>
          <span className="ml-auto text-xs font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5">
            {agent.listings} listings
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
          {agent.city}, {agent.country}
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {agent.bio}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
            onClick={onContact}
            data-ocid={`agents.contact.button.${index + 1}`}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            Contact Agent
          </Button>
          {agent.principalStr ? (
            <Link
              to="/agents/$agentId"
              params={{ agentId: agent.principalStr }}
              data-ocid={`agents.profile.button.${index + 1}`}
            >
              <Button
                size="sm"
                variant="ghost"
                className="border border-border hover:bg-muted text-xs w-full"
                asChild={false}
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Profile
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="border border-border hover:bg-muted text-xs"
              data-ocid={`agents.profile.button.${index + 1}`}
              disabled
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Profile
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
