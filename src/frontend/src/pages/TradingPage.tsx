import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart2,
  CheckCircle,
  History,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

// ── helpers ──────────────────────────────────────────────────────────────────
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function formatUSD(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(v);
}

// ── fraud thresholds ─────────────────────────────────────────────────────────
const OIL_FRAUD_THRESHOLD = 25000;
const FOREX_FRAUD_THRESHOLD = 50000;

function isFraudulent(category: TradeCategory, total: number): boolean {
  if (category === "oil") return total > OIL_FRAUD_THRESHOLD;
  return total > FOREX_FRAUD_THRESHOLD;
}

// ── initial price history ─────────────────────────────────────────────────
function buildInitialPrices() {
  const now = Date.now();
  const data: { t: string; wti: number; brent: number }[] = [];
  let wti = 82;
  let brent = 86;
  for (let i = 29; i >= 0; i--) {
    wti = Math.max(75, Math.min(95, wti + rand(-0.4, 0.4)));
    brent = Math.max(79, Math.min(99, brent + rand(-0.4, 0.4)));
    const ts = new Date(now - i * 2000);
    data.push({
      t: ts.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      wti: +wti.toFixed(2),
      brent: +brent.toFixed(2),
    });
  }
  return data;
}

// ── static forex pairs ─────────────────────────────────────────────────────
const FOREX_PAIRS = [
  { pair: "USD/EUR", bid: 0.9241, ask: 0.9245, change: 0.12 },
  { pair: "USD/GBP", bid: 0.7882, ask: 0.7886, change: -0.08 },
  { pair: "USD/AED", bid: 3.6723, ask: 3.6731, change: 0.0 },
  { pair: "EUR/GBP", bid: 0.8531, ask: 0.8537, change: 0.21 },
  { pair: "GBP/JPY", bid: 188.42, ask: 188.56, change: -0.35 },
  { pair: "USD/JPY", bid: 148.76, ask: 148.84, change: 0.44 },
  { pair: "USD/CAD", bid: 1.3621, ask: 1.3629, change: -0.15 },
];

// ── open positions (mock) ──────────────────────────────────────────────────
const MOCK_OIL_POSITIONS = [
  { id: 1, asset: "WTI Crude", qty: 500, entry: 81.4, current: 82.1 },
  { id: 2, asset: "Brent Crude", qty: 300, entry: 85.9, current: 85.62 },
];

// ── trade history types ───────────────────────────────────────────────────
type TradeCategory = "oil" | "forex";

interface TradeRecord {
  id: number;
  dateTime: string;
  asset: string;
  type: "Buy" | "Sell";
  qty: number;
  qtyUnit: string;
  price: number;
  total: number;
  pl: number;
  status: "Completed";
  category: TradeCategory;
  flagged: boolean;
}

