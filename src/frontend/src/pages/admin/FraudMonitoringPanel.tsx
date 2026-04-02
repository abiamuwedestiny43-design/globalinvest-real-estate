import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Filter,
  ShieldAlert,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type FraudStatus = "under-review" | "cleared" | "escalated";
type TradeDirection = "Buy" | "Sell";
type TradeAsset =
  | "WTI Crude"
  | "Brent Crude"
  | "EUR/USD"
  | "GBP/USD"
  | "USD/JPY";

interface FlaggedTrade {
  id: string;
  user: string;
  asset: TradeAsset;
  direction: TradeDirection;
  amount: number;
  timestamp: string;
  fraudReason: string;
  status: FraudStatus;
}

const MOCK_TRADES: FlaggedTrade[] = [
  {
    id: "TRD-0041",
    user: "alice@globalinvest.com",
    asset: "WTI Crude",
    direction: "Buy",
    amount: 480000,
    timestamp: "2026-03-28 09:14",
    fraudReason: "Exceeds $50,000 threshold",
    status: "under-review",
  },
  {
    id: "TRD-0057",
    user: "bob_trader",
    asset: "Brent Crude",
    direction: "Sell",
    amount: 375000,
    timestamp: "2026-03-27 14:32",
    fraudReason: "Large position size",
    status: "under-review",
  },
  {
    id: "TRD-0062",
    user: "chen_wei",
    asset: "EUR/USD",
    direction: "Buy",
    amount: 290000,
    timestamp: "2026-03-27 11:05",
    fraudReason: "Exceeds $50,000 threshold",
    status: "under-review",
  },
  {
    id: "TRD-0078",
    user: "omar.rashid",
    asset: "GBP/USD",
    direction: "Sell",
    amount: 220000,
    timestamp: "2026-03-26 16:48",
    fraudReason: "Unusual trading frequency",
    status: "escalated",
  },
  {
    id: "TRD-0083",
    user: "priya.m",
    asset: "WTI Crude",
    direction: "Buy",
    amount: 195000,
    timestamp: "2026-03-26 10:21",
    fraudReason: "Multiple rapid trades",
    status: "under-review",
  },
  {
    id: "TRD-0091",
    user: "sofia.reyes",
    asset: "Brent Crude",
    direction: "Buy",
    amount: 165000,
    timestamp: "2026-03-25 13:57",
    fraudReason: "Exceeds $50,000 threshold",
    status: "under-review",
  },
  {
    id: "TRD-0104",
    user: "james.hartwell",
    asset: "USD/JPY",
    direction: "Sell",
    amount: 143000,
    timestamp: "2026-03-24 08:30",
    fraudReason: "Large position size",
    status: "cleared",
  },
  {
    id: "TRD-0117",
    user: "bob_trader",
    asset: "WTI Crude",
    direction: "Sell",
    amount: 128000,
    timestamp: "2026-03-23 17:14",
    fraudReason: "Unusual trading frequency",
    status: "under-review",
  },
  {
    id: "TRD-0125",
    user: "chen_wei",
    asset: "EUR/USD",
    direction: "Buy",
    amount: 115000,
    timestamp: "2026-03-22 11:44",
    fraudReason: "Multiple rapid trades",
    status: "escalated",
  },
  {
    id: "TRD-0136",
    user: "maria.fernandez",
    asset: "GBP/USD",
    direction: "Buy",
    amount: 98500,
    timestamp: "2026-03-20 09:02",
    fraudReason: "Exceeds $50,000 threshold",
    status: "cleared",
  },
  {
    id: "TRD-0142",
    user: "alice@globalinvest.com",
    asset: "Brent Crude",
    direction: "Sell",
    amount: 87200,
    timestamp: "2026-03-18 15:33",
    fraudReason: "Large position size",
    status: "under-review",
  },
  {
    id: "TRD-0158",
    user: "priya.m",
    asset: "USD/JPY",
    direction: "Buy",
    amount: 74000,
    timestamp: "2026-03-15 12:19",
    fraudReason: "Unusual trading frequency",
    status: "under-review",
  },
  {
    id: "TRD-0163",
    user: "omar.rashid",
    asset: "WTI Crude",
    direction: "Buy",
    amount: 63400,
    timestamp: "2026-03-10 10:55",
    fraudReason: "Multiple rapid trades",
    status: "cleared",
  },
  {
    id: "TRD-0179",
    user: "sofia.reyes",
    asset: "EUR/USD",
    direction: "Sell",
    amount: 52100,
    timestamp: "2026-03-05 14:08",
    fraudReason: "Exceeds $50,000 threshold",
    status: "under-review",
  },
];

const INITIAL_UNDER_REVIEW_COUNT = MOCK_TRADES.filter(
  (t) => t.status === "under-review",
).length;

interface FraudMonitoringPanelProps {
  onReviewCountChange?: (count: number) => void;
}

