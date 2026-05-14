import { Copy, Pencil, Power, Trash2 } from "lucide-react";

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

import { ServiceStatusBadge } from "./service-status-badge";

function serviceRowKey(item: EstablishmentServiceItem, index: number): string {
  return item.id ?? `${item.serviceName}-${item.category}-${index}`;
}

function CardActions() {
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
      <div className="flex flex-wrap gap-1 pt-1">
        {actions.map(({ icon: Icon, label, destructive }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={
                    destructive
                      ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                      : "border-border text-foreground hover:bg-accent"
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

type ServiceCatalogMobileCardsProps = {
  items: EstablishmentServiceItem[];
};

export function ServiceCatalogMobileCards({ items }: ServiceCatalogMobileCardsProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((item, index) => (
        <Card key={serviceRowKey(item, index)} className="overflow-hidden shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="flex gap-3">
              <div
                className="size-12 shrink-0 rounded-md border border-border bg-muted"
                aria-hidden
              />
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
            <CardActions />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
