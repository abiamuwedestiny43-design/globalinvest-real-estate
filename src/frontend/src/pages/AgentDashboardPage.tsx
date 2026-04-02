import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  BellRing,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Home,
  ImagePlus,
  Loader2,
  Plus,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PropertyStatus, PropertyType } from "../backend";
import type { Property } from "../backend";
import { CURRENCY_OPTIONS } from "../components/CurrencyConverterWidget";
import DashboardLayout from "../components/DashboardLayout";
import { PropertyImageUpload } from "../components/PropertyImageUpload";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAgentAverageRating, useAgentReviews } from "../hooks/useQueries";
import {
  useAgentInquiries,
  useAgentPropertyDetails,
  useCreateProperty,
  usePromoteProperty,
  usePropertyAverageRating,
  usePublishProperty,
  usePublishedProperties,
  useRespondToInquiry,
  useTransactionsForSeller,
  useUserProfile,
} from "../hooks/useQueries";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/agent", icon: Home },
  { label: "Listings", href: "/agent", icon: FileText },
  { label: "Leads", href: "/agent", icon: Users },
  { label: "Analytics", href: "/agent", icon: BarChart3 },
  { label: "Settings", href: "/onboarding", icon: Settings },
];

interface ParsedViewingRequest {
  id: bigint;
  name: string;
  property: string;
  date: string;
  time: string;
  notes: string;
  status: string;
}

