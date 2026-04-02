import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
  Activity,
  AlertTriangle,
  BarChart3,
  Briefcase,
  CheckCircle,
  CreditCard,
  DollarSign,
  Eye,
  HelpCircle,
  Home,
  Loader2,
  MessageSquare,
  Newspaper,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IdDocStatus } from "../backend";
import DashboardLayout from "../components/DashboardLayout";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAnalytics,
  useIsAdmin,
  usePublishedProperties,
  useVerifyAgent,
} from "../hooks/useQueries";
import BulkImportPanel from "./admin/BulkImportPanel";
import CurrencySettingsPanel from "./admin/CurrencySettingsPanel";
import FraudMonitoringPanel, {
  INITIAL_UNDER_REVIEW_COUNT,
} from "./admin/FraudMonitoringPanel";
import ListingsModerationPanel from "./admin/ListingsModerationPanel";
import NewsManagementPanel from "./admin/NewsManagementPanel";
import RolePermissionsPanel from "./admin/RolePermissionsPanel";
import SupportTicketsPanel from "./admin/SupportTicketsPanel";
import SystemLogsPanel from "./admin/SystemLogsPanel";
import TransactionsPanel from "./admin/TransactionsPanel";
import VerificationsPanel from "./admin/VerificationsPanel";

type AdminSection =
  | "overview"
  | "verifications"
  | "listings-moderation"
  | "currency"
  | "bulk-import"
  | "logs"
  | "support"
  | "roles"
  | "transactions"
  | "users"
  | "properties"
  | "analytics"
  | "settings"
  | "news"
  | "fraud-monitoring";

const NAV_ITEMS = [
  { label: "Overview", section: "overview" as AdminSection, icon: Home },
  {
    label: "Verifications",
    section: "verifications" as AdminSection,
    icon: ShieldCheck,
  },
  {
    label: "Listings",
    section: "listings-moderation" as AdminSection,
    icon: Briefcase,
  },
  {
    label: "Fraud Monitoring",
    section: "fraud-monitoring" as AdminSection,
    icon: ShieldAlert,
  },
  { label: "Currency", section: "currency" as AdminSection, icon: DollarSign },
  {
    label: "Bulk Import",
    section: "bulk-import" as AdminSection,
    icon: Upload,
  },
  { label: "System Logs", section: "logs" as AdminSection, icon: Activity },
  { label: "Support", section: "support" as AdminSection, icon: HelpCircle },
  { label: "Roles", section: "roles" as AdminSection, icon: Shield },
  {
    label: "Transactions",
    section: "transactions" as AdminSection,
    icon: CreditCard,
  },
  { label: "Users", section: "users" as AdminSection, icon: Users },
  {
    label: "Properties",
    section: "properties" as AdminSection,
    icon: ShieldCheck,
  },
  { label: "Analytics", section: "analytics" as AdminSection, icon: BarChart3 },
  { label: "Settings", section: "settings" as AdminSection, icon: Settings },
  { label: "News", section: "news" as AdminSection, icon: Newspaper },
];

