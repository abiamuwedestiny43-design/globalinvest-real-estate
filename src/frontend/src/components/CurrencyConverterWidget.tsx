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
import { ArrowLeftRight, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

export const CURRENCY_OPTIONS = [
  { code: "USD", name: "US Dollar (USD)" },
  { code: "EUR", name: "Euro (EUR)" },
  { code: "AED", name: "UAE Dirham (AED)" },
  { code: "GBP", name: "British Pound (GBP)" },
  { code: "JPY", name: "Japanese Yen (JPY)" },
  { code: "SGD", name: "Singapore Dollar (SGD)" },
  { code: "INR", name: "Indian Rupee (INR)" },
  { code: "CNY", name: "Chinese Yuan (CNY)" },
  { code: "CHF", name: "Swiss Franc (CHF)" },
  { code: "AUD", name: "Australian Dollar (AUD)" },
  { code: "CAD", name: "Canadian Dollar (CAD)" },
  { code: "HKD", name: "Hong Kong Dollar (HKD)" },
  { code: "KRW", name: "South Korean Won (KRW)" },
  { code: "SAR", name: "Saudi Riyal (SAR)" },
  { code: "QAR", name: "Qatari Riyal (QAR)" },
  { code: "KWD", name: "Kuwaiti Dinar (KWD)" },
  { code: "BRL", name: "Brazilian Real (BRL)" },
  { code: "ZAR", name: "South African Rand (ZAR)" },
  { code: "TRY", name: "Turkish Lira (TRY)" },
  { code: "MXN", name: "Mexican Peso (MXN)" },
  { code: "RUB", name: "Russian Ruble (RUB)" },
  { code: "NOK", name: "Norwegian Krone (NOK)" },
  { code: "SEK", name: "Swedish Krona (SEK)" },
  { code: "DKK", name: "Danish Krone (DKK)" },
];

// Static exchange rates relative to USD
const RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  AED: 3.67,
  GBP: 0.79,
  JPY: 149.5,
  SGD: 1.34,
  INR: 83.1,
  CNY: 7.24,
  CHF: 0.88,
  AUD: 1.53,
  CAD: 1.36,
  HKD: 7.82,
  KRW: 1325.0,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.307,
  BRL: 4.97,
  ZAR: 18.63,
  TRY: 32.1,
  MXN: 17.15,
  RUB: 90.5,
  NOK: 10.55,
  SEK: 10.42,
  DKK: 6.89,
};

function formatResult(value: number, code: string): string {
  if (value === 0) return "0";
  if (code === "KRW" || code === "JPY") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function CurrencyConverterWidget() {
  const [amount, setAmount] = useState("100000");
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("AED");

  const converted = useMemo(() => {
    const num = Number.parseFloat(amount);
    if (Number.isNaN(num) || num < 0) return null;
    const inUSD = num / (RATES_TO_USD[fromCode] ?? 1);
    const result = inUSD * (RATES_TO_USD[toCode] ?? 1);
    return result;
  }, [amount, fromCode, toCode]);

  function handleSwap() {
    setFromCode(toCode);
    setToCode(fromCode);
  }

  const rate =
    RATES_TO_USD[toCode] != null && RATES_TO_USD[fromCode] != null
      ? (RATES_TO_USD[toCode] / RATES_TO_USD[fromCode]).toFixed(4)
      : null;

  return (
    <section
      className="py-16"
      aria-label="Currency Converter"
      data-ocid="currency_converter.section"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            Multi-Currency Support
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Currency Converter
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
            Instantly convert property values across{" "}
            <span className="text-primary font-medium">
              24 global currencies
            </span>{" "}
            to find your ideal investment.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div
            className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-[oklch(0.2_0.04_220)] to-[oklch(0.18_0.05_240)] shadow-2xl overflow-hidden"
            data-ocid="currency_converter.card"
          >
            {/* Glowing accent */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
            </div>

            <div className="relative p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-white/80">
                  Live Rates — Updated Daily
                </span>
                <span className="ml-auto text-xs text-white/40">
                  Indicative rates
                </span>
              </div>

              {/* Amount input */}
              <div className="mb-5">
                <Label className="text-white/70 text-xs mb-1.5 block">
                  Amount
                </Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-lg font-semibold h-12 focus:border-primary focus-visible:ring-primary/40"
                  data-ocid="currency_converter.input"
                />
              </div>

              {/* Currency selectors + swap */}
              <div className="flex items-end gap-3 mb-6">
                <div className="flex-1">
                  <Label className="text-white/70 text-xs mb-1.5 block">
                    From
                  </Label>
                  <Select value={fromCode} onValueChange={setFromCode}>
                    <SelectTrigger
                      className="bg-white/10 border-white/20 text-white h-11 focus:ring-primary/40"
                      data-ocid="currency_converter.from.select"
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
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleSwap}
                  className="shrink-0 mb-0.5 text-white/60 hover:text-white hover:bg-white/10 border border-white/20"
                  aria-label="Swap currencies"
                  data-ocid="currency_converter.swap.button"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>

                <div className="flex-1">
                  <Label className="text-white/70 text-xs mb-1.5 block">
                    To
                  </Label>
                  <Select value={toCode} onValueChange={setToCode}>
                    <SelectTrigger
                      className="bg-white/10 border-white/20 text-white h-11 focus:ring-primary/40"
                      data-ocid="currency_converter.to.select"
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
              </div>

              {/* Result */}
              <div
                className="rounded-xl bg-white/5 border border-white/10 px-5 py-4"
                data-ocid="currency_converter.result"
              >
                {converted !== null ? (
                  <>
                    <p className="text-white/50 text-xs mb-1">
                      {amount || "0"}{" "}
                      {CURRENCY_OPTIONS.find((c) => c.code === fromCode)?.name}{" "}
                      equals
                    </p>
                    <p className="text-3xl font-display font-bold text-white">
                      {formatResult(converted, toCode)}
                    </p>
                    {rate && (
                      <p className="text-white/40 text-xs mt-2">
                        1 {fromCode} = {rate} {toCode}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-white/40 text-sm">
                    Enter a valid amount to convert
                  </p>
                )}
              </div>

              <p className="text-white/25 text-[10px] mt-3 text-center">
                Rates are indicative and for reference only. Contact your bank
                for live transaction rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