// ── initial mock trade history ────────────────────────────────────────────
const INITIAL_TRADE_HISTORY: TradeRecord[] = [
  {
    id: 1,
    dateTime: "2026-03-31 14:22",
    asset: "WTI Crude",
    type: "Buy",
    qty: 200,
    qtyUnit: "bbl",
    price: 81.14,
    total: 16228.0,
    pl: 192.0,
    status: "Completed",
    category: "oil",
    flagged: false,
  },
  {
    id: 2,
    dateTime: "2026-03-31 11:05",
    asset: "USD/EUR",
    type: "Sell",
    qty: 5000,
    qtyUnit: "USD",
    price: 0.9241,
    total: 4620.5,
    pl: 58.3,
    status: "Completed",
    category: "forex",
    flagged: false,
  },
  {
    id: 3,
    dateTime: "2026-03-30 16:47",
    asset: "Brent Crude",
    type: "Sell",
    qty: 150,
    qtyUnit: "bbl",
    price: 86.2,
    total: 12930.0,
    pl: -84.0,
    status: "Completed",
    category: "oil",
    flagged: false,
  },
  {
    id: 4,
    dateTime: "2026-03-30 09:33",
    asset: "GBP/JPY",
    type: "Buy",
    qty: 2000,
    qtyUnit: "GBP",
    price: 188.42,
    total: 376840.0,
    pl: 430.0,
    status: "Completed",
    category: "forex",
    flagged: true,
  },
  {
    id: 5,
    dateTime: "2026-03-29 13:18",
    asset: "WTI Crude",
    type: "Buy",
    qty: 300,
    qtyUnit: "bbl",
    price: 80.75,
    total: 24225.0,
    pl: 345.0,
    status: "Completed",
    category: "oil",
    flagged: false,
  },
  {
    id: 6,
    dateTime: "2026-03-29 10:02",
    asset: "USD/GBP",
    type: "Sell",
    qty: 3000,
    qtyUnit: "USD",
    price: 0.7882,
    total: 2364.6,
    pl: -22.5,
    status: "Completed",
    category: "forex",
    flagged: false,
  },
  {
    id: 7,
    dateTime: "2026-03-28 15:55",
    asset: "Brent Crude",
    type: "Buy",
    qty: 100,
    qtyUnit: "bbl",
    price: 85.5,
    total: 8550.0,
    pl: 62.0,
    status: "Completed",
    category: "oil",
    flagged: false,
  },
  {
    id: 8,
    dateTime: "2026-03-28 08:44",
    asset: "USD/JPY",
    type: "Buy",
    qty: 10000,
    qtyUnit: "USD",
    price: 148.76,
    total: 1487600.0,
    pl: 1240.0,
    status: "Completed",
    category: "forex",
    flagged: true,
  },
  {
    id: 9,
    dateTime: "2026-03-27 12:30",
    asset: "WTI Crude",
    type: "Sell",
    qty: 400,
    qtyUnit: "bbl",
    price: 82.3,
    total: 32920.0,
    pl: -118.0,
    status: "Completed",
    category: "oil",
    flagged: true,
  },
  {
    id: 10,
    dateTime: "2026-03-27 07:15",
    asset: "EUR/GBP",
    type: "Buy",
    qty: 8000,
    qtyUnit: "EUR",
    price: 0.8531,
    total: 6824.8,
    pl: 96.0,
    status: "Completed",
    category: "forex",
    flagged: false,
  },
];

// ── 2FA details type ──────────────────────────────────────────────────────
interface TwoFADetails {
  action: "buy" | "sell";
  asset: string;
  qty: number;
  qtyUnit: string;
  price: number;
  total: number;
  category: TradeCategory;
}

// ── portfolio chart helpers ───────────────────────────────────────────────
interface PLDataPoint {
  date: string;
  dailyPL: number;
  cumulativePL: number;
}

