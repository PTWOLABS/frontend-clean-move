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
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import { cn } from "@/shared/utils/cn";

import {
  formatEstimatedDuration,
  formatServiceCategory,
  formatServicePriceBrl,
} from "../lib/format-catalog";
import type { ServiceItem } from "../types";

import { ServiceStatusBadge } from "./service-status-badge";

function serviceRowKey(item: ServiceItem, index: number): string {
  return item.id ?? `${item.serviceName}-${item.category}-${index}`;
}

type RowActionsProps = {
  item: ServiceItem;
  onEdit: (item: ServiceItem) => void;
  onDuplicate: (item: ServiceItem) => void;
  onToggleActive: (item: ServiceItem) => void;
  onDelete: (item: ServiceItem) => void;
  isToggling: boolean;
};

function RowActions({
  item,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
  isToggling,
}: RowActionsProps) {
  const canMutate = Boolean(item.id);
  const toggleLabel = item.isActive ? "Desativar serviço" : "Ativar serviço";

  return (
    <HintTooltipProvider>
      <div className="flex items-center justify-end gap-1">
        <HintTooltip
          label={canMutate ? "Editar" : "Identificador em falta — não é possível editar."}
        >
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
        </HintTooltip>

        <HintTooltip label="Duplicar serviço">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent hover:text-foreground"
            aria-label="Duplicar serviço"
            onClick={() => onDuplicate(item)}
          >
            <Copy className="size-4" />
          </Button>
        </HintTooltip>

        <HintTooltip
          label={
            canMutate ? toggleLabel : "Identificador em falta — não é possível alterar o estado."
          }
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              item.isActive
                ? "text-success hover:bg-success/10 hover:text-success"
                : "text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground",
            )}
            disabled={!canMutate || isToggling}
            aria-label={toggleLabel}
            onClick={() => onToggleActive(item)}
          >
            <Power className="size-4" />
          </Button>
        </HintTooltip>

        <HintTooltip
          label={canMutate ? "Apagar" : "Identificador em falta — não é possível apagar."}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={!canMutate}
            aria-label="Apagar serviço"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-4" />
          </Button>
        </HintTooltip>
      </div>
    </HintTooltipProvider>
  );
}

type ServiceCatalogTableProps = {
  items: ServiceItem[];
  onEdit: (item: ServiceItem) => void;
  onDuplicate: (item: ServiceItem) => void;
  onToggleActive: (item: ServiceItem) => void;
  onDelete: (item: ServiceItem) => void;
  togglingServiceId: string | null;
};

export function ServiceCatalogTable({
  items,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
  togglingServiceId,
}: ServiceCatalogTableProps) {
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
                <div className="min-w-0 space-y-0.5">
                  <div className="truncate font-medium text-foreground">{item.serviceName}</div>
                  {item.description ? (
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  ) : null}
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
                <RowActions
                  item={item}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onToggleActive={onToggleActive}
                  onDelete={onDelete}
                  isToggling={togglingServiceId === item.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
