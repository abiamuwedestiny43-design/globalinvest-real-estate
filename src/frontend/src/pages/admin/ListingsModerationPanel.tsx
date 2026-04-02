import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import {
  AlertTriangle,
  CheckCircle,
  Home,
  Loader2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type ListingStatus = "Pending" | "Approved" | "Rejected" | "Flagged";
type FilterOption = "All" | ListingStatus;
type PanelTab = "agent" | "seller";

interface Listing {
  id: string;
  title: string;
  agent: string;
  location: string;
  price: string;
  submittedDate: string;
  status: ListingStatus;
}

interface SellerRow {
  id: bigint;
  title: string;
  seller: string;
  location: string;
  price: string;
  submittedDate: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface ListingsModerationPanelProps {
  onCountChange?: (count: number) => void;
}

const MOCK_LISTINGS: Listing[] = [
  {
    id: "L001",
    title: "Luxury Penthouse – Victoria Island",
    agent: "Adaeze Okonkwo",
    location: "Lagos, Nigeria",
    price: "₦450,000,000",
    submittedDate: "2026-03-30",
    status: "Pending",
  },
  {
    id: "L002",
    title: "Modern 3-Bed Apartment – Canary Wharf",
    agent: "Marcus Thornton",
    location: "London, UK",
    price: "£1,200,000",
    submittedDate: "2026-03-29",
    status: "Pending",
  },
  {
    id: "L003",
    title: "Beachfront Villa – Lekki Phase 2",
    agent: "James Okafor",
    location: "Lagos, Nigeria",
    price: "₦320,000,000",
    submittedDate: "2026-03-28",
    status: "Approved",
  },
  {
    id: "L004",
    title: "Studio Flat – Ikeja GRA",
    agent: "James Okafor",
    location: "Lagos, Nigeria",
    price: "₦45,000,000",
    submittedDate: "2026-03-27",
    status: "Flagged",
  },
  {
    id: "L005",
    title: "Colonial Mansion – Malibu",
    agent: "Sofia Bautista",
    location: "California, USA",
    price: "$3,800,000",
    submittedDate: "2026-03-26",
    status: "Approved",
  },
  {
    id: "L006",
    title: "Compact Flat – Marina District",
    agent: "Chen Wei",
    location: "Singapore",
    price: "S$1,100,000",
    submittedDate: "2026-03-25",
    status: "Rejected",
  },
  {
    id: "L007",
    title: "Duplex – Abuja FCT",
    agent: "Adaeze Okonkwo",
    location: "Abuja, Nigeria",
    price: "₦180,000,000",
    submittedDate: "2026-03-24",
    status: "Pending",
  },
  {
    id: "L008",
    title: "Desert Villa – Dubai Hills",
    agent: "Fatima Al-Rashid",
    location: "Dubai, UAE",
    price: "AED 4,200,000",
    submittedDate: "2026-03-23",
    status: "Pending",
  },
];

function StatusBadge({ status }: { status: ListingStatus }) {
  const map: Record<ListingStatus, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Flagged: "bg-orange-100 text-orange-700",
  };
  return (
    <Badge variant="secondary" className={`${map[status]} border-0`}>
      {status}
    </Badge>
  );
}

function SellerStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };
  return (
    <Badge
      variant="secondary"
      className={`${map[status] ?? "bg-muted text-muted-foreground"} border-0`}
    >
      {status}
    </Badge>
  );
}

const FILTERS: FilterOption[] = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "Flagged",
];

