import { Copy, Pencil, Power, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RowIconActions } from "@/shared/components/row-icon-actions";
import { catalogTableRowClass } from "@/shared/components/catalog-table-row-selection";
import { cn } from "@/shared/utils/cn";

import {
  formatEstimatedDuration,
  formatServiceCategory,
  formatServicePriceBrl,
} from "../lib/format-catalog";
import { isSameServiceItem } from "../lib/is-same-service-item";
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
    <RowIconActions
      className="justify-end"
      actions={[
        {
          label: canMutate ? "Editar" : "Identificador em falta — não é possível editar.",
          icon: Pencil,
          onClick: () => onEdit(item),
          disabled: !canMutate,
          className: "text-foreground hover:bg-accent hover:text-foreground",
        },
        {
          label: "Duplicar serviço",
          icon: Copy,
          onClick: () => onDuplicate(item),
          className: "text-foreground hover:bg-accent hover:text-foreground",
        },
        {
          label: canMutate
            ? toggleLabel
            : "Identificador em falta — não é possível alterar o estado.",
          icon: Power,
          onClick: () => onToggleActive(item),
          disabled: !canMutate || isToggling,
          className: cn(
            item.isActive
              ? "text-success hover:bg-success/10 hover:text-success"
              : "text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground",
          ),
        },
        {
          label: canMutate ? "Apagar" : "Identificador em falta — não é possível apagar.",
          icon: Trash2,
          onClick: () => onDelete(item),
          disabled: !canMutate,
          className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
        },
      ]}
    />
  );
}

type ServiceCatalogTableProps = {
  items: ServiceItem[];
  selectedService: ServiceItem | null;
  onSelect: (item: ServiceItem) => void;
  onEdit: (item: ServiceItem) => void;
  onDuplicate: (item: ServiceItem) => void;
  onToggleActive: (item: ServiceItem) => void;
  onDelete: (item: ServiceItem) => void;
  togglingServiceId: string | null;
};

export function ServiceCatalogTable({
  items,
  selectedService,
  onSelect,
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
          {items.map((item, index) => {
            const isSelected = isSameServiceItem(item, selectedService);

            return (
              <TableRow
                key={serviceRowKey(item, index)}
                role="row"
                aria-selected={isSelected}
                tabIndex={0}
                className={catalogTableRowClass(isSelected)}
                onClick={() => onSelect(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(item);
                  }
                }}
              >
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
                <TableCell
                  className="pr-4 text-right align-middle"
                  onClick={(event) => event.stopPropagation()}
                >
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
