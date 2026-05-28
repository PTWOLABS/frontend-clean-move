import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";

import {
  formatVehicleName,
  formatVehiclePlate,
  formatVehicleYear,
} from "../lib/format-vehicle-catalog";
import type { VehicleDto } from "../types";

type VehicleCatalogMobileCardsProps = {
  items: VehicleDto[];
  onEdit: (item: VehicleDto) => void;
  onDelete: (item: VehicleDto) => void;
};

export function VehicleCatalogMobileCards({
  items,
  onEdit,
  onDelete,
}: VehicleCatalogMobileCardsProps) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                {formatVehiclePlate(item)}
              </h3>
              <p className="text-sm text-muted-foreground">{formatVehicleName(item)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Cor</p>
                <p className="text-foreground">{item.color?.trim() || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Ano</p>
                <p className="text-foreground">{formatVehicleYear(item)}</p>
              </div>
            </div>

            {item.notes ? <p className="text-sm text-muted-foreground">{item.notes}</p> : null}

            <Separator />

            <HintTooltipProvider>
              <div className="flex gap-2">
                <HintTooltip label="Editar">
                  <Button type="button" variant="outline" size="icon" onClick={() => onEdit(item)}>
                    <Pencil className="size-4" />
                  </Button>
                </HintTooltip>
                <HintTooltip label="Apagar">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </HintTooltip>
              </div>
            </HintTooltipProvider>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
