"use client";

import { useMemo, useState } from "react";
import { Calendar, CalendarDays, CalendarX, Check, Eye, TriangleAlert } from "lucide-react";

import { CatalogContentShell } from "@/shared/components/catalog-content-shell";
import { CatalogPagination } from "@/shared/components/catalog-pagination";
import { DataCatalogTableSkeleton } from "@/shared/components/data-catalog-table";
import { MobileDataCard, MobileDataCardSkeleton } from "@/shared/components/mobile-data-card";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";
import { cn } from "@/shared/utils/cn";

import { useListQuotes } from "../hooks/queries/use-list-quotes";
import {
  DEFAULT_QUOTES_FILTERS,
  buildQuotesApiFilters,
  type QuotesFiltersState,
} from "../lib/build-quotes-api-filters";
import { quoteStatusConfig } from "../lib/quote-status-config";
import { resolveListQuotesErrorFeedback } from "../lib/list-quotes-error-feedback";
import { formatShortDate, getQuoteVehicleLabel, getQuoteVehiclePlate } from "../lib/utils";
import type { QuoteListItemDto } from "../types/quotes";
import { QuotesCatalogToolbar } from "./quotes-catalog-toolbar";
import { QuotesCatalogTable } from "./quotes-catalog-table";
import { QuoteMoreOptions } from "./quote-more-options";
import { QuoteApprovalVerificationDialog } from "./analyze/quote-approval-verification-dialog";
import { useAnalyzeQuoteApproval } from "../hooks/mutations/use-analyze-quote-approval";

const PAGE_SIZE = 5;

const customerKindLabel: Record<QuoteListItemDto["customerKind"], string> = {
  CUSTOMER: "Cliente",
  PROSPECT: "Prospect",
};

function noop() {
  return undefined;
}

function getQuoteFooterLabel(quote: QuoteListItemDto): string {
  const status = quoteStatusConfig[quote.status];

  if (quote.status === "EXPIRES_TODAY") {
    return status.footerLabel;
  }

  if (quote.status === "APPROVED") {
    return quote.approvedAt
      ? `${status.footerLabel} ${formatShortDate(quote.approvedAt)}`
      : "Aprovado";
  }

  return quote.expiresAt
    ? `${status.footerLabel} ${formatShortDate(quote.expiresAt)}`
    : "Não expira";
}

function QuoteMobileCard({
  quote,
  onApprove,
  isApprovalActionDisabled = false,
}: {
  quote: QuoteListItemDto;
  onApprove: (quote: QuoteListItemDto) => void;
  isApprovalActionDisabled?: boolean;
}) {
  const status = quoteStatusConfig[quote.status];
  const canApprove = quote.status === "VALID" || quote.status === "EXPIRES_TODAY";

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
      description={
        <>
          <span className="block truncate">{getQuoteVehicleLabel(quote)}</span>
          <span className="mt-2 flex gap-1 text-xs">
            <Calendar size={14} />
            Criado {formatShortDate(quote.createdAt)}
          </span>
        </>
      }
      footer={{
        icon:
          status.tone === "danger"
            ? CalendarX
            : status.tone === "warning"
              ? TriangleAlert
              : CalendarDays,
        label: getQuoteFooterLabel(quote),
        tone: quote.status === "EXPIRED" ? "danger" : status.tone,
      }}
      accentTone={status.tone}
      actions={[
        {
          label: "Visualizar orçamento",
          icon: Eye,
          onClick: noop,
        },
        ...(canApprove
          ? [
              {
                label: "Aprovar orçamento",
                icon: Check,
                onClick: () => onApprove(quote),
                disabled: isApprovalActionDisabled,
                tone: "success" as const,
              },
            ]
          : []),
        {
          label: "Mais opções",
          render: <QuoteMoreOptions quote={quote} variant="mobile" />,
        },
      ]}
    />
  );
}

type QuotesCatalogContentProps = {
  className?: string;
  tableClassName?: string;
  mobileCardsClassName?: string;
};