function buildPLData(history: TradeRecord[]): PLDataPoint[] {
  // Group by date, sum P&L per day
  const byDate = new Map<string, number>();
  for (const t of [...history].reverse()) {
    const day = t.dateTime.split(" ")[0];
    byDate.set(day, (byDate.get(day) ?? 0) + t.pl);
  }
  const sorted = Array.from(byDate.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  let cum = 0;
  return sorted.map(([date, dailyPL]) => {
    cum += dailyPL;
    return {
      date: date.slice(5),
      dailyPL: +dailyPL.toFixed(2),
      cumulativePL: +cum.toFixed(2),
    };
  });
}

// ── component ─────────────────────────────────────────────────────────────
export default function TradingPage() {
  const [prices, setPrices] = useState(buildInitialPrices);
  const [commodity, setCommodity] = useState<"wti" | "brent">("wti");
  const [qty, setQty] = useState("100");
  const [forexPair, setForexPair] = useState(FOREX_PAIRS[0]);
  const [forexAmt, setForexAmt] = useState("1000");
  const [walletOpen, setWalletOpen] = useState(false);
  const [positions, setPositions] = useState(
    MOCK_OIL_POSITIONS.map((p) => ({ ...p })),
  );
  const tickRef = useRef(0);

  // 2FA state
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [twoFADetails, setTwoFADetails] = useState<TwoFADetails | null>(null);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAError, setTwoFAError] = useState("");

  // trade history state
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>(
    INITIAL_TRADE_HISTORY,
  );

  // fraud banner state
  const [fraudBannerDismissed, setFraudBannerDismissed] = useState(false);

  // simulate live prices
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      setPrices((prev) => {
        const last = prev[prev.length - 1];
        const newWti = Math.max(75, Math.min(95, last.wti + rand(-0.35, 0.35)));
        const newBrent = Math.max(
          79,
          Math.min(99, last.brent + rand(-0.35, 0.35)),
        );
        const ts = new Date();
        const next = {
          t: ts.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          wti: +newWti.toFixed(2),
          brent: +newBrent.toFixed(2),
        };
        const updated = [...prev.slice(-49), next];
        setPositions((pos) =>
          pos.map((p) => ({
            ...p,
            current:
              p.asset === "WTI Crude"
                ? +newWti.toFixed(2)
                : +newBrent.toFixed(2),
          })),
        );
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const latestPrice = prices[prices.length - 1];
  const currentCommodityPrice =
    commodity === "wti" ? latestPrice.wti : latestPrice.brent;
  const tradeTotal = currentCommodityPrice * (Number.parseFloat(qty) || 0);

  const balance = 124500;
  const limit = 10000000;
  const pct = Math.round((balance / limit) * 100);

  const totalPL = positions.reduce(
    (acc, p) => acc + (p.current - p.entry) * p.qty,
    0,
  );
  const totalValue = positions.reduce((acc, p) => acc + p.current * p.qty, 0);

  const forexConverted = (
    (Number.parseFloat(forexAmt) || 0) * forexPair.bid
  ).toFixed(4);

  // portfolio chart data
  const plData = buildPLData(tradeHistory);
  const totalHistoryPL = tradeHistory.reduce((a, t) => a + t.pl, 0);
  const dailyPLs = plData.map((d) => d.dailyPL);
  const bestDay = dailyPLs.length ? Math.max(...dailyPLs) : 0;
  const worstDay = dailyPLs.length ? Math.min(...dailyPLs) : 0;
  const winRate = tradeHistory.length
    ? Math.round(
        (tradeHistory.filter((t) => t.pl > 0).length / tradeHistory.length) *
          100,
      )
    : 0;

  // flagged trades
  const flaggedCount = tradeHistory.filter((t) => t.flagged).length;
  const showFraudBanner = flaggedCount > 0 && !fraudBannerDismissed;

  // current trade is flagged?
  const currentTradeFlagged = twoFADetails
    ? isFraudulent(twoFADetails.category, twoFADetails.total)
    : false;

  function handleClosePosition(id: number) {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }

  // open 2FA modal
  function openTwoFA(details: TwoFADetails) {
    setTwoFADetails(details);
    setTwoFACode("");
    setTwoFAError("");
    setTwoFAOpen(true);
  }

  function handleOilOrder(action: "buy" | "sell") {
    const assetName = commodity === "wti" ? "WTI Crude" : "Brent Crude";
    openTwoFA({
      action,
      asset: assetName,
      qty: Number.parseFloat(qty) || 0,
      qtyUnit: "bbl",
      price: currentCommodityPrice,
      total: tradeTotal,
      category: "oil",
    });
  }

  function handleForexOrder(action: "buy" | "sell") {
    const amt = Number.parseFloat(forexAmt) || 0;
    const price = action === "buy" ? forexPair.ask : forexPair.bid;
    openTwoFA({
      action,
      asset: forexPair.pair,
      qty: amt,
      qtyUnit: forexPair.pair.split("/")[0],
      price,
      total: amt * price,
      category: "forex",
    });
  }

  function handleVerify() {
    if (twoFACode.length !== 6) {
      setTwoFAError("Invalid code. Please try again.");
      return;
    }
    if (!twoFADetails) return;

    const flagged = isFraudulent(twoFADetails.category, twoFADetails.total);

    // add to history
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const mockPL =
      twoFADetails.action === "buy"
        ? +(twoFADetails.total * 0.008).toFixed(2)
        : -(twoFADetails.total * 0.004).toFixed(2);

    const newRecord: TradeRecord = {
      id: Date.now(),
      dateTime: dateStr,
      asset: twoFADetails.asset,
      type: twoFADetails.action === "buy" ? "Buy" : "Sell",
      qty: twoFADetails.qty,
      qtyUnit: twoFADetails.qtyUnit,
      price: twoFADetails.price,
      total: twoFADetails.total,
      pl: mockPL,
      status: "Completed",
      category: twoFADetails.category,
      flagged,
    };

    setTradeHistory((prev) => [newRecord, ...prev]);
    // re-show fraud banner if dismissed and we just added a flagged trade
    if (flagged) setFraudBannerDismissed(false);
    setTwoFAOpen(false);
    setTwoFADetails(null);
    setTwoFACode("");
    setTwoFAError("");
  }

  const historyOil = tradeHistory.filter((t) => t.category === "oil");
  const historyForex = tradeHistory.filter((t) => t.category === "forex");

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      data-ocid="trading.page"
    >
      {/* ── KYC + balance top bar ── */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Identity Verified
            </Badge>
            <Badge className="bg-slate-700/60 text-slate-300 border border-slate-600/50 gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              KYC Approved
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-widest">
                Wallet Balance
              </p>
              <p className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                {formatUSD(balance)}
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-400 mb-1">
                Investment limit: {formatUSD(balance)} / {formatUSD(limit)}
              </p>
              <div className="w-48 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-500 text-white gap-1.5"
                  data-ocid="trading.wallet.open_modal_button"
                >
                  <Wallet className="w-4 h-4" />
                  Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-slate-100 max-w-[calc(100vw-2rem)] sm:max-w-md mx-2">
                <DialogHeader>
                  <DialogTitle className="text-teal-400">Wallet</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="deposit">
                  <TabsList className="bg-slate-800 border border-slate-700 w-full">
                    <TabsTrigger
                      value="deposit"
                      className="flex-1"
                      data-ocid="trading.deposit.tab"
                    >
                      Deposit
                    </TabsTrigger>
                    <TabsTrigger
                      value="withdraw"
                      className="flex-1"
                      data-ocid="trading.withdraw.tab"
                    >
                      Withdraw
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="deposit" className="space-y-4 pt-4">
                    <div>
                      <Label className="text-slate-300">Amount (USD)</Label>
                      <Input
                        placeholder="e.g. 10000"
                        className="bg-slate-800 border-slate-600 mt-1"
                        data-ocid="trading.deposit.input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Payment Method</Label>
                      <Select>
                        <SelectTrigger
                          className="bg-slate-800 border-slate-600 mt-1"
                          data-ocid="trading.deposit.select"
                        >
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="card">
                            Credit / Debit Card
                          </SelectItem>
                          <SelectItem value="wire">Wire Transfer</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-500"
                      data-ocid="trading.deposit.submit_button"
                    >
                      Deposit Funds
                    </Button>
                  </TabsContent>

                  <TabsContent value="withdraw" className="space-y-4 pt-4">
                    <div>
                      <Label className="text-slate-300">Amount (USD)</Label>
                      <Input
                        placeholder="e.g. 5000"
                        className="bg-slate-800 border-slate-600 mt-1"
                        data-ocid="trading.withdraw.input"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">
                        Withdrawal Method
                      </Label>
                      <Select>
                        <SelectTrigger
                          className="bg-slate-800 border-slate-600 mt-1"
                          data-ocid="trading.withdraw.select"
                        >
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="bank">Bank Account</SelectItem>
                          <SelectItem value="crypto">Crypto Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-500"
                      data-ocid="trading.withdraw.submit_button"
                    >
                      Request Withdrawal
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* ── Anti-Fraud Site Banner ── */}
      {showFraudBanner && (
        <div
          className="bg-red-900/30 border-b border-red-500/30 text-red-300 text-sm px-3 sm:px-4 py-2 flex items-start sm:items-center justify-between gap-2"
          data-ocid="trading.fraud.panel"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <span className="font-semibold text-red-400">
                Anti-Fraud Alert:
              </span>{" "}
              {flaggedCount} trade{flaggedCount > 1 ? "s" : ""} in your history{" "}
              {flaggedCount > 1 ? "have" : "has"} been flagged as unusually
              large. Please review your trading activity.
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 w-7 p-0 shrink-0"
            onClick={() => setFraudBannerDismissed(true)}
            data-ocid="trading.fraud.close_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* ── page title ── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Trading <span className="text-teal-400">Terminal</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Live commodities & forex — invest with confidence
          </p>
        </div>

        {/* ── portfolio summary cards ── */}
        <section
          aria-label="Portfolio Summary"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Portfolio Value",
              value: formatUSD(totalValue + balance),
              icon: <TrendingUp className="w-5 h-5" />,
              color: "text-teal-400",
            },
            {
              label: "Total P&L",
              value: formatUSD(totalPL),
              icon:
                totalPL >= 0 ? (
                  <ArrowUpCircle className="w-5 h-5" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5" />
                ),
              color: totalPL >= 0 ? "text-emerald-400" : "text-red-400",
            },
            {
              label: "Open Positions",
              value: String(positions.length),
              icon: <TrendingUp className="w-5 h-5" />,
              color: "text-sky-400",
            },
            {
              label: "Today's Volume",
              value: formatUSD(41200),
              icon: <TrendingUp className="w-5 h-5" />,
              color: "text-violet-400",
            },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-5 pb-4">
                <div className={`flex items-center gap-2 ${stat.color} mb-1`}>
                  {stat.icon}
                  <span className="text-xs uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </span>
                </div>
                <p
                  className={`text-xl sm:text-2xl font-bold font-mono ${stat.color}`}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ── portfolio performance chart ── */}
        <section
          aria-label="Portfolio Performance"
          data-ocid="trading.portfolio.section"
        >
          <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-teal-400" />
            Portfolio Performance
          </h2>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-5">
              {/* summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: "Total P&L",
                    value: formatUSD(totalHistoryPL),
                    color:
                      totalHistoryPL >= 0 ? "text-emerald-400" : "text-red-400",
                  },
                  {
                    label: "Best Day",
                    value: formatUSD(bestDay),
                    color: "text-emerald-400",
                  },
                  {
                    label: "Worst Day",
                    value: formatUSD(worstDay),
                    color: "text-red-400",
                  },
                  {
                    label: "Win Rate",
                    value: `${winRate}%`,
                    color: winRate >= 50 ? "text-teal-400" : "text-amber-400",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-3"
                  >
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                      {s.label}
                    </p>
                    <p
                      className={`text-base sm:text-xl font-bold font-mono ${s.color}`}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* chart */}
              <ResponsiveContainer
                width="100%"
                height={
                  typeof window !== "undefined" && window.innerWidth < 640
                    ? 200
                    : 260
                }
              >
                <ComposedChart
                  data={plData}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#2dd4bf"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    width={55}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <RechartTooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#e2e8f0",
                    }}
                    formatter={(value: number, name: string) => [
                      formatUSD(value),
                      name === "dailyPL" ? "Daily P&L" : "Cumulative P&L",
                    ]}
                  />
                  <Bar dataKey="dailyPL" maxBarSize={32} radius={[4, 4, 0, 0]}>
                    {plData.map((entry) => (
                      <Cell
                        key={`cell-${entry.date}`}
                        fill={entry.dailyPL >= 0 ? "#10b981" : "#ef4444"}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                  <Area
                    type="monotone"
                    dataKey="cumulativePL"
                    stroke="#2dd4bf"
                    strokeWidth={2}
                    fill="url(#cumGrad)"
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* ── oil trading ── */}
        <section aria-label="Oil Trading">
          <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-2xl">🛢️</span> Oil Trading
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* chart */}
            <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-200 text-base flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                  <span>Crude Oil Prices (USD / barrel)</span>
                  <div className="flex gap-3 text-xs sm:text-sm font-mono">
                    <span className="text-orange-400">
                      WTI {latestPrice.wti}
                    </span>
                    <span className="text-yellow-300">
                      Brent {latestPrice.brent}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={prices}
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="wtiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="brentGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#fde047"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#fde047"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="t"
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      interval={9}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      width={45}
                    />
                    <RechartTooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: 8,
                        color: "#e2e8f0",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="wti"
                      name="WTI"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#wtiGrad)"
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="brent"
                      name="Brent"
                      stroke="#fde047"
                      strokeWidth={2}
                      fill="url(#brentGrad)"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* buy/sell panel */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-200 text-base">
                  Place Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-sm">Commodity</Label>
                  <Select
                    value={commodity}
                    onValueChange={(v) => setCommodity(v as "wti" | "brent")}
                  >
                    <SelectTrigger
                      className="bg-slate-800 border-slate-600 mt-1"
                      data-ocid="trading.oil.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="wti">WTI Crude Oil</SelectItem>
                      <SelectItem value="brent">Brent Crude Oil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase tracking-widest">
                    Current Price
                  </p>
                  <p className="text-2xl font-bold font-mono text-orange-400">
                    {formatUSD(currentCommodityPrice)}
                    <span className="text-sm text-slate-400 ml-1">/bbl</span>
                  </p>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">
                    Quantity (barrels)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="bg-slate-800 border-slate-600 mt-1"
                    data-ocid="trading.oil.input"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700">
                  <p className="text-xs text-slate-400">Total Value</p>
                  <p className="text-lg font-bold font-mono text-teal-400">
                    {formatUSD(tradeTotal)}
                  </p>
                  {tradeTotal > OIL_FRAUD_THRESHOLD && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      Exceeds large-trade threshold
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-500 font-semibold h-11"
                    onClick={() => handleOilOrder("buy")}
                    data-ocid="trading.oil.primary_button"
                  >
                    Buy
                  </Button>
                  <Button
                    variant="destructive"
                    className="font-semibold h-11"
                    onClick={() => handleOilOrder("sell")}
                    data-ocid="trading.oil.secondary_button"
                  >
                    Sell
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* open oil positions */}
          <Card className="mt-4 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200 text-base">
                Open Oil Positions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {[
                        "Asset",
                        "Qty (bbl)",
                        "Entry",
                        "Current",
                        "P&L",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs text-slate-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {positions.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-slate-500"
                          data-ocid="trading.oil.empty_state"
                        >
                          No open positions
                        </td>
                      </tr>
                    )}
                    {positions.map((pos, i) => {
                      const pl = (pos.current - pos.entry) * pos.qty;
                      return (
                        <tr
                          key={pos.id}
                          className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                          data-ocid={`trading.oil.item.${i + 1}`}
                        >
                          <td className="px-4 py-3 font-medium">{pos.asset}</td>
                          <td className="px-4 py-3 font-mono">{pos.qty}</td>
                          <td className="px-4 py-3 font-mono text-slate-300">
                            {formatUSD(pos.entry)}
                          </td>
                          <td className="px-4 py-3 font-mono text-orange-400">
                            {formatUSD(pos.current)}
                          </td>
                          <td
                            className={`px-4 py-3 font-mono font-semibold ${pl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {pl >= 0 ? "+" : ""}
                            {formatUSD(pl)}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 px-2"
                              onClick={() => handleClosePosition(pos.id)}
                              data-ocid={`trading.oil.delete_button.${i + 1}`}
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Close
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── forex trading ── */}
        <section aria-label="Forex Trading">
          <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-2xl">💱</span> Forex Trading
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* pairs table */}
            <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {["Pair", "Bid", "Ask", "Spread", "Change %"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs text-slate-400 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {FOREX_PAIRS.map((fp, i) => (
                        <tr
                          key={fp.pair}
                          className={`border-b border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors ${
                            forexPair.pair === fp.pair ? "bg-teal-500/5" : ""
                          }`}
                          onClick={() => setForexPair(fp)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setForexPair(fp)
                          }
                          tabIndex={0}
                          data-ocid={`trading.forex.item.${i + 1}`}
                        >
                          <td className="px-4 py-3 font-semibold text-white">
                            {fp.pair}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-200">
                            {fp.bid.toFixed(4)}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-200">
                            {fp.ask.toFixed(4)}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-400">
                            {(fp.ask - fp.bid).toFixed(4)}
                          </td>
                          <td
                            className={`px-4 py-3 font-mono font-semibold flex items-center gap-1 ${fp.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {fp.change >= 0 ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            {fp.change >= 0 ? "+" : ""}
                            {fp.change.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* forex buy/sell */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-200 text-base">
                  Trade {forexPair.pair}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div>
                    <p className="text-xs text-slate-400">Bid</p>
                    <p className="font-mono text-lg text-emerald-400">
                      {forexPair.bid.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ask</p>
                    <p className="font-mono text-lg text-red-400">
                      {forexPair.ask.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">
                    Amount ({forexPair.pair.split("/")[0]})
                  </Label>
                  <Input
                    type="number"
                    value={forexAmt}
                    onChange={(e) => setForexAmt(e.target.value)}
                    className="bg-slate-800 border-slate-600 mt-1"
                    data-ocid="trading.forex.input"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700">
                  <p className="text-xs text-slate-400">
                    You receive ({forexPair.pair.split("/")[1]})
                  </p>
                  <p className="text-lg font-bold font-mono text-teal-400">
                    {forexConverted}
                  </p>
                  {(Number.parseFloat(forexAmt) || 0) * forexPair.bid >
                    FOREX_FRAUD_THRESHOLD && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      Exceeds large-trade threshold
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-500 font-semibold h-11"
                    onClick={() => handleForexOrder("buy")}
                    data-ocid="trading.forex.primary_button"
                  >
                    Buy
                  </Button>
                  <Button
                    variant="destructive"
                    className="font-semibold h-11"
                    onClick={() => handleForexOrder("sell")}
                    data-ocid="trading.forex.secondary_button"
                  >
                    Sell
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── trading history ── */}
        <section aria-label="Trading History">
          <h2 className="text-base sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" />
            Trading History
            {flaggedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-medium border border-red-500/30">
                <AlertTriangle className="w-3 h-3" />
                {flaggedCount} flagged
              </span>
            )}
          </h2>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-4 pt-4 border-b border-slate-800">
                  <TabsList className="bg-slate-800 border border-slate-700">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                      data-ocid="trading.history.tab"
                    >
                      All Trades
                    </TabsTrigger>
                    <TabsTrigger
                      value="oil"
                      className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                      data-ocid="trading.history.tab"
                    >
                      Oil Trades
                    </TabsTrigger>
                    <TabsTrigger
                      value="forex"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                      data-ocid="trading.history.tab"
                    >
                      Forex Trades
                    </TabsTrigger>
                  </TabsList>
                </div>

                {(["all", "oil", "forex"] as const).map((tab) => {
                  const rows =
                    tab === "all"
                      ? tradeHistory
                      : tab === "oil"
                        ? historyOil
                        : historyForex;
                  return (
                    <TabsContent key={tab} value={tab} className="m-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-800">
                              {[
                                "Date / Time",
                                "Asset",
                                "Type",
                                "Quantity",
                                "Price",
                                "Total",
                                "P&L",
                                "Status",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-3 text-left text-xs text-slate-400 uppercase tracking-wider whitespace-nowrap"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.length === 0 && (
                              <tr>
                                <td
                                  colSpan={8}
                                  className="px-4 py-8 text-center text-slate-500"
                                  data-ocid="trading.history.empty_state"
                                >
                                  No trades found
                                </td>
                              </tr>
                            )}
                            {rows.map((trade, i) => (
                              <tr
                                key={trade.id}
                                className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                                  trade.flagged ? "bg-red-500/5" : ""
                                }`}
                                data-ocid={`trading.history.item.${i + 1}`}
                              >
                                <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                                  {trade.dateTime}
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">
                                  <span className="flex items-center gap-1.5">
                                    {trade.asset}
                                    {trade.flagged && (
                                      <span
                                        title="Flagged: Unusually large trade"
                                        className="inline-flex items-center text-red-400"
                                      >
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                      trade.type === "Buy"
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : "bg-red-500/15 text-red-400"
                                    }`}
                                  >
                                    {trade.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-300 whitespace-nowrap">
                                  {trade.qty.toLocaleString()} {trade.qtyUnit}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-300">
                                  {trade.category === "oil"
                                    ? formatUSD(trade.price)
                                    : trade.price.toFixed(4)}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-200">
                                  {formatUSD(trade.total)}
                                </td>
                                <td
                                  className={`px-4 py-3 font-mono font-semibold ${
                                    trade.pl >= 0
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {trade.pl >= 0 ? "+" : ""}
                                  {formatUSD(trade.pl)}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-500/10 text-teal-400">
                                    <CheckCircle className="w-3 h-3" />
                                    Completed
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* ── 2FA Modal ── */}
      <Dialog
        open={twoFAOpen}
        onOpenChange={(open) => {
          setTwoFAOpen(open);
          if (!open) {
            setTwoFACode("");
            setTwoFAError("");
          }
        }}
      >
        <DialogContent
          className="bg-slate-900 border-slate-700 text-slate-100 max-w-[calc(100vw-2rem)] sm:max-w-md mx-2"
          data-ocid="trading.twofa.dialog"
        >
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 pb-2">
              <div className="w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-teal-400" />
              </div>
              <div className="text-center">
                <DialogTitle className="text-white text-lg">
                  Security Verification
                </DialogTitle>
                <p className="text-teal-400 text-sm font-medium mt-0.5">
                  Two-Factor Authentication Required
                </p>
              </div>
            </div>
          </DialogHeader>

          {twoFADetails && (
            <div className="space-y-5">
              {/* fraud warning banner inside modal */}
              {currentTradeFlagged && (
                <div
                  className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm flex items-start gap-2"
                  data-ocid="trading.twofa.error_state"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-semibold">⚠️ Large Trade Alert:</span>{" "}
                    This trade exceeds our standard threshold. Please review
                    carefully before confirming.
                  </span>
                </div>
              )}

              {/* order summary */}
              <div className="p-3 rounded-lg bg-slate-800/70 border border-slate-700 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                  Order Summary
                </p>
                <p className="text-white font-semibold">
                  <span
                    className={`${
                      twoFADetails.action === "buy"
                        ? "text-emerald-400"
                        : "text-red-400"
                    } font-bold`}
                  >
                    {twoFADetails.action === "buy" ? "Buy" : "Sell"}
                  </span>{" "}
                  {twoFADetails.qty.toLocaleString()} {twoFADetails.qtyUnit}{" "}
                  {twoFADetails.asset}
                </p>
                <p className="text-teal-400 font-mono font-bold text-lg mt-1">
                  {formatUSD(twoFADetails.total)}
                </p>
              </div>

              {/* OTP input */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm text-center block">
                  6-Digit Authentication Code
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={twoFACode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setTwoFACode(val);
                    if (twoFAError) setTwoFAError("");
                  }}
                  className="bg-slate-800 border-slate-600 text-center text-2xl font-mono tracking-[0.5em] h-14 focus:border-teal-500"
                  data-ocid="trading.twofa.input"
                />
                <p className="text-xs text-slate-400 text-center">
                  Enter the 6-digit code from your authenticator app
                </p>
                {twoFAError && (
                  <p
                    className="text-xs text-red-400 text-center font-medium"
                    data-ocid="trading.twofa.error_state"
                  >
                    {twoFAError}
                  </p>
                )}
              </div>

              {/* actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    setTwoFAOpen(false);
                    setTwoFACode("");
                    setTwoFAError("");
                  }}
                  data-ocid="trading.twofa.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-500 text-white font-semibold"
                  onClick={handleVerify}
                  data-ocid="trading.twofa.confirm_button"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Verify & Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