export default function FraudMonitoringPanel({
  onReviewCountChange,
}: FraudMonitoringPanelProps) {
  const [trades, setTrades] = useState<FlaggedTrade[]>(MOCK_TRADES);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assetFilter, setAssetFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30d");

  const underReviewCount = useMemo(
    () => trades.filter((t) => t.status === "under-review").length,
    [trades],
  );

  useEffect(() => {
    onReviewCountChange?.(underReviewCount);
  }, [underReviewCount, onReviewCountChange]);

  const stats = useMemo(() => {
    const total = trades.length;
    const totalValue = trades.reduce((sum, t) => sum + t.amount, 0);
    const escalated = trades.filter((t) => t.status === "escalated").length;
    return { total, totalValue, underReview: underReviewCount, escalated };
  }, [trades, underReviewCount]);

  const cutoff = useMemo(() => {
    const now = new Date("2026-04-01");
    if (dateRange === "7d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    if (dateRange === "30d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d;
    }
    return null;
  }, [dateRange]);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (assetFilter !== "all" && t.asset !== assetFilter) return false;
      if (cutoff && new Date(t.timestamp) < cutoff) return false;
      return true;
    });
  }, [trades, statusFilter, assetFilter, cutoff]);

  function updateStatus(id: string, newStatus: FraudStatus) {
    setTrades((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
  }

  function handleClear(trade: FlaggedTrade) {
    updateStatus(trade.id, "cleared");
    toast.success(`Trade ${trade.id} marked as Cleared`);
  }

  function handleEscalate(trade: FlaggedTrade) {
    updateStatus(trade.id, "escalated");
    toast.error(`Trade ${trade.id} has been Escalated`);
  }

  function handleViewUser(trade: FlaggedTrade) {
    toast.info(`Viewing user profile: ${trade.user}`);
  }

  const statCards = [
    {
      label: "Total Flagged",
      value: stats.total,
      icon: ShieldAlert,
      bg: "bg-red-50",
      color: "text-red-600",
      border: "border-red-100",
    },
    {
      label: "Total Value Flagged",
      value: `$${(stats.totalValue / 1_000_000).toFixed(2)}M`,
      icon: TrendingUp,
      bg: "bg-orange-50",
      color: "text-orange-600",
      border: "border-orange-100",
    },
    {
      label: "Under Review",
      value: stats.underReview,
      icon: AlertTriangle,
      bg: "bg-amber-50",
      color: "text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Escalated",
      value: stats.escalated,
      icon: XCircle,
      bg: "bg-rose-50",
      color: "text-rose-600",
      border: "border-rose-100",
    },
  ];

  return (
    <section data-ocid="fraud.panel">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-card rounded-xl border ${s.border} p-5 flex items-center gap-4 shadow-xs`}
          >
            <div
              className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}
            >
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-xl border border-border shadow-xs mb-4">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-muted-foreground mr-1">
            Filters:
          </span>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-40 h-8 text-xs"
              data-ocid="fraud.status.select"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="cleared">Cleared</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assetFilter} onValueChange={setAssetFilter}>
            <SelectTrigger
              className="w-40 h-8 text-xs"
              data-ocid="fraud.asset.select"
            >
              <SelectValue placeholder="Asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="WTI Crude">WTI Crude</SelectItem>
              <SelectItem value="Brent Crude">Brent Crude</SelectItem>
              <SelectItem value="EUR/USD">EUR/USD</SelectItem>
              <SelectItem value="GBP/USD">GBP/USD</SelectItem>
              <SelectItem value="USD/JPY">USD/JPY</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger
              className="w-40 h-8 text-xs"
              data-ocid="fraud.date_range.select"
            >
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <span className="ml-auto text-xs text-muted-foreground">
            Showing {filtered.length} of {trades.length} flagged trade
            {trades.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="fraud.trades.empty_state"
          >
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
            <p className="font-semibold text-base mb-1">No flagged trades</p>
            <p className="text-sm text-muted-foreground">
              No trades match the current filters.
            </p>
          </div>
        ) : (
          <Table data-ocid="fraud.trades.table">
            <TableHeader>
              <TableRow className="bg-muted/50">
                {[
                  "Trade ID",
                  "User",
                  "Asset",
                  "Direction",
                  "Amount (USD)",
                  "Timestamp",
                  "Fraud Reason",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((trade, i) => (
                <TableRow
                  key={trade.id}
                  className="hover:bg-accent/40 transition-colors"
                  data-ocid={`fraud.trades.row.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs font-medium">
                    {trade.id}
                  </TableCell>
                  <TableCell className="text-sm max-w-[150px] truncate">
                    {trade.user}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {trade.asset}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        trade.direction === "Buy"
                          ? "bg-blue-100 text-blue-700 border-0 hover:bg-blue-100"
                          : "bg-orange-100 text-orange-700 border-0 hover:bg-orange-100"
                      }
                    >
                      {trade.direction}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-sm whitespace-nowrap">
                    $
                    {trade.amount.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {trade.timestamp}
                  </TableCell>
                  <TableCell className="text-xs max-w-[160px]">
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {trade.fraudReason}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={trade.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {trade.status !== "cleared" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => handleClear(trade)}
                          data-ocid={`fraud.trades.clear.button.${i + 1}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      )}
                      {trade.status !== "escalated" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleEscalate(trade)}
                          data-ocid={`fraud.trades.escalate.button.${i + 1}`}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Escalate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewUser(trade)}
                        data-ocid={`fraud.trades.view_user.button.${i + 1}`}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        User
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: FraudStatus }) {
  if (status === "under-review") {
    return (
      <Badge className="bg-amber-100 text-amber-700 border-0 hover:bg-amber-100 whitespace-nowrap">
        Under Review
      </Badge>
    );
  }
  if (status === "escalated") {
    return (
      <Badge className="bg-red-100 text-red-700 border-0 hover:bg-red-100">
        Escalated
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-700 border-0 hover:bg-green-100">
      Cleared
    </Badge>
  );
}

export { INITIAL_UNDER_REVIEW_COUNT };
