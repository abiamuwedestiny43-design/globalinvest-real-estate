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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import type {
  Ticket as BackendTicket,
  TicketStatus as BackendTicketStatus,
  TicketPriority,
} from "@/declarations/backend.did.d.ts";
import { useActor } from "@/hooks/useActor";
import { HelpCircle, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Priority = "Low" | "Medium" | "High" | "Urgent";
type TicketStatus = "Open" | "In Progress" | "Resolved";

interface Message {
  sender: "requester" | "admin";
  text: string;
  time: string;
}

interface Ticket {
  id: string;
  backendId: bigint;
  requester: string;
  subject: string;
  priority: Priority;
  status: TicketStatus;
  createdDate: string;
  messages: Message[];
}

function priorityFromVariant(p: TicketPriority): Priority {
  if ("low" in p) return "Low";
  if ("medium" in p) return "Medium";
  if ("high" in p) return "High";
  return "Urgent";
}

function statusFromVariant(s: BackendTicketStatus): TicketStatus {
  if ("open" in s) return "Open";
  if ("inProgress" in s) return "In Progress";
  return "Resolved";
}

function priorityToVariant(p: Priority): TicketPriority {
  const map: Record<Priority, TicketPriority> = {
    Low: { low: null },
    Medium: { medium: null },
    High: { high: null },
    Urgent: { urgent: null },
  };
  return map[p];
}

function statusToVariant(s: TicketStatus): BackendTicketStatus {
  const map: Record<TicketStatus, BackendTicketStatus> = {
    Open: { open: null },
    "In Progress": { inProgress: null },
    Resolved: { resolved: null },
  };
  return map[s];
}

function mapBackendTicket(t: BackendTicket): Ticket {
  return {
    id: `TKT-${t.id}`,
    backendId: t.id,
    requester: t.requesterEmail,
    subject: t.subject,
    priority: priorityFromVariant(t.priority),
    status: statusFromVariant(t.status),
    createdDate: new Date(
      Number(t.createdAt / 1_000_000n),
    ).toLocaleDateString(),
    messages: t.messages.map((m) => ({
      sender: m.senderLabel === "Admin" ? "admin" : "requester",
      text: m.text,
      time: new Date(Number(m.createdAt / 1_000_000n)).toLocaleString(),
    })),
  };
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    Low: "bg-slate-100 text-slate-600",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-orange-100 text-orange-700",
    Urgent: "bg-red-100 text-red-700",
  };
  return (
    <Badge variant="secondary" className={`${map[priority]} border-0 text-xs`}>
      {priority}
    </Badge>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, string> = {
    Open: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };
  return (
    <Badge variant="secondary" className={`${map[status]} border-0 text-xs`}>
      {status}
    </Badge>
  );
}

export default function SupportTicketsPanel() {
  const { actor } = useActor();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const data = await (actor as any).getAllSupportTickets();
      setTickets(data.map(mapBackendTicket));
    } catch {
      toast.error("Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  async function sendReply() {
    if (!reply.trim() || !selectedTicket || !actor) return;
    setSending(true);
    try {
      await (actor as any).respondToTicket(selectedTicket.backendId, reply);
      await fetchTickets();
      // Update selected ticket from refreshed data
      setSelectedTicket((prev) => {
        if (!prev) return prev;
        const newMsg: Message = {
          sender: "admin",
          text: reply,
          time: new Date().toLocaleString(),
        };
        return { ...prev, messages: [...prev.messages, newMsg] };
      });
      setReply("");
      toast.success("Reply sent.");
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  async function updateTicket(field: "status" | "priority", value: string) {
    if (!selectedTicket || !actor) return;
    try {
      if (field === "status") {
        await (actor as any).updateTicketStatus(
          selectedTicket.backendId,
          statusToVariant(value as TicketStatus),
        );
      } else {
        await (actor as any).updateTicketPriority(
          selectedTicket.backendId,
          priorityToVariant(value as Priority),
        );
      }
      await fetchTickets();
      setSelectedTicket((prev) =>
        prev ? { ...prev, [field]: value as Priority & TicketStatus } : prev,
      );
      toast.success(`Ticket ${field} updated.`);
    } catch {
      toast.error(`Failed to update ticket ${field}.`);
    }
  }

  return (
    <section aria-labelledby="tickets-heading">
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border">
          <h2
            id="tickets-heading"
            className="font-display font-semibold text-lg flex items-center gap-2"
          >
            <HelpCircle className="w-5 h-5 text-primary" />
            Support Tickets
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and respond to user support requests.
          </p>
        </div>

        {loading ? (
          <div className="p-5 space-y-3" data-ocid="tickets.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div
            className="p-8 text-center text-muted-foreground text-sm"
            data-ocid="tickets.empty_state"
          >
            No support tickets yet.
          </div>
        ) : (
          <Table data-ocid="tickets.table">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Ticket ID
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Requester
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Subject
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Priority
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Created
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t, i) => (
                <TableRow
                  key={t.id}
                  className="hover:bg-accent/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(t)}
                  data-ocid={`tickets.item.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs font-medium text-primary">
                    {t.id}
                  </TableCell>
                  <TableCell className="text-sm">{t.requester}</TableCell>
                  <TableCell className="text-sm max-w-[250px] truncate">
                    {t.subject}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={t.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.createdDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Ticket detail drawer */}
      <Sheet
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <SheetContent
          side="right"
          className="w-[480px] sm:max-w-[480px] overflow-y-auto backdrop-blur-sm"
          data-ocid="tickets.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display">
              {selectedTicket?.id} — {selectedTicket?.subject}
            </SheetTitle>
          </SheetHeader>

          {selectedTicket && (
            <div className="space-y-5">
              {/* Metadata controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ticket-status"
                    className="text-xs text-muted-foreground mb-1 block"
                  >
                    Status
                  </label>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(v) => updateTicket("status", v)}
                  >
                    <SelectTrigger
                      id="ticket-status"
                      className="h-8 text-xs"
                      data-ocid="tickets.status.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Open", "In Progress", "Resolved"].map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="ticket-priority"
                    className="text-xs text-muted-foreground mb-1 block"
                  >
                    Priority
                  </label>
                  <Select
                    value={selectedTicket.priority}
                    onValueChange={(v) => updateTicket("priority", v)}
                  >
                    <SelectTrigger
                      id="ticket-priority"
                      className="h-8 text-xs"
                      data-ocid="tickets.priority.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Low", "Medium", "High", "Urgent"].map((p) => (
                        <SelectItem key={p} value={p} className="text-xs">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message thread */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedTicket.messages.map((msg, idx) => (
                  <div
                    key={`${msg.sender}-${msg.time}-${idx}`}
                    className={`rounded-lg p-3 text-sm ${
                      msg.sender === "admin"
                        ? "bg-primary/10 ml-6"
                        : "bg-muted/50 mr-6"
                    }`}
                  >
                    <p className="font-medium text-xs text-muted-foreground mb-1">
                      {msg.sender === "admin"
                        ? "You (Admin)"
                        : selectedTicket.requester}{" "}
                      · {msg.time}
                    </p>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply */}
              <div className="space-y-2">
                <label htmlFor="ticket-reply" className="text-sm font-medium">
                  Reply
                </label>
                <Textarea
                  id="ticket-reply"
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  data-ocid="tickets.reply.textarea"
                />
                <Button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="w-full bg-primary text-primary-foreground"
                  data-ocid="tickets.reply.submit_button"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
