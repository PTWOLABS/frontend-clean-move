import { Copy, Pencil, Power, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  formatEstimatedDuration,
  formatServiceCategory,
  formatServicePriceBrl,
} from "../lib/format-catalog";
import type { EstablishmentServiceItem } from "../types";

import { ServiceStatusBadge } from "./service-status-badge";

function serviceRowKey(item: EstablishmentServiceItem, index: number): string {
  return item.id ?? `${item.serviceName}-${item.category}-${index}`;
}

function PlaceholderThumb() {
  return <div className="size-10 shrink-0 rounded-md border border-border bg-muted" aria-hidden />;
}

function RowActions() {
  const actions: {
    icon: typeof Pencil;
    label: string;
    destructive?: boolean;
  }[] = [
    { icon: Pencil, label: "Editar" },
    { icon: Copy, label: "Duplicar" },
    { icon: Power, label: "Ativar / desativar" },
    { icon: Trash2, label: "Eliminar", destructive: true },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-end gap-1">
        {actions.map(({ icon: Icon, label, destructive }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={
                    destructive
                      ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                      : "text-foreground hover:bg-accent hover:text-foreground"
                  }
                  disabled
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Em breve</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

type ServiceCatalogTableProps = {
  items: EstablishmentServiceItem[];
};

export function ServiceCatalogTable({ items }: ServiceCatalogTableProps) {
  return (
    <div className="hidden rounded-lg border border-border md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[min(40%,28rem)] pl-4 text-xs font-medium uppercase tracking-wide text-foreground">
              Serviço
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Categoria
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Duração
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Preço
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wide text-foreground">
              Status
            </TableHead>
            <TableHead className="pr-4 text-right text-xs font-medium uppercase tracking-wide text-foreground">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={serviceRowKey(item, index)}>
              <TableCell className="pl-4 align-middle">
                <div className="flex gap-3">
                  <PlaceholderThumb />
                  <div className="min-w-0 space-y-0.5">
                    <div className="truncate font-medium text-foreground">{item.serviceName}</div>
                    {item.description ? (
                      <div className="line-clamp-2 text-sm text-foreground">{item.description}</div>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell className="align-middle text-foreground">
                {formatServiceCategory(item.category)}
              </TableCell>
              <TableCell className="align-middle text-foreground">
                {formatEstimatedDuration(
                  item.estimatedDuration?.minInMinutes ?? 0,
                  item.estimatedDuration?.maxInMinutes ?? 0,
                )}
              </TableCell>
              <TableCell className="align-middle">
                <span className="font-semibold tabular-nums text-foreground">
                  {formatServicePriceBrl(item.price)}
                </span>
              </TableCell>
              <TableCell className="align-middle">
                <ServiceStatusBadge isActive={item.isActive} />
              </TableCell>
              <TableCell className="pr-4 text-right align-middle">
                <RowActions />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