export function QuotesCatalogContent({
  className,
  tableClassName,
  mobileCardsClassName,
}: QuotesCatalogContentProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<QuotesFiltersState>(DEFAULT_QUOTES_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<QuotesFiltersState>(DEFAULT_QUOTES_FILTERS);
  const [approvalQuote, setApprovalQuote] = useState<QuoteListItemDto | null>(null);
  const apiFilters = useMemo(
    () => buildQuotesApiFilters(appliedFilters, { page, size: PAGE_SIZE }),
    [appliedFilters, page],
  );
  const { data, error, isError, isPending, isPlaceholderData } = useListQuotes(apiFilters);
  const quotes = data?.quotes ?? [];
  const totalItems = data?.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const isFetchingPage = isPending || isPlaceholderData;
  const errorFeedback = isError ? resolveListQuotesErrorFeedback(error) : null;

  const {
    mutate: analyzeQuoteApproval,
    data: analyzeQuoteApprovalResult,
    isPending: analyzingQuoteApproval,
    reset: resetAnalyzeQuoteApproval,
  } = useAnalyzeQuoteApproval();

  function handleApplyFilters(nextFilters: QuotesFiltersState) {
    setAppliedFilters(nextFilters);
    setPage(1);
  }

  function handleClearFilters() {
    setFilters(DEFAULT_QUOTES_FILTERS);
    setAppliedFilters(DEFAULT_QUOTES_FILTERS);
    setPage(1);
  }

  function handleApproveQuote(quote: QuoteListItemDto) {
    setApprovalQuote(quote);
    resetAnalyzeQuoteApproval();
    analyzeQuoteApproval(
      { quoteId: quote.id, startsAt: new Date().toISOString() },
      {
        onError: () => {
          setApprovalQuote(null);
        },
      },
    );
  }

  function handleApprovalDialogOpenChange(open: boolean) {
    if (open) return;

    setApprovalQuote(null);
    resetAnalyzeQuoteApproval();
  }

  return (
    <>
      <CatalogContentShell
        className={className}
        toolbar={
          <QuotesCatalogToolbar
            filters={filters}
            appliedFilters={appliedFilters}
            onFiltersChange={setFilters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        }
        table={
          <QuotesCatalogTable
            quotes={quotes}
            onApprove={handleApproveQuote}
            isApprovalActionDisabled={analyzingQuoteApproval}
            className={tableClassName}
          />
        }
        mobileCards={
          <div className={cn("flex flex-col gap-3", mobileCardsClassName)}>
            {quotes.map((quote) => (
              <QuoteMobileCard
                key={quote.id}
                quote={quote}
                onApprove={handleApproveQuote}
                isApprovalActionDisabled={analyzingQuoteApproval}
              />
            ))}
          </div>
        }
        skeleton={
          <>
            <DataCatalogTableSkeleton className={tableClassName} columns={7} />
            <div className={cn("flex flex-col gap-3", mobileCardsClassName)}>
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <MobileDataCardSkeleton key={index} />
              ))}
            </div>
          </>
        }
        emptyState={
          isError ? (
            <p className="rounded-lg border border-dashed border-danger/40 bg-danger-soft/40 px-4 py-8 text-center text-sm text-danger">
              <strong className="block">{errorFeedback?.title}</strong>
              <span className="mt-1 block">{errorFeedback?.description}</span>
            </p>
          ) : undefined
        }
        isLoading={isPending}
        isFetching={isPlaceholderData}
        isEmpty={!isFetchingPage && (isError || totalItems === 0)}
        emptyMessage="Nenhum orçamento encontrado para os filtros atuais."
        pagination={
          <CatalogPagination
            page={page}
            totalPages={totalPages}
            total={totalItems}
            itemLabel={{ singular: "orçamento", plural: "orçamentos" }}
            isFetching={isFetchingPage}
            onPageChange={setPage}
          />
        }
      />
      {approvalQuote ? (
        <QuoteApprovalVerificationDialog
          quote={approvalQuote}
          analysis={analyzeQuoteApprovalResult?.analysis ?? null}
          isAnalyzing={analyzingQuoteApproval}
          open
          onOpenChange={handleApprovalDialogOpenChange}
        />
      ) : null}
    </>
  );
}

export function QuotesMobileCards() {
  return <QuotesCatalogContent mobileCardsClassName="md:flex" tableClassName="hidden" />;
}
