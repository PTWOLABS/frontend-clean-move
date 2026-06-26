"use client";

import { useState } from "react";
import { CalendarDays, CalendarX, Eye, FileText, MoreVertical, TriangleAlert } from "lucide-react";

import { CatalogContentShell } from "@/shared/components/catalog-content-shell";
import { CatalogPagination } from "@/shared/components/catalog-pagination";
import { MobileDataCard, type MobileDataCardTone } from "@/shared/components/mobile-data-card";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";

import { quotesPageMock } from "../mocks";
import {
  DEFAULT_QUOTES_FILTERS,
  filterQuotesMock,
  type QuotesFiltersState,
} from "../lib/build-quotes-api-filters";
import { formatShortDate, getQuoteVehicleLabel, getQuoteVehiclePlate } from "../lib/utils";
import type { QuoteListItemDto } from "../types/quotes";
import { QuotesCatalogToolbar } from "./quotes-catalog-toolbar";

const PAGE_SIZE = 6;

const quoteStatusConfig: Record<
  QuoteListItemDto["status"],
  {
    label: string;
    tone: MobileDataCardTone;
    footerLabel: string;
  }
> = {
  APPROVED: {
    label: "Aprovado",
    tone: "success",
    footerLabel: "Expira em",
  },
  VALID: {
    label: "Válido",
    tone: "primary",
    footerLabel: "Expira em",
  },
  EXPIRES_TODAY: {
    label: "Vence hoje",
    tone: "warning",
    footerLabel: "Expira hoje",
  },
  EXPIRED: {
    label: "Vencido",
    tone: "danger",
    footerLabel: "Expirado em",
  },
};

const customerKindLabel: Record<QuoteListItemDto["customerKind"], string> = {
  CUSTOMER: "Cliente",
  PROSPECT: "Prospect",
};

function noop() {
  return undefined;
}

function QuoteMobileCard({ quote }: { quote: QuoteListItemDto }) {
  const status = quoteStatusConfig[quote.status];

  return (
    <MobileDataCard
      title={quote.customerName}
      value={formatBrlFromCents(quote.totalInCents)}
      status={{
        label: status.label,
        tone: status.tone,
      }}
      metadata={[
        {
          label: getQuoteVehiclePlate(quote),
          className: "font-mono",
        },
        {
          label: customerKindLabel[quote.customerKind],
          tone: quote.customerKind === "PROSPECT" ? "primary" : "neutral",
          className: "font-mono",
        },
      ]}
      description={getQuoteVehicleLabel(quote)}
      footer={{
        icon:
          status.tone === "danger"
            ? CalendarX
            : status.tone === "warning"
              ? TriangleAlert
              : CalendarDays,
        label:
          quote.status === "EXPIRES_TODAY"
            ? status.footerLabel
            : `${status.footerLabel} ${formatShortDate(quote.expiresAt)}`,
        tone: quote.status === "EXPIRED" ? "danger" : status.tone,
      }}
      accentTone={status.tone}
      actions={[
        {
          label: "Visualizar orçamento",
          icon: Eye,
          onClick: noop,
        },
        {
          label: "Gerar PDF",
          icon: FileText,
          onClick: noop,
        },
        {
          label: "Mais opções",
          icon: MoreVertical,
          onClick: noop,
        },
      ]}
    />
  );
}

export function QuotesMobileCards() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<QuotesFiltersState>(DEFAULT_QUOTES_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<QuotesFiltersState>(DEFAULT_QUOTES_FILTERS);
  const quotes = filterQuotesMock(quotesPageMock.quotes, appliedFilters);
  const totalItems = quotes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const visibleQuotes = quotes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleApplyFilters(nextFilters: QuotesFiltersState) {
    setAppliedFilters(nextFilters);
    setPage(1);
  }

  function handleClearFilters() {
    setFilters(DEFAULT_QUOTES_FILTERS);
    setAppliedFilters(DEFAULT_QUOTES_FILTERS);
    setPage(1);
  }

  return (
    <CatalogContentShell
      className="md:hidden"
      toolbar={
        <QuotesCatalogToolbar
          filters={filters}
          appliedFilters={appliedFilters}
          onFiltersChange={setFilters}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      }
      mobileCards={
        <div className="flex flex-col gap-3">
          {visibleQuotes.map((quote) => (
            <QuoteMobileCard key={quote.id} quote={quote} />
          ))}
        </div>
      }
      isEmpty={totalItems === 0}
      emptyMessage="Nenhum orcamento encontrado para os filtros atuais."
      pagination={
        <CatalogPagination
          page={page}
          totalPages={totalPages}
          total={totalItems}
          itemLabel={{ singular: "orçamento", plural: "orçamentos" }}
          onPageChange={setPage}
        />
      }
    />
  );
}
