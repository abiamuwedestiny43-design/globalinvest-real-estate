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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Clock,
  CreditCard,
  Heart,
  HelpCircle,
  Home,
  Loader2,
  MessageSquare,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CURRENCY_OPTIONS } from "../components/CurrencyConverterWidget";
import DashboardLayout from "../components/DashboardLayout";
import PropertyCard from "../components/PropertyCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBuyerInquiries,
  useCreateSupportTicket,
  useFavoriteProperties,
  useTransactionsForBuyer,
  useUserProfile,
} from "../hooks/useQueries";

// ─── Saved Searches Types & Helpers ────────────────────────────────────────

interface SavedSearch {
  id: string;
  name: string;
  city: string;
  propertyType: string;
  maxPrice: number;
  minBedrooms: number;
  savedAt: string;
}

const SAVED_SEARCHES_KEY = "globalinvest_saved_searches";

function loadSavedSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(SAVED_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSavedSearches(searches: SavedSearch[]) {
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));
}

// ─── Saved Searches Tab ────────────────────────────────────────────────────

function SavedSearchesTab() {
  const [searches, setSearches] = useState<SavedSearch[]>(loadSavedSearches);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  function handleSave() {
    if (!name.trim()) {
      toast.error("Please enter a name for this search.");
      return;
    }
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: name.trim(),
      city: city.trim(),
      propertyType,
      maxPrice: maxPrice ? Number.parseInt(maxPrice) : 10_000_000,
      minBedrooms: minBedrooms ? Number.parseInt(minBedrooms) : 0,
      savedAt: new Date().toISOString(),
    };
    const updated = [newSearch, ...searches];
    setSearches(updated);
    persistSavedSearches(updated);
    setName("");
    setCity("");
    setPropertyType("");
    setMaxPrice("");
    setMinBedrooms("");
    setAdding(false);
    toast.success("Search saved!");
  }

  function handleDelete(id: string) {
    const updated = searches.filter((s) => s.id !== id);
    setSearches(updated);
    persistSavedSearches(updated);
    toast.success("Search removed.");
  }

  function handleRun(s: SavedSearch) {
    const params = new URLSearchParams();
    if (s.city) params.set("city", s.city);
    if (s.propertyType) params.set("type", s.propertyType);
    if (s.maxPrice < 10_000_000) params.set("maxPrice", s.maxPrice.toString());
    if (s.minBedrooms > 0) params.set("beds", s.minBedrooms.toString());
    navigate({ to: "/browse", search: Object.fromEntries(params) as any });
  }

  return (
    <div data-ocid="dashboard.saved_searches">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">Saved Searches</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Save your filter criteria and quickly re-run any search.
          </p>
        </div>
        {!adding && (
          <Button
            size="sm"
            onClick={() => setAdding(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="dashboard.saved_searches.add_button"
          >
            + New Search
          </Button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-muted/40 border border-border rounded-2xl p-5 mb-6 space-y-4">
          <h4 className="font-semibold text-sm">New Saved Search</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ss-name">Search Name *</Label>
              <Input
                id="ss-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 2BR in Dubai"
                className="mt-1"
                data-ocid="dashboard.saved_searches.name.input"
              />
            </div>
            <div>
              <Label htmlFor="ss-city">City / Country</Label>
              <Input
                id="ss-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Dubai"
                className="mt-1"
                data-ocid="dashboard.saved_searches.city.input"
              />
            </div>
            <div>
              <Label htmlFor="ss-type">Property Type</Label>
              <select
                id="ss-type"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="mt-1 w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="dashboard.saved_searches.type.select"
              >
                <option value="">Any</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            <div>
              <Label htmlFor="ss-price">Max Price (USD)</Label>
              <Input
                id="ss-price"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 500000"
                className="mt-1"
                data-ocid="dashboard.saved_searches.price.input"
              />
            </div>
            <div>
              <Label htmlFor="ss-beds">Min Bedrooms</Label>
              <Input
                id="ss-beds"
                type="number"
                min="0"
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(e.target.value)}
                placeholder="e.g. 2"
                className="mt-1"
                data-ocid="dashboard.saved_searches.beds.input"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="dashboard.saved_searches.save_button"
            >
              Save Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdding(false)}
              data-ocid="dashboard.saved_searches.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Saved searches list */}
      {searches.length === 0 ? (
        <div
          className="text-center py-20 border border-dashed border-border rounded-2xl"
          data-ocid="dashboard.saved_searches.empty_state"
        >
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display text-xl font-semibold mb-2">
            No saved searches yet
          </h3>
          <p className="text-muted-foreground text-sm mb-5">
            Save filter criteria to quickly re-run your favourite searches.
          </p>
          <Button
            size="sm"
            onClick={() => setAdding(true)}
            variant="outline"
            data-ocid="dashboard.saved_searches.empty_add_button"
          >
            Create your first search
          </Button>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="dashboard.saved_searches.list">
          {searches.map((s, i) => (
            <div
              key={s.id}
              className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              data-ocid={`dashboard.saved_search.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{s.name}</p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {s.city && (
                    <Badge variant="secondary" className="text-xs">
                      📍 {s.city}
                    </Badge>
                  )}
                  {s.propertyType && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {s.propertyType.toLowerCase()}
                    </Badge>
                  )}
                  {s.maxPrice < 10_000_000 && (
                    <Badge variant="secondary" className="text-xs">
                      Up to ${s.maxPrice.toLocaleString()}
                    </Badge>
                  )}
                  {s.minBedrooms > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {s.minBedrooms}+ beds
                    </Badge>
                  )}
                  {!s.city &&
                    !s.propertyType &&
                    s.maxPrice >= 10_000_000 &&
                    s.minBedrooms === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        All properties
                      </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Saved {new Date(s.savedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleRun(s)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  data-ocid={`dashboard.saved_search.run.button.${i + 1}`}
                >
                  <Search className="w-3 h-3 mr-1" /> Run Search
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(s.id)}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                  data-ocid={`dashboard.saved_search.delete.button.${i + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Transactions Tab ──────────────────────────────────────────────────────

function TransactionStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

function BuyerTransactionsTab({ buyerId }: { buyerId: string }) {
  const { data: transactions, isLoading } = useTransactionsForBuyer(buyerId);

  if (isLoading) {
    return (
      <div
        className="space-y-3"
        data-ocid="dashboard.transactions.loading_state"
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div
        className="text-center py-20 border border-dashed border-border rounded-2xl"
        data-ocid="dashboard.transactions.empty_state"
      >
        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-display text-xl font-semibold mb-2">
          No transactions yet
        </h3>
        <p className="text-muted-foreground text-sm">
          Your purchase history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="dashboard.transactions.list">
      {transactions.map((txn, i) => (
        <div
          key={txn.id}
          className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4"
          data-ocid={`dashboard.transactions.item.${i + 1}`}
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{txn.propertyTitle}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(
                Number(BigInt(txn.createdAt) / 1_000_000n),
              ).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-primary">
              {txn.currency} {txn.amount.toLocaleString()}
            </p>
            <div className="mt-1">
              <TransactionStatusBadge status={txn.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Nav & Inquiry helpers ─────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Saved", href: "/dashboard", icon: Heart },
  { label: "Inquiries", href: "/dashboard", icon: MessageSquare },
  { label: "Support", href: "/dashboard", icon: HelpCircle },
  { label: "Settings", href: "/onboarding", icon: User },
];

function InquiryStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    responded: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-600",
  };
  return (
    <Badge
      variant="secondary"
      className={`${map[status] ?? "bg-muted text-muted-foreground"} border-0 text-xs capitalize`}
    >
      {status}
    </Badge>
  );
}

function MyInquiriesTab() {
  const { data: inquiries, isLoading } = useBuyerInquiries();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!inquiries || inquiries.length === 0) {
    return (
      <div
        className="text-center py-20 border border-dashed border-border rounded-2xl"
        data-ocid="dashboard.inquiries.empty_state"
      >
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-display text-xl font-semibold mb-2">
          No active inquiries
        </h3>
        <p className="text-muted-foreground text-sm">
          When you contact an agent about a property, your inquiries will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-ocid="dashboard.inquiries.list">
      {inquiries.map((inq, i) => (
        <div
          key={inq.id.toString()}
          className="bg-card border border-border rounded-xl p-4"
          data-ocid={`dashboard.inquiry.item.${i + 1}`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="font-semibold text-sm">{inq.propertyTitle}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(
                  Number(inq.createdAt / 1_000_000n),
                ).toLocaleDateString()}
              </p>
            </div>
            <InquiryStatusBadge status={inq.status} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {inq.message}
          </p>
          {inq.response && (
            <div className="mt-3 bg-primary/5 rounded-lg p-3">
              <p className="text-xs font-medium text-primary mb-1">
                Agent Response
              </p>
              <p className="text-sm">{inq.response}</p>
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <Link
              to="/property/$id"
              params={{ id: inq.propertyId.toString() }}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              data-ocid={`dashboard.inquiry.view_property.link.${i + 1}`}
            >
              View Property →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function SupportTab({ email }: { email: string }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(email);
  const [submitted, setSubmitted] = useState(false);
  const createTicket = useCreateSupportTicket();

  async function handleSubmit() {
    if (!subject.trim() || !message.trim() || !contactEmail.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    createTicket.mutate(
      { subject, message, email: contactEmail },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success("Support ticket submitted. We'll be in touch soon.");
        },
        onError: () => {
          toast.error("Failed to submit ticket. Please try again.");
        },
      },
    );
  }

  if (submitted) {
    return (
      <div
        className="text-center py-20 border border-dashed border-border rounded-2xl"
        data-ocid="dashboard.support.success_state"
      >
        <HelpCircle className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="font-display text-xl font-semibold mb-2">
          Ticket Submitted
        </h3>
        <p className="text-muted-foreground text-sm mb-5">
          Our support team will review your request and respond shortly.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setSubject("");
            setMessage("");
          }}
        >
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg" data-ocid="dashboard.support.form">
      <h3 className="font-display font-semibold text-lg mb-1">
        Contact Support
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Have a question or issue? Submit a ticket and our team will get back to
        you.
      </p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="support-email">Your Email</Label>
          <Input
            id="support-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1"
            data-ocid="dashboard.support.email.input"
          />
        </div>
        <div>
          <Label htmlFor="support-subject">Subject</Label>
          <Input
            id="support-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Issue with property listing"
            className="mt-1"
            data-ocid="dashboard.support.subject.input"
          />
        </div>
        <div>
          <Label htmlFor="support-message">Message</Label>
          <Textarea
            id="support-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Describe your issue or question in detail..."
            className="mt-1"
            data-ocid="dashboard.support.message.textarea"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={createTicket.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
          data-ocid="dashboard.support.submit.button"
        >
          {createTicket.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Ticket"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────

// ─── Buyer Profile Tab ─────────────────────────────────────────────────────
function BuyerProfileTab() {
  const [preferred, setPreferred] = useState<string>(
    () => localStorage.getItem("preferredCurrency") ?? "USD",
  );

  function handleSave() {
    localStorage.setItem("preferredCurrency", preferred);
    toast.success("Preferred currency saved!");
  }

  return (
    <div
      className="bg-card rounded-xl border border-border p-6 max-w-md"
      data-ocid="dashboard.profile.panel"
    >
      <h3 className="font-display font-semibold text-lg mb-1">
        Profile Settings
      </h3>
      <p className="text-muted-foreground text-sm mb-6">
        Set your preferred currency for browsing property prices.
      </p>
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Preferred Currency
          </Label>
          <Select value={preferred} onValueChange={setPreferred}>
            <SelectTrigger
              className="w-full"
              data-ocid="dashboard.profile.currency.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {CURRENCY_OPTIONS.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleSave}
          className="w-full"
          data-ocid="dashboard.profile.save_button"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

export default function BuyerDashboardPage() {
  const { identity } = useInternetIdentity();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: favorites, isLoading: favsLoading } = useFavoriteProperties();
  const { data: inquiries } = useBuyerInquiries();
  const principalId = identity?.getPrincipal().toString() ?? null;

  // Saved searches count for badge
  const [savedSearchCount] = useState(() => loadSavedSearches().length);

  if (!identity) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        id="main-content"
      >
        <h2 className="font-display text-2xl font-bold mb-3">Login Required</h2>
        <p className="text-muted-foreground">
          Please login to access your dashboard.
        </p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <DashboardLayout
        navItems={NAV_ITEMS}
        title="Dashboard"
        breadcrumb="Buyer"
      >
        <div data-ocid="dashboard.loading_state">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  const buyer =
    profile?.profileType.__kind__ === "buyer"
      ? profile.profileType.buyer
      : null;

  if (!buyer) {
    return (
      <DashboardLayout
        navItems={NAV_ITEMS}
        title="Dashboard"
        breadcrumb="Buyer"
      >
        <div className="text-center py-20">
          <h2 className="font-display text-2xl font-bold mb-3">
            Profile Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have a buyer profile yet.
          </p>
          <Link to="/onboarding" className="text-primary underline">
            Create your profile
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const activeInquiries = (inquiries ?? []).filter(
    (i) => i.status === "pending",
  ).length;

  const stats = [
    {
      label: "Saved Properties",
      value: favorites?.length ?? 0,
      icon: Heart,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Active Inquiries",
      value: activeInquiries,
      icon: MessageSquare,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Inquiries",
      value: inquiries?.length ?? 0,
      icon: Home,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Saved Searches",
      value: savedSearchCount,
      icon: Search,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      title={`Welcome, ${buyer.firstName}!`}
      breadcrumb="Buyer Dashboard"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 shadow-xs"
          >
            <div
              className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ID Verification Status Banner */}
      {!bannerDismissed && (
        <div
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm"
          data-ocid="dashboard.id_verification.panel"
        >
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">
              ID Document Under Review
            </p>
            <p className="text-amber-700 mt-0.5">
              Our team is reviewing your submitted documents. You&apos;ll be
              notified once verified.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="text-amber-500 hover:text-amber-700 transition-colors ml-1 shrink-0"
            aria-label="Dismiss verification banner"
            data-ocid="dashboard.id_verification.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Tabs defaultValue="saved">
        <TabsList data-ocid="dashboard.tabs">
          <TabsTrigger value="saved" data-ocid="dashboard.saved.tab">
            Saved Properties
          </TabsTrigger>
          <TabsTrigger value="searches" data-ocid="dashboard.searches.tab">
            Saved Searches
          </TabsTrigger>
          <TabsTrigger value="inquiries" data-ocid="dashboard.inquiries.tab">
            My Inquiries
          </TabsTrigger>
          <TabsTrigger value="support" data-ocid="dashboard.support.tab">
            Support
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            data-ocid="dashboard.transactions.tab"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger value="profile" data-ocid="dashboard.profile.tab">
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          {favsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-[16/9] rounded-xl" />
              ))}
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favorites.map((p, i) => (
                <PropertyCard
                  key={p.id.toString()}
                  property={p}
                  index={i + 1}
                />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-20 border border-dashed border-border rounded-2xl"
              data-ocid="dashboard.saved.empty_state"
            >
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-display text-xl font-semibold mb-2">
                No saved properties yet
              </h3>
              <p className="text-muted-foreground text-sm mb-5">
                Browse listings and save your favorites.
              </p>
              <Link
                to="/browse"
                className="text-primary underline text-sm font-medium"
                data-ocid="dashboard.browse.link"
              >
                Available Properties →
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="searches" className="mt-6">
          <SavedSearchesTab />
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6">
          <MyInquiriesTab />
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <SupportTab email={buyer.contactInfo.email} />
        </TabsContent>
        <TabsContent value="transactions" className="mt-6">
          <BuyerTransactionsTab buyerId={principalId ?? ""} />
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <BuyerProfileTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
