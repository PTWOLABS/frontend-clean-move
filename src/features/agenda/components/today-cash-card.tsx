import { ArrowDownRight, ArrowUpRight, WalletCards } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/shared/utils/lib";
import { cn } from "@/shared/utils/cn";

export type TodayCashSummary = {
  balanceInCents: number;
  trendPercent: number;
  entriesInCents: number;
  exitsInCents: number;
};

type TodayCashCardProps = {
  summary: TodayCashSummary;
};

function formatTrendPercent(value: number) {
  const formattedValue = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(Math.abs(value));

  return `${value >= 0 ? "+" : "-"}${formattedValue}%`;
}

export function TodayCashCard({ summary }: TodayCashCardProps) {
  const isPositiveTrend = summary.trendPercent >= 0;
  const TrendIcon = isPositiveTrend ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="relative h-full overflow-hidden rounded-2xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <CardHeader className="px-4 pb-3 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <WalletCards className="size-4" aria-hidden />
              </span>
              Caixa de Hoje
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Entradas e saídas registradas no dia.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-5 pt-0 sm:px-6">
        <div className="space-y-2">
          <p className="font-display text-3xl font-semibold leading-none tracking-tight text-card-foreground sm:text-4xl">
            {formatCurrency(summary.balanceInCents)}
          </p>

          <p
            className={cn(
              "inline-flex items-center gap-1 text-sm font-semibold",
              isPositiveTrend ? "text-success" : "text-danger",
            )}
          >
            <TrendIcon className="size-4" aria-hidden />
            {formatTrendPercent(summary.trendPercent)} vs. ontem
          </p>
        </div>

        <dl className="mt-6 space-y-3 border-t border-border/70 pt-4">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Entradas</dt>
            <dd className="font-semibold tabular-nums text-success">
              {formatCurrency(summary.entriesInCents)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Saídas</dt>
            <dd className="font-semibold tabular-nums text-danger">
              {formatCurrency(summary.exitsInCents)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
