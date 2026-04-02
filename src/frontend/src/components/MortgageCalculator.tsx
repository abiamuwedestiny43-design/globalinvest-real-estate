import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";
import { useMemo, useState } from "react";

interface MortgageCalculatorProps {
  price: number;
  currency: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MortgageCalculator({
  price,
  currency,
}: MortgageCalculatorProps) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState("6.5");
  const [termYears, setTermYears] = useState("30");

  const monthly = useMemo(() => {
    const r = Number.parseFloat(rate) / 100 / 12;
    const n = Number.parseInt(termYears) * 12;
    const P = price * (1 - downPct / 100);
    if (r === 0 || n === 0) return P / (n || 1);
    return (P * (r * (1 + r) ** n)) / ((1 + r) ** n - 1);
  }, [price, downPct, rate, termYears]);

  const downAmount = price * (downPct / 100);
  const loanAmount = price - downAmount;

  return (
    <div className="space-y-5" data-ocid="mortgage.panel">
      <h3 className="font-display text-base font-semibold flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" />
        Mortgage Calculator
      </h3>

      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Home Price
        </Label>
        <div className="mt-1 px-3 py-2 bg-muted rounded-lg text-sm font-semibold">
          {formatCurrency(price, currency)}
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Down Payment
          </Label>
          <span className="text-xs font-semibold text-primary">
            {downPct}% — {formatCurrency(downAmount, currency)}
          </span>
        </div>
        <Slider
          min={0}
          max={50}
          step={1}
          value={[downPct]}
          onValueChange={([val]) => setDownPct(val)}
          className="mt-1"
          data-ocid="mortgage.downpayment.toggle"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor="mort-rate"
            className="text-xs text-muted-foreground uppercase tracking-wide"
          >
            Interest Rate
          </Label>
          <div className="relative mt-1">
            <Input
              id="mort-rate"
              type="number"
              step="0.1"
              min="0"
              max="30"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="pr-6"
              data-ocid="mortgage.rate.input"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              %
            </span>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Loan Term
          </Label>
          <Select value={termYears} onValueChange={setTermYears}>
            <SelectTrigger className="mt-1" data-ocid="mortgage.term.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 15, 20, 25, 30].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y} years
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-primary/10 rounded-xl p-4 text-center border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">
          Estimated Monthly Payment
        </p>
        <p
          className="font-display text-2xl font-bold text-primary"
          data-ocid="mortgage.result.panel"
        >
          {formatCurrency(monthly, currency)}
          <span className="text-sm font-normal text-muted-foreground">/mo</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Loan: {formatCurrency(loanAmount, currency)} over {termYears} yrs
        </p>
      </div>
    </div>
  );
}
