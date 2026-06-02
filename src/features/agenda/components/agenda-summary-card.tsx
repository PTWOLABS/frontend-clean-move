"use client";

import { CalendarCheck2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";

export type AgendaSummary = {
  total: number;
  scheduled: number;
  done: number;
  cancelled: number;
  completionRate: number;
};

type AgendaSummaryCardProps = {
  summary?: AgendaSummary;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
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

const entranceEase = [0.16, 1, 0.3, 1] as const;

function normalizePercent(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(value, 100));
}

export function AgendaSummaryCard({
  summary,
  isLoading = false,
  isError = false,
  onRetry,
}: AgendaSummaryCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const completionRate = normalizePercent(summary?.completionRate);
  const contentMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.12, ease: "easeOut" as const },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: entranceEase },
      };

  function getRowMotion(index: number) {
    return shouldReduceMotion
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.12, ease: "easeOut" as const },
        }
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.24, ease: entranceEase, delay: 0.08 + index * 0.04 },
        };
  }

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
              Volume e evolução dos agendamentos no mês atual.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col px-4 pb-5 pt-0 sm:px-6">
        {isLoading ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-y-3 border-t border-border/70 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="border-t border-border/70 pt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-3 h-2 w-full rounded-full" />
            </div>
          </div>
        ) : isError || !summary ? (
          <div className="flex min-h-52 flex-col justify-center rounded-2xl border border-dashed border-border/70 bg-background/45 p-5">
            <p className="font-medium text-card-foreground">Não foi possível carregar o resumo.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize os dados para tentar novamente.
            </p>
            {onRetry ? (
              <Button
                className="mt-4 h-10 w-fit rounded-xl px-4"
                variant="outline"
                onClick={onRetry}
              >
                Tentar novamente
              </Button>
            ) : null}
          </div>
        ) : (
          <motion.div {...contentMotion} className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-2">
              <p className="font-display text-3xl font-semibold leading-none tracking-tight text-card-foreground sm:text-4xl">
                {summary.total}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                {summary.total === 1 ? "agendamento" : "agendamentos"} no mês atual
              </p>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border/70 pt-4">
              {summaryRows.map((row, index) => (
                <motion.div
                  key={row.key}
                  {...getRowMotion(index)}
                  className="flex items-center justify-between gap-4"
                >
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className={cn("font-semibold tabular-nums", row.className)}>
                    {summary[row.key]}
                  </dd>
                </motion.div>
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
                <motion.div
                  initial={{ width: shouldReduceMotion ? `${completionRate}%` : "0%" }}
                  animate={{ width: `${completionRate}%` }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.12, ease: "easeOut" as const }
                      : { duration: 0.65, ease: entranceEase, delay: 0.18 }
                  }
                  className="h-full rounded-full bg-success transition-[width] duration-300"
                />
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
