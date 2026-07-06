"use client";

import { useState } from "react";
import type { Control } from "react-hook-form";
import { CreditCard, Percent, Trash2, WalletCards } from "lucide-react";

import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form/field";
import { FormControl, FormDescription } from "@/components/ui/form/form-primitives";
import { StandartInputField } from "@/components/ui/form/standart-input-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select/select";
import { Switch } from "@/components/ui/switch";
import { BrlMoneyInput } from "@/shared/money/brl-money-input";
import { formatCentsToBrlInput, parseBrlMoneyToCents } from "@/shared/money/format-brl-money";

import {
  discountTypeOptions,
  paymentMethodOptions,
  type QuoteDiscountSelectValue,
} from "../../../hooks/use-quote-payment-step";
import type { CreateQuoteFormInput } from "../../../types/create-quote";

type QuotePaymentMethod = CreateQuoteFormInput["stepThree"]["paymentOptions"][number]["method"];

type QuotePaymentOptionCardProps = {
  control: Control<CreateQuoteFormInput>;
  discountType: QuoteDiscountSelectValue | null;
  index: number;
  isCardPayment: boolean;
  method: QuotePaymentMethod;
  onDiscountTypeChange: (index: number, discountType: QuoteDiscountSelectValue) => void;
  onMethodChange: (index: number, method: QuotePaymentMethod) => void;
  onRemove: (index: number) => void;
};

export function QuotePaymentOptionCard({
  control,
  discountType,
  index,
  isCardPayment,
  method,
  onDiscountTypeChange,
  onMethodChange,
  onRemove,
}: QuotePaymentOptionCardProps) {
  const [openConfirmRemoveDialog, setOpenConfirmRemoveDialog] = useState(false);
  const discountSelectValue = discountType ?? "NONE";

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
              Pagamento {index + 1}
            </p>
            <h4 className="mt-1 truncate text-sm font-semibold text-foreground">
              {paymentMethodOptions.find((option) => option.value === method)?.label ??
                "Forma de pagamento"}
            </h4>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpenConfirmRemoveDialog(true)}
            aria-label="Remover forma de pagamento"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 aria-hidden className="size-4" />
          </Button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <FormField
            control={control}
            name={`stepThree.paymentOptions.${index}.method`}
            label="Método"
            renderControl={false}
          >
            {({ field }) => (
              <FormControl>
                <Select
                  ref={field.ref}
                  id={field.name}
                  value={field.value}
                  onChange={(value) => onMethodChange(index, value)}
                  onBlur={field.onBlur}
                  options={paymentMethodOptions}
                  placeholder="Selecione"
                  className="shadow-xs"
                />
              </FormControl>
            )}
          </FormField>

          <StandartInputField
            id={`quote-payment-label-${index}`}
            name={`stepThree.paymentOptions.${index}.label`}
            label="Descrição"
            placeholder="Ex.: Pix com 5% de desconto"
            autoComplete="off"
            icon={WalletCards}
            className="shadow-xs"
          />
        </div>

        {isCardPayment && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <FormField
              control={control}
              name={`stepThree.paymentOptions.${index}.installments`}
              label="Parcelas"
              renderControl={false}
            >
              {({ field }) => (
                <FormControl>
                  <Input
                    ref={field.ref}
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={formatNullableNumberInputValue(field.value)}
                    onChange={(event) =>
                      field.onChange(event.target.value === "" ? null : Number(event.target.value))
                    }
                    onBlur={field.onBlur}
                    className="shadow-xs"
                  />
                </FormControl>
              )}
            </FormField>

            <FormField
              control={control}
              name={`stepThree.paymentOptions.${index}.interestFree`}
              label="Sem juros"
              renderControl={false}
            >
              {({ field }) => (
                <div className="flex min-h-16 items-center gap-3 rounded-lg border border-border/70 bg-card/55 px-3 py-2.5">
                  <FormControl>
                    <Switch
                      ref={field.ref}
                      name={field.name}
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <CreditCard aria-hidden className="size-4 text-primary" />
                      Parcelamento sem juros
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Desative quando houver juros nas parcelas.
                    </p>
                  </div>
                </div>
              )}
            </FormField>
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <FormField
            control={control}
            name={`stepThree.paymentOptions.${index}.discountType`}
            label="Desconto"
            renderControl={false}
          >
            {({ field }) => (
              <FormControl>
                <Select
                  ref={field.ref}
                  id={field.name}
                  value={discountSelectValue}
                  onChange={(value) => onDiscountTypeChange(index, value)}
                  onBlur={field.onBlur}
                  options={discountTypeOptions}
                  placeholder="Selecione"
                  className="shadow-xs"
                />
              </FormControl>
            )}
          </FormField>

          {discountType ? (
            <FormField
              control={control}
              name={`stepThree.paymentOptions.${index}.discountValue`}
              label="Valor do desconto"
              renderControl={false}
            >
              {({ field }) => (
                <div className="space-y-1.5">
                  <FormControl>
                    {discountType === "AMOUNT" ? (
                      <BrlMoneyInput
                        ref={field.ref}
                        name={field.name}
                        value={formatCentsToBrlInput(field.value)}
                        onChange={(value) => field.onChange(parseBrlMoneyToCents(value) ?? null)}
                        onBlur={field.onBlur}
                        className="shadow-xs"
                      />
                    ) : (
                      <Input
                        ref={field.ref}
                        id={field.name}
                        name={field.name}
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={formatNullableNumberInputValue(field.value)}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === "" ? null : Number(event.target.value),
                          )
                        }
                        onBlur={field.onBlur}
                        className="shadow-xs"
                      />
                    )}
                  </FormControl>
                  <FormDescription>
                    {discountType === "AMOUNT"
                      ? "Valor em reais aplicado nesta opção."
                      : "Percentual inteiro aplicado nesta opção."}
                  </FormDescription>
                </div>
              )}
            </FormField>
          ) : (
            <div className="flex min-h-16 items-center gap-3 rounded-lg border border-dashed border-border/80 bg-card/35 px-3 py-2.5">
              <Percent aria-hidden className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Sem desconto para esta opção.</p>
            </div>
          )}
        </div>
      </article>

      <AlertDialog
        open={openConfirmRemoveDialog}
        onOpenChange={setOpenConfirmRemoveDialog}
        title="Remover forma de pagamento?"
        descriptionContent="Esta condição de pagamento será removida do orçamento."
        actionMessage="Remover pagamento"
        onConfirm={handleConfirmRemove}
        onCancel={() => setOpenConfirmRemoveDialog(false)}
      />
    </>
  );
}

function formatNullableNumberInputValue(value: unknown) {
  return typeof value === "number" || typeof value === "string" ? value : "";
}
