import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/shared/utils/lib";

export type PendingBudgetItem = {
  id: string;
  title: string;
  sentAtLabel: string;
  amountInCents: number;
};

type PendingBudgetsCardProps = {
  budgets: PendingBudgetItem[];
};

export function PendingBudgetsCard({ budgets }: PendingBudgetsCardProps) {
  const visibleBudgets = budgets.slice(0, 3);

  return (
    <Card className="relative h-full overflow-hidden rounded-2xl border-border/80 bg-card/80 shadow-card backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent"
      />

      <CardHeader className="px-4 pb-3 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-muted-foreground">
                <FileText className="size-4" aria-hidden />
              </span>
              Orçamentos Pendentes
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Propostas enviadas aguardando retorno.
            </p>
          </div>

          <Badge
            variant="outline"
            className="rounded-full border-border/70 bg-muted/45 px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            {budgets.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-5 pt-0 sm:px-6">
        {visibleBudgets.length ? (
          <ol className="space-y-3">
            {visibleBudgets.map((budget) => (
              <li
                key={budget.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/45 p-3 transition-colors hover:border-accent/40 hover:bg-accent-soft/20"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-card-foreground">
                    {budget.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {budget.sentAtLabel}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold tabular-nums text-card-foreground/85">
                  {formatCurrency(budget.amountInCents)}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
            <p className="font-medium text-card-foreground">Nenhum orçamento pendente.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              As propostas aguardando resposta aparecerão aqui.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