function parseViewingRequest(inquiry: {
  id: bigint;
  propertyTitle: string;
  message: string;
  status: string;
}): ParsedViewingRequest | null {
  if (!inquiry.message.startsWith("Viewing Request\n")) return null;
  const lines = inquiry.message.split("\n");
  const get = (prefix: string) => {
    const line = lines.find((l) => l.startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : "";
  };
  return {
    id: inquiry.id,
    name: get("Name:"),
    property: inquiry.propertyTitle,
    date: get("Date:"),
    time: get("Time:"),
    notes: get("Notes:"),
    status: inquiry.status,
  };
}

function AvgRatingCell({ propertyId }: { propertyId: bigint }) {
  const { data: avg } = usePropertyAverageRating(propertyId);
  if (!avg || avg === 0)
    return <span className="text-xs text-muted-foreground">No reviews</span>;
  return (
    <span className="flex items-center gap-1 text-xs font-medium">
      <span className="text-yellow-500">★</span>
      {avg.toFixed(1)}
    </span>
  );
}

function PropertyImageManager({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const { data: freshProperty, refetch } = useAgentPropertyDetails(
    open ? property.id : null,
  );
  const displayProperty = freshProperty ?? property;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          title="Manage images"
          data-ocid={`agent.listings.images.button.${property.id}`}
        >
          <ImagePlus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-xl max-h-[85vh] overflow-y-auto"
        data-ocid="agent.image-manager.dialog"
      >
        <DialogHeader>
          <DialogTitle>Property Images — {property.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Upload JPG, PNG, or WebP images (max 5 MB each). Only the listing
          owner can upload.
        </p>
        <PropertyImageUpload
          propertyId={property.id}
          existingImages={displayProperty.images}
          onImagesUpdated={() => refetch()}
        />
      </DialogContent>
    </Dialog>
  );
}

function AgentSalesTab({ sellerId }: { sellerId: string }) {
  const { data: transactions, isLoading } = useTransactionsForSeller(sellerId);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4" data-ocid="agent.sales.loading_state">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="agent.sales.empty_state"
      >
        <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="font-medium">No sales recorded yet</p>
        <p className="text-sm mt-1">
          Completed property sales will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-ocid="agent.sales.table">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 font-medium text-muted-foreground">
              Property
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              Buyer
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              Amount
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              Status
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, i) => {
            const statusColors: Record<string, string> = {
              PENDING: "bg-yellow-100 text-yellow-800",
              COMPLETED: "bg-green-100 text-green-800",
              FAILED: "bg-red-100 text-red-800",
              CANCELLED: "bg-gray-100 text-gray-600",
            };
            return (
              <tr
                key={txn.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                data-ocid={`agent.sales.row.${i + 1}`}
              >
                <td className="p-3 font-medium truncate max-w-[160px]">
                  {txn.propertyTitle}
                </td>
                <td className="p-3 text-muted-foreground">{txn.buyerName}</td>
                <td className="p-3 font-semibold text-primary">
                  {txn.currency} {txn.amount.toLocaleString()}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[txn.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {txn.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground text-xs">
                  {new Date(
                    Number(BigInt(txn.createdAt) / 1_000_000n),
                  ).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ViewingRequestsPanel() {
  const { data: inquiries, isLoading } = useAgentInquiries();
  const respondMutation = useRespondToInquiry();

  const viewingRequests: ParsedViewingRequest[] = (inquiries ?? [])
    .map(parseViewingRequest)
    .filter((r): r is ParsedViewingRequest => r !== null);

  const unreadCount = viewingRequests.filter(
    (r) => r.status === "pending",
  ).length;

  function handleMarkResponded(id: bigint) {
    respondMutation.mutate(
      { inquiryId: id, response: "" },
      {
        onSuccess: () => toast.success("Marked as responded"),
        onError: () => toast.error("Failed to update request"),
      },
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <BellRing className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-lg">Viewing Requests</h2>
        {unreadCount > 0 && (
          <Badge className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
            {unreadCount}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div
          className="flex gap-4"
          data-ocid="agent.viewing-requests.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="min-w-[280px] h-40 rounded-xl flex-shrink-0"
            />
          ))}
        </div>
      ) : viewingRequests.length === 0 ? (
        <div
          className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-xl"
          data-ocid="agent.viewing-requests.empty_state"
        >
          No viewing requests yet.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {viewingRequests.map((req, i) => (
            <div
              key={req.id.toString()}
              data-ocid={`agent.viewing-requests.item.${i + 1}`}
              className={`min-w-[280px] max-w-[300px] flex-shrink-0 bg-card border border-border rounded-xl p-4 flex flex-col gap-2 shadow-xs transition-opacity ${
                req.status !== "pending" ? "opacity-50" : "opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">
                    {req.name || "Visitor"}
                  </p>
                  <p className="text-xs text-primary font-medium truncate max-w-[180px]">
                    {req.property}
                  </p>
                </div>
                {req.status === "pending" && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                {req.date && (
                  <p>
                    <span className="font-medium text-foreground">Date:</span>{" "}
                    {req.date}
                  </p>
                )}
                {req.time && (
                  <p>
                    <span className="font-medium text-foreground">Slot:</span>{" "}
                    {req.time}
                  </p>
                )}
              </div>
              {req.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {req.notes}
                </p>
              )}
              <Button
                size="sm"
                variant={req.status !== "pending" ? "ghost" : "outline"}
                className="mt-auto text-xs h-7"
                disabled={req.status !== "pending" || respondMutation.isPending}
                onClick={() => handleMarkResponded(req.id)}
                data-ocid={`agent.viewing-requests.mark-read.button.${i + 1}`}
              >
                {respondMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : req.status !== "pending" ? (
                  "Responded"
                ) : (
                  "Mark as Responded"
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentMyReviewsSection({ principal }: { principal: Principal }) {
  const { data: reviews = [], isLoading } = useAgentReviews(principal);
  const { data: avgRating = 0 } = useAgentAverageRating(principal);

  function formatDate(ns: bigint) {
    const ms = Number(ns) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden shadow-xs mb-6"
      data-ocid="agent.reviews.panel"
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold">My Reviews</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ratings and feedback from buyers
          </p>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-foreground">
              {avgRating.toFixed(1)}
            </span>
            <div className="flex flex-col">
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </span>
              <span className="text-xs text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3" data-ocid="agent.reviews.loading_state">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p
            className="text-muted-foreground text-sm text-center py-6"
            data-ocid="agent.reviews.empty_state"
          >
            No reviews yet. Reviews appear here after buyers rate you.
          </p>
        ) : (
          <ul className="divide-y divide-border" data-ocid="agent.reviews.list">
            {reviews.map((review, i) => (
              <li
                key={review.id.toString()}
                className="py-3 first:pt-0 last:pb-0"
                data-ocid={`agent.reviews.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-semibold text-sm">{review.buyerName}</p>
                    <span className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= Number(review.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </span>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(review.createdAt)}
                  </time>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
                {review.transactionId && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Txn:{" "}
                    <span className="font-mono">{review.transactionId}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AgentDashboardPage() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: allProperties, isLoading: propsLoading } =
    usePublishedProperties({});
  const { data: inquiries } = useAgentInquiries();
  const createProp = useCreateProperty();
  const publishProp = usePublishProperty();
  const promoteProp = usePromoteProperty();

  // Polling notification: fire toast when new inquiries arrive
  const prevInquiryCountRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const currentCount = inquiries?.length ?? 0;
    if (
      prevInquiryCountRef.current !== undefined &&
      currentCount > prevInquiryCountRef.current
    ) {
      toast.info("You have a new inquiry!");
    }
    prevInquiryCountRef.current = currentCount;
  }, [inquiries]);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propType, setPropType] = useState<PropertyType>(
    PropertyType.apartment,
  );
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [bedrooms, setBedrooms] = useState("0");
  const [bathrooms, setBathrooms] = useState("0");
  const [area, setArea] = useState("0");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [features, setFeatures] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  if (!identity) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        id="main-content"
      >
        <h2 className="font-display text-2xl font-bold mb-3">Login Required</h2>
        <p className="text-muted-foreground">
          Please login to access the agent portal.
        </p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <DashboardLayout
        navItems={NAV_ITEMS}
        title="Agent Portal"
        breadcrumb="Agent"
      >
        <div data-ocid="agent.loading_state">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  const agent =
    profile?.profileType.__kind__ === "agent"
      ? profile.profileType.agent
      : null;

  if (!agent) {
    return (
      <DashboardLayout
        navItems={NAV_ITEMS}
        title="Agent Portal"
        breadcrumb="Agent"
      >
        <div className="text-center py-20">
          <h2 className="font-display text-2xl font-bold mb-3">
            Agent Profile Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            You need an agent profile to access this portal.
          </p>
          <Link to="/onboarding" className="text-primary underline">
            Create agent profile
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const myPrincipal = identity.getPrincipal().toString();
  const myProperties = (allProperties ?? []).filter(
    (p) => p.agentId.toString() === myPrincipal,
  );
  const activeListings = myProperties.filter(
    (p) => p.status === PropertyStatus.available,
  ).length;
  const filteredProperties = myProperties.filter(
    (p) =>
      !filterSearch ||
      p.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(filterSearch.toLowerCase()),
  );

  const inquiryCount = inquiries?.length ?? 0;

  async function handleCreateProperty() {
    if (!actor || !identity) return;
    if (!title || !price) {
      toast.error("Title and price are required");
      return;
    }
    const property: Property = {
      id: BigInt(0),
      title,
      description,
      propertyType: propType,
      price: Number.parseFloat(price),
      currency,
      bedrooms: BigInt(Number.parseInt(bedrooms)),
      bathrooms: BigInt(Number.parseInt(bathrooms)),
      area: Number.parseFloat(area),
      city,
      country,
      address,
      features: features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      featured: false,
      status: PropertyStatus.draft,
      agentId: identity.getPrincipal(),
      images: [],
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now()),
    };
    createProp.mutate(property, {
      onSuccess: () => {
        toast.success("Property created as draft!");
        setModalOpen(false);
        resetForm();
      },
      onError: () => toast.error("Failed to create property."),
    });
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("");
    setCurrency("USD");
    setBedrooms("0");
    setBathrooms("0");
    setArea("0");
    setCity("");
    setCountry("");
    setAddress("");
    setFeatures("");
    setPropType(PropertyType.apartment);
  }

  function handlePromote(property: Property) {
    promoteProp.mutate(property.id, {
      onSuccess: () => {
        toast.success(
          (property as any).featured
            ? "Listing removed from featured."
            : "Listing marked as featured! It will be highlighted to buyers.",
        );
      },
      onError: () => toast.error("Failed to update promotion status."),
    });
  }

  function handlePublish(propertyId: bigint) {
    publishProp.mutate(propertyId, {
      onSuccess: () => toast.success("Property published!"),
      onError: () => toast.error("Failed to publish property."),
    });
  }

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      title={`${agent.firstName} ${agent.lastName}`}
      breadcrumb="Agent Portal"
    >
      {/* Agent info + new listing button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-muted-foreground text-sm">
            {agent.agency}
            <span
              className={
                agent.verified
                  ? "ml-2 inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  : "ml-2 inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              }
              data-ocid="agent.verification.badge"
            >
              {agent.verified ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Verified Agent
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" /> Verification Pending
                </>
              )}
            </span>
          </p>
        </div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="agent.new_listing.button"
            >
              <Plus className="w-4 h-4 mr-2" /> New Listing
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            data-ocid="agent.new_listing.dialog"
          >
            <DialogHeader>
              <DialogTitle>Create New Property Listing</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  data-ocid="agent.listing.title.input"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1"
                  data-ocid="agent.listing.description.textarea"
                />
              </div>
              <div>
                <Label>Property Type</Label>
                <Select
                  value={propType}
                  onValueChange={(v) => setPropType(v as PropertyType)}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="agent.listing.type.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PropertyType.apartment}>
                      Apartment
                    </SelectItem>
                    <SelectItem value={PropertyType.house}>House</SelectItem>
                    <SelectItem value={PropertyType.commercial}>
                      Commercial
                    </SelectItem>
                    <SelectItem value={PropertyType.land}>Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1"
                    data-ocid="agent.listing.price.input"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger
                      className="mt-1"
                      data-ocid="agent.listing.currency.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["USD", "EUR", "GBP", "AED", "JPY"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Bedrooms</Label>
                <Input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="mt-1"
                  data-ocid="agent.listing.bedrooms.input"
                />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="mt-1"
                  data-ocid="agent.listing.bathrooms.input"
                />
              </div>
              <div>
                <Label>Area (m²)</Label>
                <Input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="mt-1"
                  data-ocid="agent.listing.area.input"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1"
                  data-ocid="agent.listing.city.input"
                />
              </div>
              <div>
                <Label>Country</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1"
                  data-ocid="agent.listing.country.input"
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                  data-ocid="agent.listing.address.input"
                />
              </div>
              <div className="col-span-2">
                <Label>Features (comma-separated)</Label>
                <Input
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Pool, Gym, Parking..."
                  className="mt-1"
                  data-ocid="agent.listing.features.input"
                />
              </div>
              <div className="col-span-2 flex gap-2 justify-end mt-2">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  data-ocid="agent.listing.cancel.button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProperty}
                  disabled={createProp.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="agent.listing.submit.button"
                >
                  {createProp.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create Listing"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Listings",
            value: myProperties.length,
            icon: Home,
            bg: "bg-primary/10",
            color: "text-primary",
          },
          {
            label: "Active Listings",
            value: activeListings,
            icon: TrendingUp,
            bg: "bg-green-50",
            color: "text-green-600",
          },
          {
            label: "Inquiries Received",
            value: inquiryCount,
            icon: Eye,
            bg: "bg-secondary/10",
            color: "text-secondary",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 shadow-xs"
          >
            <div
              className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
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

      {/* Viewing Requests */}
      <ViewingRequestsPanel />

      {/* Sales History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs mb-6">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold">Sales History</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Completed and pending property transactions
          </p>
        </div>
        <AgentSalesTab sellerId={myPrincipal} />
      </div>

      {/* My Reviews */}
      <AgentMyReviewsSection principal={identity.getPrincipal()} />

      {/* Properties Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
        {/* Table header with search */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <h2 className="font-display font-semibold">My Listings</h2>
          <Input
            placeholder="Search listings..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="max-w-xs h-8"
            data-ocid="agent.listings.search.input"
          />
        </div>
        {propsLoading ? (
          <div
            className="p-4 space-y-3"
            data-ocid="agent.listings.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : myProperties.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="agent.listings.empty_state"
          >
            <Home className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No listings yet. Click "New Listing" to get started.
            </p>
          </div>
        ) : (
          <Table data-ocid="agent.listings.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Title
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Price
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Images
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Avg Rating
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Featured
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((p, i) => (
                <TableRow
                  key={p.id.toString()}
                  className="hover:bg-accent/50 transition-colors"
                  data-ocid={`agent.listings.row.${i + 1}`}
                >
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {p.propertyType}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: p.currency,
                      maximumFractionDigits: 0,
                    }).format(p.price)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {p.images.length} photo{p.images.length !== 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === PropertyStatus.available
                          ? "default"
                          : "secondary"
                      }
                      className={
                        p.status === PropertyStatus.available
                          ? "bg-green-100 text-green-700 border-0"
                          : ""
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AvgRatingCell propertyId={p.id} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePromote(p)}
                        disabled={promoteProp.isPending}
                        aria-label={
                          (p as any).featured
                            ? "Remove from featured"
                            : "Mark as featured"
                        }
                        title={
                          (p as any).featured
                            ? "Remove from featured"
                            : "Mark as featured"
                        }
                        className={
                          (p as any).featured
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-muted-foreground hover:text-amber-400"
                        }
                        data-ocid={`agent.listings.toggle.${i + 1}`}
                      >
                        <Star
                          className={`w-4 h-4 transition-colors ${(p as any).featured ? "fill-amber-400 text-amber-400" : ""}`}
                        />
                      </Button>
                      {(p as any).featured && (
                        <span className="text-[10px] font-semibold text-amber-600 leading-none">
                          Featured
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link to="/property/$id" params={{ id: p.id.toString() }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label="View listing"
                          data-ocid={`agent.listings.view.button.${i + 1}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <PropertyImageManager property={p} />
                      {p.status === PropertyStatus.draft && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePublish(p.id)}
                          disabled={publishProp.isPending}
                          className="text-primary border-primary hover:bg-primary/10"
                          data-ocid={`agent.listings.publish.button.${i + 1}`}
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Agent Profile Settings */}
      <div
        className="bg-card rounded-xl border border-border p-6 max-w-md mt-6"
        data-ocid="agent.profile.panel"
      >
        <h3 className="font-display font-semibold text-lg mb-1">
          Profile Settings
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          Set your preferred currency for listings and quotes.
        </p>
        <AgentPreferredCurrencyForm />
      </div>
    </DashboardLayout>
  );
}

function AgentPreferredCurrencyForm() {
  const [preferred, setPreferred] = useState<string>(
    () => localStorage.getItem("preferredCurrency") ?? "USD",
  );

  function handleSave() {
    localStorage.setItem("preferredCurrency", preferred);
    toast.success("Preferred currency saved!");
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-1.5 block">
          Preferred Currency
        </Label>
        <Select value={preferred} onValueChange={setPreferred}>
          <SelectTrigger
            className="w-full"
            data-ocid="agent.profile.currency.select"
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
        data-ocid="agent.profile.save_button"
      >
        Save Preferences
      </Button>
    </div>
  );
}
