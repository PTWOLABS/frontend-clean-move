"use client";

import { useState } from "react";
import { CalendarDays, Eye, FileText, MoreVertical } from "lucide-react";

import { CatalogContentShell } from "@/shared/components/catalog-content-shell";
import { CatalogPagination } from "@/shared/components/catalog-pagination";
import { MobileDataCard, type MobileDataCardTone } from "@/shared/components/mobile-data-card";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";

import { quotesPageMock } from "../mocks";
import type { ListQuotesResponseDto } from "../types/quotes";
import { formatShortDate, getQuoteVehicleLabel, getQuoteVehiclePlate } from "../lib/utils";

export type QuoteListItem = ListQuotesResponseDto["quotes"][number];

const PAGE_SIZE = 6;

const quoteStatusConfig: Record<
  QuoteListItem["status"],
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

const customerKindLabel: Record<QuoteListItem["customerKind"], string> = {
  CUSTOMER: "Cliente",
  PROSPECT: "Prospect",
};

function noop() {
  return undefined;
}

function QuoteMobileCard({ quote }: { quote: QuoteListItem }) {
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
        icon: CalendarDays,
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
  const quotes = quotesPageMock.quotes;
  const totalPages = Math.max(1, Math.ceil(quotesPageMock.totalItems / PAGE_SIZE));

  return (
    <CatalogContentShell
      className="md:hidden"
      mobileCards={
        <div className="flex flex-col gap-3">
          {quotes.map((quote) => (
            <QuoteMobileCard key={quote.id} quote={quote} />
          ))}
        </div>
      }
      isEmpty={quotes.length === 0}
      emptyMessage="Nenhum orcamento encontrado para os filtros atuais."
      pagination={
        <CatalogPagination
          page={page}
          totalPages={totalPages}
          total={quotesPageMock.totalItems}
          itemLabel={{ singular: "orçamento", plural: "orçamentos" }}
          onPageChange={setPage}
        />
      }
    />
  );
}
