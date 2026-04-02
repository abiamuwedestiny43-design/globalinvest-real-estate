import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AgentProfile } from "@/declarations/backend.did.d.ts";
import { useActor } from "@/hooks/useActor";
import {
  CheckCircle,
  FileText,
  IdCard,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type VerifStatus = "Pending" | "Approved" | "Rejected";

interface Verification {
  id: string;
  agentPrincipal: AgentProfile["principal"];
  agentName: string;
  email: string;
  submittedDate: string;
  idType: string;
  status: VerifStatus;
}

function agentToVerification(agent: AgentProfile): Verification {
  return {
    id: agent.principal.toText(),
    agentPrincipal: agent.principal,
    agentName: `${agent.firstName} ${agent.lastName}`,
    email: agent.contactInfo.email,
    submittedDate: "On file",
    idType: agent.licenseNumber ? `License: ${agent.licenseNumber}` : "License",
    status: agent.verified ? "Approved" : "Pending",
  };
}

function StatusBadge({ status }: { status: VerifStatus }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };
  return (
    <Badge variant="secondary" className={`${map[status]} border-0`}>
      {status}
    </Badge>
  );
}

// --- ID Submissions types and helpers ---

type IdDocStatus = "pending" | "approved" | "rejected";

interface IdDocBlob {
  id: string;
  url: string;
}

interface IdDocSubmission {
  id: bigint;
  submitterPrincipal: any;
  firstName: string;
  lastName: string;
  email: string;
  docType: string;
  frontBlob: IdDocBlob;
  backBlob: [] | [IdDocBlob];
  status: { pending: null } | { approved: null } | { rejected: null };
  submittedAt: bigint;
}

function idDocStatus(s: IdDocSubmission["status"]): IdDocStatus {
  if ("approved" in s) return "approved";
  if ("rejected" in s) return "rejected";
  return "pending";
}

function IdDocStatusBadge({ status }: { status: IdDocStatus }) {
  const map: Record<IdDocStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <Badge variant="secondary" className={`${map[status]} border-0 capitalize`}>
      {status}
    </Badge>
  );
}

