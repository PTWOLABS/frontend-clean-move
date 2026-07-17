"use client";

import { Check, Eye } from "lucide-react";

import {
  DataCatalogStatusBadge,
  DataCatalogTable,
  type DataCatalogTableColumn,
} from "@/shared/components/data-catalog-table";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";

import { quoteStatusConfig } from "../lib/quote-status-config";
import { formatShortDate, getQuoteVehicleLabel, getQuoteVehiclePlate } from "../lib/utils";
import type { QuoteListItemDto } from "../types/quotes";
import { QuoteMoreOptions } from "./quote-more-options";

type QuotesCatalogTableProps = {
  quotes: QuoteListItemDto[];
  className?: string;
};

function noop() {
  return undefined;
}

function formatQuoteExpiration(quote: QuoteListItemDto): string {
  if (!quote.expiresAt) {
    return "Não expira";
  }

  return formatShortDate(quote.expiresAt);
}

function formatServicesCount(servicesCount: QuoteListItemDto["servicesCount"]): string {
  if (!servicesCount) {
    return "Não informado";
  }

  return servicesCount === 1 ? "1 serviço" : `${servicesCount} serviços`;
}

const columns: DataCatalogTableColumn<QuoteListItemDto>[] = [
  {
    id: "customer",
    header: "Cliente",
    cell: (quote) => (
      <div className="min-w-0 space-y-1">
        <p className="max-w-90 truncate font-medium text-foreground">{quote.customerName}</p>
        <p className="text-xs font-medium text-muted-foreground">
          {quote.customerKind === "PROSPECT" ? "Prospect" : "Cliente"}
        </p>
      </div>
    ),
    className: "w-[22%]",
  },
  {
    id: "vehicle",
    header: "Veículo",
    cell: (quote) => (
      <div className="min-w-0 space-y-1">
        <p className="max-w-90 truncate font-medium text-foreground">
          {getQuoteVehicleLabel(quote)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">{getQuoteVehiclePlate(quote)}</p>
      </div>
    ),
    className: "w-[16%]",
  },
  {
    id: "services",
    header: "Serviços",
    cell: (quote) => (
      <span className="text-muted-foreground">{formatServicesCount(quote.servicesCount)}</span>
    ),
    className: "w-[13%]",
  },
  {
    id: "createdAt",
    header: "Criação",
    cell: (quote) => (
      <span className="tabular-nums text-muted-foreground">{formatShortDate(quote.createdAt)}</span>
    ),
    className: "w-[11%]",
  },
  {
    id: "total",
    header: "Valor total",
    cell: (quote) => (
      <span className="font-semibold tabular-nums text-foreground">
        {formatBrlFromCents(quote.totalInCents)}
      </span>
    ),
    className: "w-[13%]",
  },
  {
    id: "validity",
    header: "Validade",
    cell: (quote) => (
      <span className="tabular-nums text-muted-foreground">{formatQuoteExpiration(quote)}</span>
    ),
    className: "w-[10%]",
  },
  {
    id: "status",
    header: "Status",
    cell: (quote) => {
      const status = quoteStatusConfig[quote.status];

      return <DataCatalogStatusBadge tone={status.tone}>{status.label}</DataCatalogStatusBadge>;
    },
    className: "w-[11%]",
  },
];

export function QuotesCatalogTable({ quotes, className }: QuotesCatalogTableProps) {
  return (
    <DataCatalogTable
      className={className}
      ariaLabel="Tabela de orçamentos"
      items={quotes}
      columns={columns}
      getRowId={(quote) => quote.id}
      actions={[
        {
          label: "Visualizar orçamento",
          icon: Eye,
          onClick: noop,
          tone: "neutral",
        },
        {
          label: "Aprovar orçamento",
          icon: Check,
          onClick: noop,
          visible: (quote) => quote.status === "VALID" || quote.status === "EXPIRES_TODAY",
          tone: "success",
        },
        {
          label: "Mais opções",
          render: (quote) => <QuoteMoreOptions quote={quote} variant="table" />,
        },
      ]}
    />
  );
}