export default function ListingsModerationPanel({
  onCountChange,
}: ListingsModerationPanelProps) {
  const { actor } = useActor();
  const [panelTab, setPanelTab] = useState<PanelTab>("agent");

  // Agent listings state
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [filter, setFilter] = useState<FilterOption>("All");
  const [search, setSearch] = useState("");

  // Seller submissions state
  const [sellerRows, setSellerRows] = useState<SellerRow[]>([]);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerSearch, setSellerSearch] = useState("");

  const loadSellerSubmissions = useCallback(async () => {
    if (!actor) return;
    setSellerLoading(true);
    try {
      const subs = (await (actor as any).getSellerSubmissions()) as Array<{
        id: bigint;
        title: string;
        sellerName: string;
        location: string;
        country: string;
        price: number;
        currency: string;
        submittedAt: bigint;
        status: { __kind__: string };
      }>;
      const rows = subs.map((sub) => ({
        id: sub.id,
        title: sub.title,
        seller: sub.sellerName,
        location: `${sub.location}, ${sub.country}`,
        price: `${sub.currency} ${sub.price}`,
        submittedDate: new Date(
          Number(sub.submittedAt / BigInt(1_000_000)),
        ).toLocaleDateString(),
        status:
          sub.status.__kind__ === "approved"
            ? ("Approved" as const)
            : sub.status.__kind__ === "rejected"
              ? ("Rejected" as const)
              : ("Pending" as const),
      }));
      setSellerRows(rows);
      const pending = rows.filter((r) => r.status === "Pending").length;
      onCountChange?.(pending);
    } catch {
      toast.error("Failed to load seller submissions.");
    } finally {
      setSellerLoading(false);
    }
  }, [actor, onCountChange]);

  useEffect(() => {
    if (panelTab === "seller" && actor) {
      loadSellerSubmissions();
    }
  }, [panelTab, actor, loadSellerSubmissions]);

  async function handleApprove(id: bigint) {
    if (!actor) return;
    try {
      await (actor as any).approveSellerSubmission(id, "");
      toast.success("Submission approved.");
      await loadSellerSubmissions();
    } catch {
      toast.error("Failed to approve submission.");
    }
  }

  async function handleReject(id: bigint) {
    if (!actor) return;
    try {
      await (actor as any).rejectSellerSubmission(id, "");
      toast.success("Submission rejected.");
      await loadSellerSubmissions();
    } catch {
      toast.error("Failed to reject submission.");
    }
  }

  function updateStatus(id: string, status: ListingStatus) {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l)),
    );
    toast.success(`Listing ${status.toLowerCase()}.`);
  }

  const filtered = listings.filter((l) => {
    const matchesFilter = filter === "All" || l.status === filter;
    const matchesSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.agent.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredSellers = sellerRows.filter(
    (s) =>
      !sellerSearch ||
      s.title.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      s.seller.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      s.location.toLowerCase().includes(sellerSearch.toLowerCase()),
  );

  const pendingSellerCount = sellerRows.filter(
    (s) => s.status === "Pending",
  ).length;

  return (
    <section aria-labelledby="listings-mod-heading">
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border">
          <h2
            id="listings-mod-heading"
            className="font-display font-semibold text-lg flex items-center gap-2"
          >
            <Home className="w-5 h-5 text-primary" />
            Listings Moderation
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review submitted property listings for publication.
          </p>
        </div>

        {/* Panel tab switcher */}
        <div className="px-4 pt-4 pb-0 border-b border-border flex gap-2">
          <button
            type="button"
            onClick={() => setPanelTab("agent")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              panelTab === "agent"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="listings.agent_listings.tab"
          >
            Agent Listings
          </button>
          <button
            type="button"
            onClick={() => setPanelTab("seller")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              panelTab === "seller"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="listings.seller_submissions.tab"
          >
            Seller Submissions
            {pendingSellerCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {pendingSellerCount}
              </span>
            )}
          </button>
        </div>

        {/* Agent Listings Tab */}
        {panelTab === "agent" && (
          <>
            <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filter === f
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                    data-ocid="listings.filter.tab"
                  >
                    {f}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs h-8"
                data-ocid="listings.search.input"
              />
            </div>

            {filtered.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="listings.empty_state"
              >
                <Home className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No listings found for this filter.
                </p>
              </div>
            ) : (
              <Table data-ocid="listings.table">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Property
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Agent
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Location
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Price
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Submitted
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l, i) => (
                    <TableRow
                      key={l.id}
                      className="hover:bg-accent/40 transition-colors"
                      data-ocid={`listings.item.${i + 1}`}
                    >
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {l.title}
                        {l.status === "Pending" && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                            New
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {l.agent}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {l.location}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {l.price}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {l.submittedDate}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={l.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                            title="Approve"
                            onClick={() => updateStatus(l.id, "Approved")}
                            disabled={l.status === "Approved"}
                            data-ocid={`listings.approve.button.${i + 1}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                            title="Reject"
                            onClick={() => updateStatus(l.id, "Rejected")}
                            disabled={l.status === "Rejected"}
                            data-ocid={`listings.reject.button.${i + 1}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-orange-500 hover:bg-orange-50"
                            title="Flag"
                            onClick={() => updateStatus(l.id, "Flagged")}
                            disabled={l.status === "Flagged"}
                            data-ocid={`listings.flag.button.${i + 1}`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}

        {/* Seller Submissions Tab */}
        {panelTab === "seller" && (
          <>
            <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Properties submitted directly by sellers awaiting admin review.
              </p>
              <Input
                placeholder="Search submissions..."
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                className="max-w-xs h-8"
                data-ocid="listings.seller_search.input"
              />
            </div>

            {sellerLoading ? (
              <div
                className="flex items-center justify-center py-16"
                data-ocid="listings.seller_submissions.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredSellers.length === 0 ? (
              <div
                className="text-center py-16"
                data-ocid="listings.seller_submissions.empty_state"
              >
                <Home className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No seller submissions found.
                </p>
              </div>
            ) : (
              <Table data-ocid="listings.seller_submissions.table">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Property
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Seller
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Location
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Price
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Submitted
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSellers.map((s, i) => (
                    <TableRow
                      key={String(s.id)}
                      className="hover:bg-accent/40 transition-colors"
                      data-ocid={`listings.seller_submissions.item.${i + 1}`}
                    >
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {s.title}
                        {s.status === "Pending" && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                            New
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.seller}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.location}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {s.price}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.submittedDate}
                      </TableCell>
                      <TableCell>
                        <SellerStatusBadge status={s.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-green-600 hover:bg-green-50"
                            title="Approve"
                            onClick={() => handleApprove(s.id)}
                            disabled={s.status === "Approved"}
                            data-ocid={`listings.seller_submissions.approve.button.${i + 1}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                            title="Reject"
                            onClick={() => handleReject(s.id)}
                            disabled={s.status === "Rejected"}
                            data-ocid={`listings.seller_submissions.reject.button.${i + 1}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </div>
    </section>
  );
}