function formatDate(ns: bigint): string {
  try {
    return new Date(Number(ns) / 1_000_000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

// --- ID Submissions panel sub-component ---

function IdSubmissionsPanel() {
  const { actor } = useActor();
  const [submissions, setSubmissions] = useState<IdDocSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<IdDocSubmission | null>(null);
  const [actionLoading, setActionLoading] = useState<bigint | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    setError(null);
    try {
      const data = await (actor as any).getIdDocumentSubmissions();
      setSubmissions(data);
    } catch {
      setError("Failed to load ID submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  async function handleApprove(sub: IdDocSubmission) {
    if (!actor) return;
    setActionLoading(sub.id);
    try {
      await (actor as any).approveIdDocument(sub.id);
      await fetchSubmissions();
      toast.success(
        `ID document approved for ${sub.firstName} ${sub.lastName}.`,
      );
      setSelected(null);
    } catch {
      toast.error("Failed to approve. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(sub: IdDocSubmission) {
    if (!actor) return;
    setActionLoading(sub.id);
    try {
      await (actor as any).rejectIdDocument(sub.id);
      await fetchSubmissions();
      toast.info(`ID document rejected for ${sub.firstName} ${sub.lastName}.`);
      setSelected(null);
    } catch {
      toast.error("Failed to reject. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <>
      {loading ? (
        <div className="p-5 space-y-3" data-ocid="id_submissions.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center" data-ocid="id_submissions.error_state">
          <p className="text-destructive text-sm">{error}</p>
          <Button variant="outline" className="mt-3" onClick={fetchSubmissions}>
            Retry
          </Button>
        </div>
      ) : submissions.length === 0 ? (
        <div
          className="p-8 text-center text-muted-foreground text-sm"
          data-ocid="id_submissions.empty_state"
        >
          No ID document submissions yet.
        </div>
      ) : (
        <Table data-ocid="id_submissions.table">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                Doc Type
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
            {submissions.map((sub, i) => {
              const status = idDocStatus(sub.status);
              return (
                <TableRow
                  key={sub.id.toString()}
                  className="hover:bg-accent/40 transition-colors"
                  data-ocid={`id_submissions.item.${i + 1}`}
                >
                  <TableCell>
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-2 hover:underline"
                      onClick={() => setSelected(sub)}
                      data-ocid={`id_submissions.open_modal_button.${i + 1}`}
                    >
                      {sub.firstName} {sub.lastName}
                    </button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sub.email}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {sub.docType.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(sub.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <IdDocStatusBadge status={status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50 h-7 px-2 text-xs"
                        onClick={() => handleApprove(sub)}
                        disabled={
                          status !== "pending" || actionLoading === sub.id
                        }
                        data-ocid={`id_submissions.approve.button.${i + 1}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 h-7 px-2 text-xs"
                        onClick={() => handleReject(sub)}
                        disabled={
                          status !== "pending" || actionLoading === sub.id
                        }
                        data-ocid={`id_submissions.reject.button.${i + 1}`}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* ID Document detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent
          className="max-w-lg backdrop-blur-sm"
          data-ocid="id_submissions.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              ID Document Review
            </DialogTitle>
          </DialogHeader>
          {selected &&
            (() => {
              const status = idDocStatus(selected.status);
              const backBlob =
                selected.backBlob.length > 0 ? selected.backBlob[0] : null;
              return (
                <div className="space-y-4">
                  <div
                    className={`grid gap-3 ${backBlob ? "grid-cols-2" : "grid-cols-1"}`}
                  >
                    <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center gap-2">
                      {selected.frontBlob.url ? (
                        <img
                          src={selected.frontBlob.url}
                          alt="ID Front"
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                          <FileText className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Front of ID
                      </p>
                    </div>
                    {backBlob && (
                      <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center gap-2">
                        {backBlob.url ? (
                          <img
                            src={backBlob.url}
                            alt="ID Back"
                            className="w-full h-32 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                            <FileText className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Back of ID
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">
                        {selected.firstName} {selected.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{selected.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Doc Type</span>
                      <span className="capitalize">
                        {selected.docType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted</span>
                      <span>{formatDate(selected.submittedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <IdDocStatusBadge status={status} />
                    </div>
                  </div>
                  {status === "pending" && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(selected)}
                        disabled={actionLoading === selected.id}
                        data-ocid="id_submissions.modal.approve.button"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(selected)}
                        disabled={actionLoading === selected.id}
                        data-ocid="id_submissions.modal.reject.button"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Main panel ---

export default function VerificationsPanel() {
  const { actor } = useActor();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Verification | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    setError(null);
    try {
      const agents = await (actor as any).getAgentsForVerification();
      setVerifications(agents.map(agentToVerification));
    } catch {
      setError("Failed to load agent verifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  async function handleApprove(v: Verification) {
    if (!actor) return;
    setActionLoading(v.id);
    try {
      await (actor as any).verifyAgent(v.agentPrincipal);
      await fetchAgents();
      toast.success("Agent approved successfully.");
      setSelectedAgent(null);
    } catch {
      toast.error("Failed to approve agent. Please try again.");
    } finally {
      setActionLoading(null);
    }
  }

  function handleReject(v: Verification) {
    setVerifications((prev) =>
      prev.map((x) => (x.id === v.id ? { ...x, status: "Rejected" } : x)),
    );
    toast.info("Rejected — follow up manually.");
    setSelectedAgent(null);
  }

  return (
    <section aria-labelledby="verifications-heading">
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border">
          <h2
            id="verifications-heading"
            className="font-display font-semibold text-lg flex items-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-primary" />
            Verifications
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve/reject agent and user ID submissions.
          </p>
        </div>

        <Tabs defaultValue="agents" className="w-full">
          <div className="px-5 pt-4">
            <TabsList data-ocid="verifications.tab">
              <TabsTrigger value="agents" data-ocid="verifications.agents.tab">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Agent Verifications
              </TabsTrigger>
              <TabsTrigger
                value="id-submissions"
                data-ocid="verifications.id_submissions.tab"
              >
                <IdCard className="w-4 h-4 mr-1.5" />
                ID Submissions
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Agent Verifications Tab */}
          <TabsContent value="agents" className="mt-0">
            {loading ? (
              <div
                className="p-5 space-y-3"
                data-ocid="verifications.loading_state"
              >
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div
                className="p-8 text-center"
                data-ocid="verifications.error_state"
              >
                <p className="text-destructive text-sm">{error}</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={fetchAgents}
                >
                  Retry
                </Button>
              </div>
            ) : verifications.length === 0 ? (
              <div
                className="p-8 text-center text-muted-foreground text-sm"
                data-ocid="verifications.empty_state"
              >
                No agents pending verification.
              </div>
            ) : (
              <Table data-ocid="verifications.table">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Agent Name
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      Submitted
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                      ID Type
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
                  {verifications.map((v, i) => (
                    <TableRow
                      key={v.id}
                      className="hover:bg-accent/40 transition-colors"
                      data-ocid={`verifications.item.${i + 1}`}
                    >
                      <TableCell>
                        <button
                          type="button"
                          className="font-medium text-primary underline-offset-2 hover:underline"
                          onClick={() => setSelectedAgent(v)}
                          data-ocid={`verifications.agent.button.${i + 1}`}
                        >
                          {v.agentName}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          {v.email}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {v.submittedDate}
                      </TableCell>
                      <TableCell className="text-sm">{v.idType}</TableCell>
                      <TableCell>
                        <StatusBadge status={v.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50 h-7 px-2 text-xs"
                            onClick={() => handleApprove(v)}
                            disabled={
                              v.status !== "Pending" || actionLoading === v.id
                            }
                            data-ocid={`verifications.approve.button.${i + 1}`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 h-7 px-2 text-xs"
                            onClick={() => handleReject(v)}
                            disabled={
                              v.status !== "Pending" || actionLoading === v.id
                            }
                            data-ocid={`verifications.reject.button.${i + 1}`}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* ID Submissions Tab */}
          <TabsContent value="id-submissions" className="mt-0">
            <IdSubmissionsPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Agent verification detail modal */}
      <Dialog
        open={!!selectedAgent}
        onOpenChange={() => setSelectedAgent(null)}
      >
        <DialogContent
          className="max-w-lg backdrop-blur-sm"
          data-ocid="verifications.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Verification Details
            </DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Selfie Photo
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-secondary" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {selectedAgent.idType}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agent</span>
                  <span className="font-medium">{selectedAgent.agentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{selectedAgent.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{selectedAgent.submittedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Type</span>
                  <span>{selectedAgent.idType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={selectedAgent.status} />
                </div>
              </div>
              {selectedAgent.status === "Pending" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(selectedAgent)}
                    disabled={actionLoading === selectedAgent.id}
                    data-ocid="verifications.modal.approve.button"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve Agent
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedAgent)}
                    disabled={actionLoading === selectedAgent.id}
                    data-ocid="verifications.modal.reject.button"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
