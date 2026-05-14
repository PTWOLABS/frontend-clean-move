import { Pencil, Trash2 } from "lucide-react";

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

import { ServiceCatalogItemThumb } from "./service-catalog-item-thumb";
import { ServiceStatusBadge } from "./service-status-badge";

function serviceRowKey(item: EstablishmentServiceItem, index: number): string {
  return item.id ?? `${item.serviceName}-${item.category}-${index}`;
}

type RowActionsProps = {
  item: EstablishmentServiceItem;
  onEdit: (item: EstablishmentServiceItem) => void;
  onDelete: (item: EstablishmentServiceItem) => void;
};

function RowActions({ item, onEdit, onDelete }: RowActionsProps) {
  const canMutate = Boolean(item.id);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-end gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-accent hover:text-foreground"
                disabled={!canMutate}
                aria-label="Editar serviço"
                onClick={() => onEdit(item)}
              >
                <Pencil className="size-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {canMutate ? "Editar" : "Identificador em falta — não é possível editar."}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={!canMutate}
                aria-label="Eliminar serviço"
                onClick={() => onDelete(item)}
              >
                <Trash2 className="size-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {canMutate ? "Eliminar" : "Identificador em falta — não é possível eliminar."}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

type ServiceCatalogTableProps = {
  items: EstablishmentServiceItem[];
  onEdit: (item: EstablishmentServiceItem) => void;
  onDelete: (item: EstablishmentServiceItem) => void;
};

export function ServiceCatalogTable({ items, onEdit, onDelete }: ServiceCatalogTableProps) {
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
                  <ServiceCatalogItemThumb className="size-10" iconClassName="size-[18px]" />
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
                <RowActions item={item} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
