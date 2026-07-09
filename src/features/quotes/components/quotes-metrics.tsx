"use client";

import { BadgeCheck, CheckCircle2, Clock3, CircleX } from "lucide-react";

import { KpiCardsGrid, KpiCardsSkeleton, type KpiCardItem } from "@/shared/components/kpi-card";

import { useListQuotes } from "../hooks/queries/use-list-quotes";
import { quoteStatusConfig } from "../lib/quote-status-config";
import type { QuotesApiFilters } from "../types/api-filters";
import type { QuoteSummary } from "../types/quotes";

const SUMMARY_QUERY = { page: 1, size: 1 } satisfies QuotesApiFilters;

function buildQuoteKpis(summary: QuoteSummary): KpiCardItem[] {
  return [
    {
      id: "approved",
      label: "Aprovados",
      value: summary.approved,
      icon: BadgeCheck,
      description: "Convertidos",
      tone: quoteStatusConfig.APPROVED.tone,
    },
    {
      id: "valid",
      label: "Válidos",
      value: summary.valid,
      icon: CheckCircle2,
      description: "Dentro do prazo",
      tone: quoteStatusConfig.VALID.tone,
    },
    {
      id: "expires-today",
      label: "Vencem hoje",
      value: summary.expiresToday,
      icon: Clock3,
      description: "Prioridade do dia",
      tone: quoteStatusConfig.EXPIRES_TODAY.tone,
    },
    {
      id: "expired",
      label: "Vencidos",
      value: summary.expired,
      icon: CircleX,
      description: "Fora do prazo",
      tone: quoteStatusConfig.EXPIRED.tone,
    },
  ];
}

export function QuotesMetrics() {
  const { data, isError, isLoading } = useListQuotes(SUMMARY_QUERY);

  if (isLoading) {
    return <KpiCardsSkeleton />;
  }

  if (isError || !data?.summary) {
    return (
      <p className="rounded-lg border border-dashed border-danger/40 bg-danger-soft/40 px-4 py-8 text-center text-sm text-danger">
        Não foi possível carregar os indicadores de orçamentos.
      </p>
    );
  }

  return <KpiCardsGrid items={buildQuoteKpis(data.summary)} />;
}
