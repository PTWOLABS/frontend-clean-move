import { Copy, Pencil, Power, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  return item.id ?? `${item.serviceName}-${item.category?.id ?? "none"}-${index}`;
}

const mobileActionButtonClass =
  "size-9 shrink-0 rounded-full border-border bg-background/50 text-foreground hover:bg-accent";

type CardActionsProps = {
  item: ServiceItem;
  onEdit: (item: ServiceItem) => void;
  onDuplicate: (item: ServiceItem) => void;
  onToggleActive: (item: ServiceItem) => void;
  onDelete: (item: ServiceItem) => void;
  isToggling: boolean;
};

function CardActions({
  item,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
  isToggling,
}: CardActionsProps) {
  const canMutate = Boolean(item.id);
  const toggleLabel = item.isActive ? "Desativar serviço" : "Ativar serviço";

  return (
    <HintTooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        <HintTooltip
          label={canMutate ? "Editar" : "Identificador em falta — não é possível editar."}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={mobileActionButtonClass}
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
            variant="outline"
            size="icon"
            className={mobileActionButtonClass}
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
            variant="outline"
            size="icon"
            className={cn(
              mobileActionButtonClass,
              item.isActive
                ? "border-success/40 text-success hover:bg-success/10 hover:text-success"
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
            variant="outline"
            size="icon"
            className={cn(
              mobileActionButtonClass,
              "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
            )}
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

type ServiceCatalogMobileCardsProps = {
  items: ServiceItem[];
  onEdit: (item: ServiceItem) => void;
  onDuplicate: (item: ServiceItem) => void;
  onToggleActive: (item: ServiceItem) => void;
  onDelete: (item: ServiceItem) => void;
  togglingServiceId: string | null;
};

export function ServiceCatalogMobileCards({
  items,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
  togglingServiceId,
}: ServiceCatalogMobileCardsProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((item, index) => {
        const duration = formatEstimatedDuration(
          item.estimatedDuration?.minInMinutes ?? 0,
          item.estimatedDuration?.maxInMinutes ?? 0,
        );

        return (
          <Card key={serviceRowKey(item, index)} className="overflow-hidden shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex min-w-0 gap-2">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-success">
                    {formatServiceCategory(item.category)}
                  </p>
                  <h3 className="truncate text-base font-semibold leading-snug text-foreground">
                    {item.serviceName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{duration}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between self-stretch py-0.5">
                  <ServiceStatusBadge
                    isActive={item.isActive}
                    className={cn(
                      "w-fit shrink-0 border-transparent bg-muted/80 px-2 py-0 text-xs",
                      item.isActive ? "text-success" : "text-muted-foreground",
                    )}
                  />
                  <p className="truncate text-sm font-bold tabular-nums leading-none text-success sm:text-base">
                    {formatServicePriceBrl(item.priceSpecification)}
                  </p>
                </div>
              </div>

              <Separator />

              <CardActions
                item={item}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
                isToggling={togglingServiceId === item.id}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