export default function AdminDashboardPage() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: properties, isLoading: propsLoading } = usePublishedProperties(
    {},
  );
  const verifyAgent = useVerifyAgent();
  const [agentSearch, setAgentSearch] = useState("");
  const [propSearch, setPropSearch] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [pendingSellerCount, setPendingSellerCount] = useState(0);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [pendingIdCount, setPendingIdCount] = useState(0);
  const [idAlertDismissed, setIdAlertDismissed] = useState(false);
  const [idDetailOpen, setIdDetailOpen] = useState(false);
  const [idSubmissions, setIdSubmissions] = useState<any[]>([]);
  const [idSubmissionsLoading, setIdSubmissionsLoading] = useState(false);
  const [idActionLoading, setIdActionLoading] = useState<bigint | null>(null);
  const [fraudAlertCount, setFraudAlertCount] = useState(
    INITIAL_UNDER_REVIEW_COUNT,
  );

  // Load pending seller submissions count on mount
  useEffect(() => {
    if (!actor) return;
    (actor as any)
      .getSellerSubmissions()
      .then((subs: Array<{ status: { __kind__: string } }>) => {
        const count = subs.filter(
          (s) =>
            s.status.__kind__ !== "approved" &&
            s.status.__kind__ !== "rejected",
        ).length;
        setPendingSellerCount(count);
      })
      .catch(() => {
        // silently ignore — badge is best-effort
      });
  }, [actor]);

  // Load pending ID verification submissions count on mount
  useEffect(() => {
    if (!actor) return;
    actor
      .getIdDocumentSubmissions()
      .then((subs) => {
        const count = subs.filter(
          (s) => s.status === IdDocStatus.pending,
        ).length;
        setPendingIdCount(count);
      })
      .catch(() => {
        // silently ignore — badge is best-effort
      });
  }, [actor]);

  if (!identity) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        id="main-content"
      >
        <h2 className="font-display text-2xl font-bold mb-3">Login Required</h2>
        <p className="text-muted-foreground">
          Please login to access admin panel.
        </p>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <DashboardLayout
        navItems={NAV_ITEMS.map((n) => ({
          label: n.label,
          href: "/admin",
          icon: n.icon,
        }))}
        title="Admin Dashboard"
        breadcrumb="Admin"
      >
        <div data-ocid="admin.loading_state">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout
        navItems={NAV_ITEMS.map((n) => ({
          label: n.label,
          href: "/admin",
          icon: n.icon,
        }))}
        title="Admin Dashboard"
        breadcrumb="Admin"
      >
        <div
          className="text-center py-20"
          data-ocid="admin.unauthorized.error_state"
        >
          <h2 className="font-display text-2xl font-bold mb-3">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You don&apos;t have admin permissions.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  async function openIdDetail() {
    setIdDetailOpen(true);
    setIdSubmissionsLoading(true);
    try {
      const data = await (actor as any).getIdDocumentSubmissions();
      setIdSubmissions(data.filter((s: any) => "pending" in s.status));
    } catch {
      toast.error("Failed to load ID submissions.");
    } finally {
      setIdSubmissionsLoading(false);
    }
  }

  function handleVerifyAgent(principal: string) {
    verifyAgent.mutate(principal, {
      onSuccess: () => toast.success("Agent verified!"),
      onError: () => toast.error("Failed to verify agent."),
    });
  }

  const agentMap = new Map<
    string,
    { principal: string; listingCount: number }
  >();
  for (const p of properties ?? []) {
    const key = p.agentId.toString();
    const existing = agentMap.get(key);
    if (existing) {
      existing.listingCount++;
    } else {
      agentMap.set(key, { principal: key, listingCount: 1 });
    }
  }
  const agents = Array.from(agentMap.values());
  const filteredAgents = agents.filter(
    (a) =>
      !agentSearch ||
      a.principal.toLowerCase().includes(agentSearch.toLowerCase()),
  );
  const filteredProps = (properties ?? []).filter(
    (p) =>
      !propSearch ||
      p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(propSearch.toLowerCase()),
  );

  const statCards = [
    {
      label: "Total Users",
      value: analytics?.userCount?.toString() ?? "0",
      icon: Users,
      bg: "bg-primary/10",
      color: "text-primary",
    },
    {
      label: "Agents",
      value: analytics?.agentCount?.toString() ?? "0",
      icon: Briefcase,
      bg: "bg-secondary/10",
      color: "text-secondary",
    },
    {
      label: "Properties",
      value: analytics?.propertyCount?.toString() ?? "0",
      icon: Home,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Inquiries",
      value: analytics?.inquiryCount?.toString() ?? "0",
      icon: MessageSquare,
      bg: "bg-yellow-50",
      color: "text-yellow-600",
    },
  ];

  // Build nav items with badges on Listings, Verifications, and Fraud Monitoring
  const dashNavItems = NAV_ITEMS.map((n) => ({
    label: n.label,
    href: "/admin",
    icon: n.icon,
    section: n.section,
    badge:
      n.section === "listings-moderation" && pendingSellerCount > 0
        ? pendingSellerCount
        : n.section === "verifications" && pendingIdCount > 0
          ? pendingIdCount
          : n.section === "fraud-monitoring" && fraudAlertCount > 0
            ? fraudAlertCount
            : undefined,
  }));

  const sectionTitle: Record<AdminSection, string> = {
    overview: "Overview",
    verifications: "Agent Verifications",
    "listings-moderation": "Listings Moderation",
    currency: "Currency & Exchange",
    "bulk-import": "Bulk Import / Export",
    logs: "System Logs",
    support: "Support Tickets",
    roles: "Role & Permission Editor",
    transactions: "Transaction Management",
    users: "Users",
    properties: "Properties",
    analytics: "Analytics",
    settings: "Settings",
    news: "News Management",
    "fraud-monitoring": "Fraud Monitoring",
  };

  return (
    <DashboardLayout
      navItems={dashNavItems}
      title={sectionTitle[activeSection]}
      breadcrumb="Admin"
      activeSection={activeSection}
      onSectionChange={(section) => setActiveSection(section as AdminSection)}
    >
      {/* Stat cards — always visible on overview */}
      {activeSection === "overview" && (
        <>
          {/* Pending seller submissions alert */}
          {pendingSellerCount > 0 && !alertDismissed && (
            <div
              className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-amber-800"
              role="alert"
              data-ocid="admin.pending_submissions.toast"
            >
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  You have <strong>{pendingSellerCount}</strong> pending seller
                  submission{pendingSellerCount !== 1 ? "s" : ""} awaiting
                  review.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => setActiveSection("listings-moderation")}
                  data-ocid="admin.pending_submissions.review.button"
                >
                  Review Now
                </Button>
                <button
                  type="button"
                  onClick={() => setAlertDismissed(true)}
                  className="p-1 rounded hover:bg-amber-100 transition-colors"
                  aria-label="Dismiss notification"
                  data-ocid="admin.pending_submissions.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Pending ID verification alert */}
          {pendingIdCount > 0 && !idAlertDismissed && (
            <div
              className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-6 text-purple-800"
              role="alert"
              data-ocid="admin.pending_id_verifications.toast"
            >
              <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  You have <strong>{pendingIdCount}</strong> pending ID
                  verification{pendingIdCount !== 1 ? "s" : ""} awaiting review.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-purple-400 text-purple-700 hover:bg-purple-50"
                onClick={openIdDetail}
                data-ocid="admin.pending_id_verifications.view_detail.button"
              >
                <Eye className="w-3 h-3 mr-1" /> View Submissions
              </Button>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setActiveSection("verifications")}
                  data-ocid="admin.pending_id_verifications.review.button"
                >
                  Review Now
                </Button>
                <button
                  type="button"
                  onClick={() => setIdAlertDismissed(true)}
                  className="p-1 rounded hover:bg-purple-100 transition-colors"
                  aria-label="Dismiss ID verification notification"
                  data-ocid="admin.pending_id_verifications.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {analyticsLoading ? (
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              data-ocid="admin.analytics.loading_state"
            >
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 shadow-xs"
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick-access cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                section: "verifications" as AdminSection,
                label: "Agent Verifications",
                desc: "Review pending ID submissions",
                icon: ShieldCheck,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                section: "listings-moderation" as AdminSection,
                label: "Listings Moderation",
                desc: "Approve or reject property listings",
                icon: Briefcase,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                section: "fraud-monitoring" as AdminSection,
                label: "Fraud Monitoring",
                desc: "Review flagged trades across all users",
                icon: ShieldAlert,
                color: "text-red-600",
                bg: "bg-red-50",
              },
              {
                section: "currency" as AdminSection,
                label: "Currency Settings",
                desc: "Manage exchange rates & currencies",
                icon: DollarSign,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                section: "bulk-import" as AdminSection,
                label: "Bulk Import/Export",
                desc: "CSV import & export listings",
                icon: Upload,
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                section: "logs" as AdminSection,
                label: "System Logs",
                desc: "Monitor real-time system activity",
                icon: Activity,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                section: "support" as AdminSection,
                label: "Support Tickets",
                desc: "Respond to user support requests",
                icon: HelpCircle,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                section: "roles" as AdminSection,
                label: "Role & Permissions",
                desc: "Edit role-based access control",
                icon: Shield,
                color: "text-rose-600",
                bg: "bg-rose-50",
              },
              {
                section: "transactions" as AdminSection,
                label: "Transactions",
                desc: "View & update all transactions",
                icon: CreditCard,
                color: "text-teal-600",
                bg: "bg-teal-50",
              },
            ].map((card) => (
              <button
                key={card.section}
                type="button"
                onClick={() => setActiveSection(card.section)}
                className="bg-card rounded-xl border border-border p-5 flex items-start gap-4 shadow-xs hover:shadow-md hover:border-primary/30 transition-all text-left group relative"
                data-ocid={`admin.overview.${card.section}.card`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}
                >
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {card.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.desc}
                  </p>
                </div>
                {card.section === "listings-moderation" &&
                  pendingSellerCount > 0 && (
                    <span className="absolute top-3 right-3 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      {pendingSellerCount}
                    </span>
                  )}
                {card.section === "verifications" && pendingIdCount > 0 && (
                  <span className="absolute top-3 right-3 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-purple-500 text-white text-[10px] font-bold">
                    {pendingIdCount}
                  </span>
                )}
                {card.section === "fraud-monitoring" && fraudAlertCount > 0 && (
                  <span className="absolute top-3 right-3 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {fraudAlertCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Section panels */}
      {activeSection === "verifications" && <VerificationsPanel />}
      {activeSection === "listings-moderation" && (
        <ListingsModerationPanel onCountChange={setPendingSellerCount} />
      )}
      {activeSection === "fraud-monitoring" && (
        <FraudMonitoringPanel onReviewCountChange={setFraudAlertCount} />
      )}
      {activeSection === "currency" && <CurrencySettingsPanel />}
      {activeSection === "bulk-import" && <BulkImportPanel />}
      {activeSection === "logs" && <SystemLogsPanel />}
      {activeSection === "support" && <SupportTicketsPanel />}
      {activeSection === "roles" && <RolePermissionsPanel />}
      {activeSection === "transactions" && <TransactionsPanel />}
      {activeSection === "news" && <NewsManagementPanel />}

      {/* Legacy users panel */}
      {activeSection === "users" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between gap-4">
            <h3 className="font-display font-semibold">Agents</h3>
            <Input
              placeholder="Search by principal..."
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              className="max-w-xs h-8"
              data-ocid="admin.agents.search.input"
            />
          </div>
          {agents.length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="admin.agents.empty_state"
            >
              <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No agents registered yet.</p>
            </div>
          ) : (
            <Table data-ocid="admin.agents.table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Principal ID
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Listings
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent, i) => (
                  <TableRow
                    key={agent.principal}
                    className="hover:bg-accent/50 transition-colors"
                    data-ocid={`admin.agents.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {agent.principal}
                    </TableCell>
                    <TableCell>{agent.listingCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-700 border-0"
                      >
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyAgent(agent.principal)}
                        disabled={verifyAgent.isPending}
                        className="border-primary text-primary hover:bg-primary/10"
                        data-ocid={`admin.agents.verify.button.${i + 1}`}
                      >
                        {verifyAgent.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3 mr-1" /> Verify
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Legacy properties panel */}
      {activeSection === "properties" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between gap-4">
            <h3 className="font-display font-semibold">All Properties</h3>
            <Input
              placeholder="Search properties..."
              value={propSearch}
              onChange={(e) => setPropSearch(e.target.value)}
              className="max-w-xs h-8"
              data-ocid="admin.properties.search.input"
            />
          </div>
          {propsLoading ? (
            <div
              className="p-4 space-y-2"
              data-ocid="admin.properties.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (properties ?? []).length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="admin.properties.empty_state"
            >
              <Home className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No properties listed yet.</p>
            </div>
          ) : (
            <Table data-ocid="admin.properties.table">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Title
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    City
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Price
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProps.map((p, i) => (
                  <TableRow
                    key={p.id.toString()}
                    className="hover:bg-accent/50 transition-colors"
                    data-ocid={`admin.properties.row.${i + 1}`}
                  >
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {p.propertyType}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.city}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: p.currency,
                        maximumFractionDigits: 0,
                      }).format(p.price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "available" ? "default" : "secondary"
                        }
                        className={
                          p.status === "available"
                            ? "bg-green-100 text-green-700 border-0"
                            : ""
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Analytics placeholder */}
      {activeSection === "analytics" && (
        <div className="bg-card rounded-xl border border-border p-10 text-center shadow-xs">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">
            Analytics Dashboard
          </h3>
          <p className="text-muted-foreground text-sm">
            Detailed analytics charts and reports coming soon.
          </p>
        </div>
      )}

      {/* Settings placeholder */}
      {activeSection === "settings" && (
        <div className="bg-card rounded-xl border border-border p-10 text-center shadow-xs">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">
            Site Settings
          </h3>
          <p className="text-muted-foreground text-sm">
            Global site configuration options coming soon.
          </p>
        </div>
      )}

      <Dialog open={idDetailOpen} onOpenChange={setIdDetailOpen}>
        <DialogContent
          className="max-w-2xl"
          data-ocid="admin.id_submissions_quickview.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Pending ID Submissions
            </DialogTitle>
          </DialogHeader>
          {idSubmissionsLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : idSubmissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No pending submissions found.
            </p>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-3 pr-2">
                {idSubmissions.map((sub: any) => (
                  <div
                    key={sub.id.toString()}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3"
                    data-ocid={`admin.id_quickview.item.${sub.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {sub.firstName} {sub.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sub.email}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground capitalize shrink-0">
                      {sub.docType.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {new Date(
                        Number(sub.submittedAt) / 1_000_000,
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50 h-7 px-2 text-xs"
                        disabled={idActionLoading === sub.id}
                        onClick={async () => {
                          setIdActionLoading(sub.id);
                          try {
                            await (actor as any).approveIdDocument(sub.id);
                            setIdSubmissions((prev) =>
                              prev.filter((s) => s.id !== sub.id),
                            );
                            setPendingIdCount((c) => Math.max(0, c - 1));
                            toast.success(
                              `Approved: ${sub.firstName} ${sub.lastName}`,
                            );
                          } catch {
                            toast.error("Failed to approve.");
                          } finally {
                            setIdActionLoading(null);
                          }
                        }}
                        data-ocid={`admin.id_quickview.approve.${sub.id}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 h-7 px-2 text-xs"
                        disabled={idActionLoading === sub.id}
                        onClick={async () => {
                          setIdActionLoading(sub.id);
                          try {
                            await (actor as any).rejectIdDocument(sub.id);
                            setIdSubmissions((prev) =>
                              prev.filter((s) => s.id !== sub.id),
                            );
                            setPendingIdCount((c) => Math.max(0, c - 1));
                            toast.info(
                              `Rejected: ${sub.firstName} ${sub.lastName}`,
                            );
                          } catch {
                            toast.error("Failed to reject.");
                          } finally {
                            setIdActionLoading(null);
                          }
                        }}
                        data-ocid={`admin.id_quickview.reject.${sub.id}`}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIdDetailOpen(false);
                setActiveSection("verifications");
              }}
              data-ocid="admin.id_quickview.goto_verifications.button"
            >
              Open Full Verifications Panel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
