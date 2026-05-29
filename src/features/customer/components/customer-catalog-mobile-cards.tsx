import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import { cn } from "@/shared/utils/cn";

import { formatCpfCnpj, formatPhone } from "../lib/format-customer-catalog";
import type { CustomerWithPrimaryVehicle } from "../types";
import { CustomerCatalogVehicleCell } from "./customer-catalog-vehicle-cell";

const mobileActionButtonClass =
  "size-9 shrink-0 rounded-full border-border bg-background/50 text-foreground hover:bg-accent";

type CardActionsProps = {
  item: CustomerWithPrimaryVehicle;
  onEdit: (item: CustomerWithPrimaryVehicle) => void;
  onDelete: (item: CustomerWithPrimaryVehicle) => void;
};

function CardActions({ item, onEdit, onDelete }: CardActionsProps) {
  const canMutate = Boolean(item.id);

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
            aria-label="Editar cliente"
            onClick={() => onEdit(item)}
          >
            <Pencil className="size-4" />
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
            aria-label="Apagar cliente"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-4" />
          </Button>
        </HintTooltip>
      </div>
    </HintTooltipProvider>
  );
}

type CustomerCatalogMobileCardsProps = {
  items: CustomerWithPrimaryVehicle[];
  onEdit: (item: CustomerWithPrimaryVehicle) => void;
  onDelete: (item: CustomerWithPrimaryVehicle) => void;
  onShowAllVehicles: (item: CustomerWithPrimaryVehicle) => void;
};

export function CustomerCatalogMobileCards({
  items,
  onEdit,
  onDelete,
  onShowAllVehicles,
}: CustomerCatalogMobileCardsProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-2">
              <div className="flex min-w-0 gap-2">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-success">
                    {formatPhone(item.phone)}
                  </p>
                  <h3 className="truncate text-base font-semibold leading-snug text-foreground">
                    {item.fullName}
                  </h3>
                  {item.nickname ? (
                    <p className="truncate text-sm text-muted-foreground">
                      Apelido: {item.nickname}
                    </p>
                  ) : null}
                  <p className="truncate text-sm text-muted-foreground">{item.email}</p>
                </div>

                <div className="flex shrink-0 flex-col items-end py-0.5">
                  <p className="max-w-36 truncate text-xs font-medium tabular-nums leading-none text-foreground sm:text-sm">
                    {formatCpfCnpj(item.cpfCnpj)}
                  </p>
                </div>
              </div>

              <CustomerCatalogVehicleCell
                customer={item}
                onShowAllVehicles={onShowAllVehicles}
              />
            </div>

            <Separator />

            <CardActions item={item} onEdit={onEdit} onDelete={onDelete} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
