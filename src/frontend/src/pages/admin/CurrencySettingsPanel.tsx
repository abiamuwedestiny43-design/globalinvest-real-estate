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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  CURRENCY_LIST,
  CURRENCY_NAMES,
  currencyLabel,
} from "../../lib/currencies";

const ALL_CURRENCIES = CURRENCY_LIST;

interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated: string;
  editing: boolean;
}

const INITIAL_RATES: ExchangeRate[] = [
  {
    currency: "EUR",
    rate: 0.9201,
    lastUpdated: "2026-04-01 08:00",
    editing: false,
  },
  {
    currency: "GBP",
    rate: 0.7843,
    lastUpdated: "2026-04-01 08:00",
    editing: false,
  },
  {
    currency: "NGN",
    rate: 1540.5,
    lastUpdated: "2026-04-01 08:00",
    editing: false,
  },
  {
    currency: "JPY",
    rate: 151.23,
    lastUpdated: "2026-04-01 08:00",
    editing: false,
  },
  {
    currency: "CAD",
    rate: 1.3642,
    lastUpdated: "2026-04-01 08:00",
    editing: false,
  },
  {
    currency: "AUD",
    rate: 1.5201,
    lastUpdated: "2026-04-01 08:00",
    editing: false,
  },
  {
    currency: "SGD",
    rate: 1.341,
    lastUpdated: "2026-04-01 08:00",
    editing: false,
  },
  {
    currency: "AED",
    rate: 3.673,
    lastUpdated: "2026-04-01 08:00",
    editing: false,
  },
];

export default function CurrencySettingsPanel() {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [supported, setSupported] = useState([
    "USD",
    "EUR",
    "GBP",
    "NGN",
    "AED",
  ]);
  const [addCurrency, setAddCurrency] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [rates, setRates] = useState<ExchangeRate[]>(INITIAL_RATES);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  function addSupportedCurrency() {
    if (addCurrency && !supported.includes(addCurrency)) {
      setSupported((prev) => [...prev, addCurrency]);
      setAddCurrency("");
      toast.success(`${addCurrency} added to supported currencies.`);
    }
  }

  function removeCurrency(c: string) {
    setSupported((prev) => prev.filter((x) => x !== c));
    toast.success(`${c} removed.`);
  }

  function startEdit(currency: string, currentRate: number) {
    setEditValues((prev) => ({ ...prev, [currency]: String(currentRate) }));
    setRates((prev) =>
      prev.map((r) => (r.currency === currency ? { ...r, editing: true } : r)),
    );
  }

  function saveEdit(currency: string) {
    const newRate = Number.parseFloat(editValues[currency] ?? "0");
    setRates((prev) =>
      prev.map((r) =>
        r.currency === currency
          ? {
              ...r,
              rate: newRate,
              lastUpdated: "2026-04-01 (manual)",
              editing: false,
            }
          : r,
      ),
    );
    toast.success(`Rate for ${currency} updated.`);
  }

  function refreshRates() {
    setRates((prev) =>
      prev.map((r) => ({ ...r, lastUpdated: "2026-04-01 (refreshed)" })),
    );
    toast.success("Exchange rates refreshed from API.");
  }

  return (
    <section aria-labelledby="currency-heading">
      <div className="space-y-6">
        {/* Base currency */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs">
          <h2
            id="currency-heading"
            className="font-display font-semibold text-lg flex items-center gap-2 mb-4"
          >
            <DollarSign className="w-5 h-5 text-primary" />
            Currency & Exchange Settings
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="base-currency" className="text-sm font-medium">
                Base Currency
              </Label>
              <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                <SelectTrigger
                  id="base-currency"
                  data-ocid="currency.base.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {currencyLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All exchange rates are relative to this currency.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Supported Currencies
              </Label>
              <div className="flex flex-wrap gap-2">
                {supported.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="bg-primary/10 text-primary pr-1 flex items-center gap-1"
                  >
                    {currencyLabel(c)}
                    {c !== baseCurrency && (
                      <button
                        type="button"
                        onClick={() => removeCurrency(c)}
                        className="hover:text-destructive ml-0.5"
                        aria-label={`Remove ${c}`}
                        data-ocid="currency.remove.button"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Select value={addCurrency} onValueChange={setAddCurrency}>
                  <SelectTrigger
                    className="h-8 w-36"
                    data-ocid="currency.add.select"
                  >
                    <SelectValue placeholder="Add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CURRENCIES.filter((c) => !supported.includes(c)).map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {currencyLabel(c)}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addSupportedCurrency}
                  className="h-8"
                  data-ocid="currency.add.button"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Exchange rate overrides */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-medium text-sm">
              Exchange Rate Overrides (Base: {baseCurrency})
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                  data-ocid="currency.auto-refresh.switch"
                />
                <Label htmlFor="auto-refresh" className="text-xs">
                  Auto-refresh rates
                </Label>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={refreshRates}
                data-ocid="currency.refresh.button"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Now
              </Button>
            </div>
          </div>
          <Table data-ocid="currency.rates.table">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Currency
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Rate (per 1 {baseCurrency})
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Last Updated
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((r, i) => (
                <TableRow
                  key={r.currency}
                  className="hover:bg-accent/40 transition-colors"
                  data-ocid={`currency.rate.item.${i + 1}`}
                >
                  <TableCell className="font-medium">
                    {CURRENCY_NAMES[r.currency]
                      ? `${CURRENCY_NAMES[r.currency]} (${r.currency})`
                      : r.currency}
                  </TableCell>
                  <TableCell>
                    {r.editing ? (
                      <Input
                        value={editValues[r.currency] ?? String(r.rate)}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [r.currency]: e.target.value,
                          }))
                        }
                        className="h-7 w-32 text-sm"
                        data-ocid="currency.rate.input"
                      />
                    ) : (
                      <span>{r.rate.toFixed(4)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.lastUpdated}
                  </TableCell>
                  <TableCell>
                    {r.editing ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-primary text-primary"
                        onClick={() => saveEdit(r.currency)}
                        data-ocid={`currency.save.button.${i + 1}`}
                      >
                        <Save className="w-3 h-3 mr-1" /> Save
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => startEdit(r.currency, r.rate)}
                        data-ocid={`currency.edit.button.${i + 1}`}
                      >
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
