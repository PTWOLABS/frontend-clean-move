"use client";

import { useState } from "react";
import type { Control } from "react-hook-form";
import { Gift, Trash2, Wrench } from "lucide-react";

import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form/field";
import { FormControl, FormDescription } from "@/components/ui/form/form-primitives";
import { StandartInputField } from "@/components/ui/form/standart-input-field";
import { Switch } from "@/components/ui/switch";
import { BrlMoneyInput } from "@/shared/money/brl-money-input";
import { formatCentsToBrlInput, parseBrlMoneyToCents } from "@/shared/money/format-brl-money";
import {
  formatServicePriceMetadataDescription,
  isFixedServicePrice,
  type ServicePriceMetadata,
} from "@/shared/services/service-price-metadata";

import type { CreateQuoteFormInput } from "../../../types/create-quote";

type QuoteServiceItemCardProps = {
  control: Control<CreateQuoteFormInput>;
  index: number;
  isCourtesy: boolean;
  isExistingService: boolean;
  maxPriceInCents?: number;
  minPriceInCents?: number;
  priceType?: ServicePriceMetadata["priceType"];
  serviceLabel?: string;
  onCourtesyChange: (index: number, checked: boolean) => void;
  onRemove: (index: number) => void;
};

export function QuoteServiceItemCard({
  control,
  index,
  isCourtesy,
  isExistingService,
  maxPriceInCents,
  minPriceInCents,
  priceType,
  serviceLabel,
  onCourtesyChange,
  onRemove,
}: QuoteServiceItemCardProps) {
  const [openConfirmRemoveDialog, setOpenConfirmRemoveDialog] = useState(false);
  const priceMetadata =
    priceType && typeof minPriceInCents === "number"
      ? {
          priceType,
          minPriceInCents,
          maxPriceInCents,
        }
      : null;
  const isPriceReadOnly = isCourtesy || isFixedServicePrice(priceMetadata);

  function handleConfirmRemove() {
    onRemove(index);
    setOpenConfirmRemoveDialog(false);
  }

  return (
    <>
      <article className="rounded-xl border border-border/70 bg-background/55 p-4 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Serviço {index + 1}
            </p>
            <h4 className="mt-1 truncate text-sm font-semibold text-foreground">
              {isExistingService ? serviceLabel || "Serviço do catálogo" : "Serviço avulso"}
            </h4>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpenConfirmRemoveDialog(true)}
            aria-label="Remover serviço"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 aria-hidden className="size-4" />
          </Button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(10rem,0.7fr)_auto] lg:items-start">
          {isExistingService ? (
            <div className="space-y-1.5">
              <p className="text-sm font-medium leading-none text-foreground">Origem</p>
              <div className="flex min-h-10 items-center rounded-lg border border-border/70 bg-card/55 px-3 py-2.5">
                <p className="truncate text-sm font-medium text-foreground text-wrap">
                  Serviço selecionado do catálogo
                </p>
              </div>
            </div>
          ) : (
            <StandartInputField
              id={`quote-service-name-${index}`}
              name={`stepTwo.services.${index}.serviceName`}
              label="Nome do serviço"
              placeholder="Ex.: Higienização interna"
              autoComplete="off"
              icon={Wrench}
              className="shadow-xs"
            />
          )}

          <FormField
            control={control}
            name={`stepTwo.services.${index}.priceInCents`}
            label="Preço"
            renderControl={false}
          >
            {({ field }) => (
              <div className="space-y-1.5">
                <FormControl>
                  <BrlMoneyInput
                    ref={field.ref}
                    name={field.name}
                    value={formatCentsToBrlInput(field.value)}
                    onChange={(value) => field.onChange(parseBrlMoneyToCents(value))}
                    onBlur={field.onBlur}
                    disabled={isPriceReadOnly}
                    className="shadow-xs"
                  />
                </FormControl>
                {priceMetadata ? (
                  <FormDescription>
                    {formatServicePriceMetadataDescription(priceMetadata)}
                  </FormDescription>
                ) : null}
              </div>
            )}
          </FormField>

          <FormField
            control={control}
            name={`stepTwo.services.${index}.isCourtesy`}
            label="Cortesia"
            renderControl={false}
          >
            {({ field }) => (
              <div className="flex min-h-16 items-center gap-3 rounded-lg border border-border/70 bg-card/55 px-3 py-2.5">
                <FormControl>
                  <Switch
                    ref={field.ref}
                    name={field.name}
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) => onCourtesyChange(index, checked)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Gift aria-hidden className="size-4 text-primary" />
                    Cortesia
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Zera o valor no total.</p>
                </div>
              </div>
            )}
          </FormField>
        </div>
      </article>

      <AlertDialog
        open={openConfirmRemoveDialog}
        onOpenChange={setOpenConfirmRemoveDialog}
        title="Remover serviço?"
        descriptionContent="Este serviço será removido do orçamento."
        actionMessage="Remover serviço"
        onConfirm={handleConfirmRemove}
        onCancel={() => setOpenConfirmRemoveDialog(false)}
      />
    </>
  );
}
