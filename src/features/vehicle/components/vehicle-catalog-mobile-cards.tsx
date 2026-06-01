import { Car, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import { cn } from "@/shared/utils/cn";

import {
  formatVehicleName,
  formatVehiclePlate,
  formatVehicleYear,
  getVehicleColorSwatchClass,
} from "../lib/format-vehicle-catalog";
import type { VehicleDto } from "../types";

const mobileActionButtonClass =
  "size-9 shrink-0 rounded-full border-border bg-background/50 text-foreground hover:bg-accent";

type CardActionsProps = {
  item: VehicleDto;
  onAddVehicle: (item: VehicleDto) => void;
  onEdit: (item: VehicleDto) => void;
  onDelete: (item: VehicleDto) => void;
};

function CardActions({ item, onAddVehicle, onEdit, onDelete }: CardActionsProps) {
  const canMutate = Boolean(item.id);

  return (
    <HintTooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        <HintTooltip
          label={
            canMutate
              ? "Adicionar veículo"
              : "Identificador em falta — não é possível adicionar."
          }
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              mobileActionButtonClass,
              "border-primary/40 text-primary hover:bg-primary/10 hover:text-primary",
            )}
            disabled={!canMutate}
            aria-label="Adicionar veículo"
            onClick={() => onAddVehicle(item)}
          >
            <Plus className="size-4" />
          </Button>
        </HintTooltip>

        <HintTooltip
          label={canMutate ? "Editar" : "Identificador em falta — não é possível editar."}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={mobileActionButtonClass}
            disabled={!canMutate}
            aria-label="Editar veículo"
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
            aria-label="Apagar veículo"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-4" />
          </Button>
        </HintTooltip>
      </div>
    </HintTooltipProvider>
  );
}

type VehicleCatalogMobileCardsProps = {
  items: VehicleDto[];
  getCustomerLabel: (customerId: string) => string | undefined;
  onAddVehicle: (item: VehicleDto) => void;
  onEdit: (item: VehicleDto) => void;
  onDelete: (item: VehicleDto) => void;
};

function formatBrandLabel(item: VehicleDto): string {
  return item.brand?.trim().toUpperCase() || "—";
}

function formatModelLabel(item: VehicleDto): string {
  const model = item.model?.trim();
  if (model) return model;

  const name = formatVehicleName(item);
  const plate = formatVehiclePlate(item);
  if (name !== "—" && name !== plate) return name;

  return "—";
}

function formatColorLabel(item: VehicleDto): string {
  return item.color?.trim() || "—";
}

export function VehicleCatalogMobileCards({
  items,
  getCustomerLabel,
  onAddVehicle,
  onEdit,
  onDelete,
}: VehicleCatalogMobileCardsProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((item) => {
        const colorLabel = formatColorLabel(item);

        return (
          <Card key={item.id} className="overflow-hidden shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full border-success/35 bg-success/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success"
                >
                  {formatBrandLabel(item)}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/35 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-primary"
                >
                  {formatVehicleYear(item)}
                </Badge>
              </div>

              <div className="min-w-0 space-y-1">
                <h3 className="truncate text-2xl font-bold uppercase tracking-wide text-foreground">
                  {formatVehiclePlate(item)}
                </h3>
                <p className="truncate text-sm text-muted-foreground">
                  {getCustomerLabel(item.customerId)?.trim() || "—"}
                </p>
                <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                  <Car className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{formatModelLabel(item)}</span>
                  {colorLabel !== "—" ? (
                    <>
                      <span className="shrink-0 text-border" aria-hidden>
                        ·
                      </span>
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full ring-1 ring-border/80",
                          getVehicleColorSwatchClass(item.color),
                        )}
                        aria-hidden
                      />
                      <span className="truncate font-medium text-foreground">{colorLabel}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <Separator />

              <CardActions
                item={item}
                onAddVehicle={onAddVehicle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
