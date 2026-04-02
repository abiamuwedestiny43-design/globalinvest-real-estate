import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { toast } from "sonner";
import {
  useAllTransactions,
  useUpdateTransactionStatus,
} from "../../hooks/useQueries";
import type { Transaction } from "../../hooks/useQueries";

const STATUS_OPTIONS = ["PENDING", "COMPLETED", "FAILED", "CANCELLED"];

function statusBadge(status: string) {
  const variants: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
    CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variants[status] ?? variants.PENDING}`}
    >
      {status}
    </span>
  );
}

function formatDate(ns: bigint) {
  try {
    return new Date(Number(ns / 1_000_000n)).toLocaleDateString();
  } catch {
    return "\u2014";
  }
}

function TransactionRow({ txn }: { txn: Transaction; index: number }) {
  const [pendingStatus, setPendingStatus] = useState(txn.status);
  const update = useUpdateTransactionStatus();

  const handleSave = async () => {
    try {
      await update.mutateAsync({ id: txn.id, status: pendingStatus });
      toast.success("Transaction status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const isDirty = pendingStatus !== txn.status;

  return (
    <TableRow>
      <TableCell className="font-medium max-w-[160px] truncate">
        {txn.propertyTitle}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {txn.buyerName}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {txn.sellerName}
      </TableCell>
      <TableCell className="font-semibold text-primary">
        {txn.currency} {txn.amount.toLocaleString()}
      </TableCell>
      <TableCell>
        <Select value={pendingStatus} onValueChange={setPendingStatus}>
          <SelectTrigger
            className="h-7 w-36 text-xs"
            data-ocid="admin.transactions.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {statusBadge(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {formatDate(txn.createdAt)}
      </TableCell>
      <TableCell>
        {isDirty && (
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handleSave}
            disabled={update.isPending}
            data-ocid="admin.transactions.save_button"
          >
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function TransactionsPanel() {
  const { data: transactions, isLoading } = useAllTransactions();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = (transactions ?? []).filter(
    (t) => statusFilter === "ALL" || t.status === statusFilter,
  );

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
      <div className="p-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display font-semibold">Transaction Management</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {(transactions ?? []).length} total transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter:</span>
          <div className="flex gap-1 flex-wrap">
            {["ALL", ...STATUS_OPTIONS].map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setStatusFilter(s)}
                data-ocid="admin.transactions.filter.tab"
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div
          className="p-4 space-y-3"
          data-ocid="admin.transactions.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="admin.transactions.empty_state"
        >
          <p className="text-sm">No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="admin.transactions.table">
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((txn, i) => (
                <TransactionRow key={txn.id} txn={txn} index={i + 1} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
