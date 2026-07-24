"use client";

import { type ComponentProps, useId, useState } from "react";
import { ArrowLeft, CarFront, Check, PencilLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeVehiclePlate } from "@/shared/utils/vehicle-plate";

type QuoteApprovalVehiclePlateStepProps = {
  initialPlate?: string | null;
  onSubmit: (plate: string) => void;
  onBack: () => void;
};

export function QuoteApprovalVehiclePlateStep({
  initialPlate,
  onSubmit,
  onBack,
}: QuoteApprovalVehiclePlateStepProps) {
  const plateInputId = useId();
  const plateDescriptionId = `${plateInputId}-description`;
  const [plate, setPlate] = useState(() => normalizeVehiclePlate(initialPlate) ?? "");
  const normalizedPlate = normalizeVehiclePlate(plate) ?? "";
  const canContinue = normalizedPlate.length === 7;

  function handlePlateChange(value: string) {
    setPlate((normalizeVehiclePlate(value) ?? "").slice(0, 7));
  }

  const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = (event) => {
    event.preventDefault();

    if (!canContinue) return;

    onSubmit(normalizedPlate);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="border-b border-border bg-muted/20 px-5 py-5 sm:px-6">
        <DialogHeader className="text-left">
          <div className="mb-3 flex items-center justify-between gap-3 pr-8">
            <span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <CarFront className="size-5" aria-hidden="true" />
            </span>
            <Badge variant="outline" className="bg-background text-[11px] text-muted-foreground">
              Veículo
            </Badge>
          </div>
          <DialogTitle className="text-xl">Editar placa</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Ajuste a placa que será usada para resolver a pendência do veículo.
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground">
              <PencilLine className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Placa do orçamento</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Informe a placa correta antes de continuar a aprovação.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={plateInputId}>
            Placa do veículo
            <span aria-hidden="true" className="ml-1 text-destructive">
              *
            </span>
          </Label>
          <Input
            id={plateInputId}
            value={plate}
            onChange={(event) => handlePlateChange(event.target.value)}
            placeholder="ABC1D23"
            autoFocus
            autoComplete="off"
            inputMode="text"
            required
            aria-describedby={plateDescriptionId}
            aria-invalid={normalizedPlate.length > 0 && !canContinue}
            className="font-mono uppercase"
          />
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <p id={plateDescriptionId}>Use 7 caracteres, apenas letras e números.</p>
            <span className="shrink-0 tabular-nums">{normalizedPlate.length}/7</span>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 border-t border-border bg-muted/15 px-5 py-4 sm:justify-between sm:space-x-0 sm:px-6">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Voltar
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={!canContinue}>
          <Check aria-hidden="true" />
          Salvar placa
        </Button>
      </DialogFooter>
    </form>
  );
}
