import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

type CardActionsProps = {
  item: EstablishmentServiceItem;
  onEdit: (item: EstablishmentServiceItem) => void;
  onDelete: (item: EstablishmentServiceItem) => void;
};

function CardActions({ item, onEdit, onDelete }: CardActionsProps) {
  const canMutate = Boolean(item.id);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap gap-1 pt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-border text-foreground hover:bg-accent"
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
                variant="outline"
                size="icon"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
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

type ServiceCatalogMobileCardsProps = {
  items: EstablishmentServiceItem[];
  onEdit: (item: EstablishmentServiceItem) => void;
  onDelete: (item: EstablishmentServiceItem) => void;
};

export function ServiceCatalogMobileCards({
  items,
  onEdit,
  onDelete,
}: ServiceCatalogMobileCardsProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((item, index) => (
        <Card key={serviceRowKey(item, index)} className="overflow-hidden shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="flex gap-3">
              <ServiceCatalogItemThumb className="size-12" iconClassName="size-6" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="font-semibold leading-tight text-foreground">
                  {item.serviceName}
                </div>
                {item.description ? (
                  <p className="text-sm text-foreground">{item.description}</p>
                ) : null}
              </div>
            </div>
            <Separator />
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground">
                  Categoria
                </dt>
                <dd className="text-foreground">{formatServiceCategory(item.category)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground">
                  Duração
                </dt>
                <dd className="text-foreground">
                  {formatEstimatedDuration(
                    item.estimatedDuration?.minInMinutes ?? 0,
                    item.estimatedDuration?.maxInMinutes ?? 0,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground">
                  Preço
                </dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {formatServicePriceBrl(item.price)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground">
                  Status
                </dt>
                <dd className="pt-0.5">
                  <ServiceStatusBadge isActive={item.isActive} />
                </dd>
              </div>
            </dl>
            <CardActions item={item} onEdit={onEdit} onDelete={onDelete} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
