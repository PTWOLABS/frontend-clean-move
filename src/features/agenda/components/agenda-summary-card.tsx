import { CalendarCheck2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

export type AgendaSummary = {
  total: number;
  scheduled: number;
  done: number;
  cancelled: number;
};

type AgendaSummaryCardProps = {
  summary: AgendaSummary;
};

const summaryRows: Array<{
  key: keyof Pick<AgendaSummary, "scheduled" | "done" | "cancelled">;
  label: string;
  className: string;
}> = [
  {
    key: "scheduled",
    label: "Agendados",
    className: "text-info",
  },
  {
    key: "done",
    label: "Concluídos",
    className: "text-success",
  },
  {
    key: "cancelled",
    label: "Cancelados",
    className: "text-danger",
  },
];

function getCompletionRate(summary: AgendaSummary) {
  if (summary.total <= 0) {
    return 0;
  }

  return Math.round((summary.done / summary.total) * 100);
}

export function AgendaSummaryCard({ summary }: AgendaSummaryCardProps) {
  const completionRate = getCompletionRate(summary);

  return (
    <Card className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <CardHeader className="shrink-0 px-4 pb-3 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <CalendarCheck2 className="size-4" aria-hidden />
              </span>
              Resumo da Agenda
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Volume e evolução dos agendamentos no recorte atual.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col px-4 pb-5 pt-0 sm:px-6">
        <div className="space-y-2">
          <p className="font-display text-3xl font-semibold leading-none tracking-tight text-card-foreground sm:text-4xl">
            {summary.total}
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            {summary.total === 1 ? "agendamento" : "agendamentos"} no período
          </p>
        </div>

        <dl className="mt-6 space-y-3 border-t border-border/70 pt-4">
          {summaryRows.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className={cn("font-semibold tabular-nums", row.className)}>
                {summary[row.key]}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto border-t border-border/70 pt-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <p className="text-muted-foreground">Taxa de conclusão</p>
            <p className="font-semibold tabular-nums text-card-foreground">{completionRate}%</p>
          </div>
          <div
            aria-label={`Taxa de conclusão: ${completionRate}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={completionRate}
            className="mt-3 h-2 rounded-full bg-muted"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-success transition-[width] duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
