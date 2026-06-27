"use client";

import { Eye, FileText, MoreVertical } from "lucide-react";

import {
  DataCatalogStatusBadge,
  DataCatalogTable,
  type DataCatalogTableColumn,
  type DataCatalogTone,
} from "@/shared/components/data-catalog-table";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";

import { formatShortDate, getQuoteVehicleLabel, getQuoteVehiclePlate } from "../lib/utils";
import type { QuoteListItemDto } from "../types/quotes";

type QuotesCatalogTableProps = {
  quotes: QuoteListItemDto[];
  className?: string;
};

const quoteStatusConfig: Record<
  QuoteListItemDto["status"],
  {
    label: string;
    tone: DataCatalogTone;
  }
> = {
  APPROVED: {
    label: "Aprovado",
    tone: "success",
  },
  VALID: {
    label: "Válido",
    tone: "primary",
  },
  EXPIRES_TODAY: {
    label: "Vence hoje",
    tone: "warning",
  },
  EXPIRED: {
    label: "Vencido",
    tone: "danger",
  },
};

function noop() {
  return undefined;
}

function formatQuoteExpiration(quote: QuoteListItemDto): string {
  if (quote.status === "APPROVED" && quote.approvedAt) {
    return formatShortDate(quote.approvedAt);
  }

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
        <p className="truncate font-medium text-foreground max-w-90">{quote.customerName}</p>
        <p className="text-xs font-medium text-muted-foreground">
          {quote.customerKind === "PROSPECT" ? "Prospect" : "Cliente"}
        </p>
      </div>
    ),
    className: "w-[24%]",
  },
  {
    id: "vehicle",
    header: "Veículo",
    cell: (quote) => (
      <div className="min-w-0 space-y-1">
        <p className="truncate font-medium text-foreground max-w-90">
          {getQuoteVehicleLabel(quote)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">{getQuoteVehiclePlate(quote)}</p>
      </div>
    ),
    className: "w-[18%]",
  },
  {
    id: "services",
    header: "Serviços",
    cell: (quote) => (
      <span className="text-muted-foreground">{formatServicesCount(quote.servicesCount)}</span>
    ),
    className: "w-[16%]",
  },
  {
    id: "total",
    header: "Valor total",
    cell: (quote) => (
      <span className="font-semibold tabular-nums text-foreground">
        {formatBrlFromCents(quote.totalInCents)}
      </span>
    ),
    className: "w-[14%]",
  },
  {
    id: "validity",
    header: "Validade",
    cell: (quote) => (
      <span className="tabular-nums text-muted-foreground">{formatQuoteExpiration(quote)}</span>
    ),
    className: "w-[12%]",
  },
  {
    id: "status",
    header: "Status",
    cell: (quote) => {
      const status = quoteStatusConfig[quote.status];

      return <DataCatalogStatusBadge tone={status.tone}>{status.label}</DataCatalogStatusBadge>;
    },
    className: "w-[12%]",
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
          label: "Gerar PDF",
          icon: FileText,
          onClick: noop,
          tone: "neutral",
        },
        {
          label: "Mais opções",
          icon: MoreVertical,
          onClick: noop,
          tone: "neutral",
        },
      ]}
    />
  );
}
