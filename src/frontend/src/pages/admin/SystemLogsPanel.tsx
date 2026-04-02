import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type LogLevel = "INFO" | "WARN" | "ERROR";
type LogFilter = "All" | LogLevel;

interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  actor: string;
  message: string;
}

const MOCK_LOGS: LogEntry[] = [
  {
    id: 1,
    timestamp: "2026-04-01 09:42:11",
    level: "INFO",
    actor: "system",
    message: "Daily rate sync completed: 12 currencies updated",
  },
  {
    id: 2,
    timestamp: "2026-04-01 09:41:05",
    level: "INFO",
    actor: "adaeze@realestate.ng",
    message: "New listing submitted: Luxury Penthouse Victoria Island",
  },
  {
    id: 3,
    timestamp: "2026-04-01 09:38:22",
    level: "WARN",
    actor: "system",
    message: "Rate API response slow: 3.2s (threshold: 2s)",
  },
  {
    id: 4,
    timestamp: "2026-04-01 09:35:00",
    level: "ERROR",
    actor: "system",
    message: "Failed to fetch exchange rate for ZWL: API returned 503",
  },
  {
    id: 5,
    timestamp: "2026-04-01 09:30:17",
    level: "INFO",
    actor: "admin",
    message: "User james@invest.ng approved as verified agent",
  },
  {
    id: 6,
    timestamp: "2026-04-01 09:28:54",
    level: "INFO",
    actor: "marcus@property.co.uk",
    message: "Viewed property listing L003",
  },
  {
    id: 7,
    timestamp: "2026-04-01 09:25:33",
    level: "WARN",
    actor: "system",
    message: "High memory usage detected on worker-02: 87%",
  },
  {
    id: 8,
    timestamp: "2026-04-01 09:20:01",
    level: "INFO",
    actor: "system",
    message: "Scheduled backup completed successfully",
  },
  {
    id: 9,
    timestamp: "2026-04-01 09:15:48",
    level: "ERROR",
    actor: "chenwei@realty.sg",
    message: "Image upload failed: S3 PUT request timed out",
  },
  {
    id: 10,
    timestamp: "2026-04-01 09:10:23",
    level: "INFO",
    actor: "admin",
    message: "Listing L006 rejected: insufficient documentation",
  },
  {
    id: 11,
    timestamp: "2026-04-01 09:05:12",
    level: "INFO",
    actor: "sofia@casas.mx",
    message: "New listing submitted: Colonial Mansion Malibu",
  },
  {
    id: 12,
    timestamp: "2026-04-01 09:01:37",
    level: "WARN",
    actor: "system",
    message: "5 failed login attempts for user priya@homes.in",
  },
  {
    id: 13,
    timestamp: "2026-04-01 08:58:04",
    level: "INFO",
    actor: "system",
    message: "Elasticsearch index refresh completed",
  },
  {
    id: 14,
    timestamp: "2026-04-01 08:55:19",
    level: "INFO",
    actor: "admin",
    message: "Base currency changed: EUR to USD",
  },
  {
    id: 15,
    timestamp: "2026-04-01 08:50:08",
    level: "ERROR",
    actor: "system",
    message:
      "Cron job send_weekly_digest: unhandled exception - NullReferenceError",
  },
  {
    id: 16,
    timestamp: "2026-04-01 08:44:55",
    level: "INFO",
    actor: "fatima@homes.ae",
    message: "Verification documents re-uploaded",
  },
  {
    id: 17,
    timestamp: "2026-04-01 08:40:31",
    level: "WARN",
    actor: "system",
    message: "Database connection pool at 90% capacity",
  },
  {
    id: 18,
    timestamp: "2026-04-01 08:35:00",
    level: "INFO",
    actor: "system",
    message: "Application started successfully on port 8080",
  },
  {
    id: 19,
    timestamp: "2026-04-01 08:30:12",
    level: "INFO",
    actor: "admin",
    message: "Role permissions matrix updated",
  },
  {
    id: 20,
    timestamp: "2026-04-01 08:25:44",
    level: "ERROR",
    actor: "system",
    message: "SMS delivery failed for user +234-801-xxx-xxxx: Twilio 30008",
  },
  {
    id: 21,
    timestamp: "2026-04-01 08:20:09",
    level: "INFO",
    actor: "james@invest.ng",
    message: "Profile updated: phone number verified",
  },
  {
    id: 22,
    timestamp: "2026-04-01 08:15:33",
    level: "WARN",
    actor: "system",
    message: "Unusual login location detected for admin account",
  },
];

function LevelBadge({ level }: { level: LogLevel }) {
  const map: Record<LogLevel, string> = {
    INFO: "bg-blue-100 text-blue-700",
    WARN: "bg-amber-100 text-amber-700",
    ERROR: "bg-red-100 text-red-700",
  };
  return (
    <Badge
      variant="secondary"
      className={`${map[level]} border-0 font-mono text-[10px] px-1.5 py-0`}
    >
      {level}
    </Badge>
  );
}

const FILTERS: LogFilter[] = ["All", "INFO", "WARN", "ERROR"];

export default function SystemLogsPanel() {
  const [filter, setFilter] = useState<LogFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = MOCK_LOGS.filter(
    (l) => filter === "All" || l.level === filter,
  );

  return (
    <section aria-labelledby="logs-heading">
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2
              id="logs-heading"
              className="font-display font-semibold text-lg flex items-center gap-2"
            >
              <Activity className="w-5 h-5 text-primary" />
              System Logs
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {MOCK_LOGS.length} entries — real-time feed
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success("Logs refreshed.")}
            className="gap-1.5"
            data-ocid="logs.refresh.button"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-wrap gap-3 items-center">
          <div className="flex gap-1.5">
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
                data-ocid="logs.filter.tab"
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center ml-auto">
            <label
              htmlFor="logs-date-from"
              className="text-xs text-muted-foreground"
            >
              From
            </label>
            <Input
              id="logs-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-7 text-xs w-36"
              data-ocid="logs.date-from.input"
            />
            <label
              htmlFor="logs-date-to"
              className="text-xs text-muted-foreground"
            >
              To
            </label>
            <Input
              id="logs-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-7 text-xs w-36"
              data-ocid="logs.date-to.input"
            />
          </div>
        </div>

        {/* Log entries */}
        <ScrollArea className="h-[500px]" data-ocid="logs.panel">
          <div className="divide-y divide-border">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="px-5 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors"
              >
                <span className="text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5 w-36">
                  {log.timestamp}
                </span>
                <LevelBadge level={log.level} />
                <span className="text-xs font-medium text-primary shrink-0 w-32 truncate">
                  {log.actor}
                </span>
                <span className="text-xs text-foreground/80">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}
