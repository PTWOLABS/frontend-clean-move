"use client";

import { useCallback } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import type { CreateQuoteFormInput } from "../types/create-quote";

type QuotePaymentOptionInput = CreateQuoteFormInput["stepThree"]["paymentOptions"][number];
type QuotePaymentMethod = QuotePaymentOptionInput["method"];
type QuoteDiscountType = NonNullable<QuotePaymentOptionInput["discountType"]>;
export type QuoteDiscountSelectValue = QuoteDiscountType | "NONE";

const paymentMethodLabels: Record<QuotePaymentMethod, string> = {
  CASH: "Dinheiro",
  PIX: "Pix",
  CARD: "Cartão",
  OTHER: "Outro",
};

export const paymentMethodOptions = [
  { label: paymentMethodLabels.CASH, value: "CASH" },
  { label: paymentMethodLabels.PIX, value: "PIX" },
  { label: paymentMethodLabels.CARD, value: "CARD" },
  { label: paymentMethodLabels.OTHER, value: "OTHER" },
] satisfies Array<{ label: string; value: QuotePaymentMethod }>;

export const discountTypeOptions = [
  { label: "Sem desconto", value: "NONE" },
  { label: "Percentual", value: "PERCENTAGE" },
  { label: "Valor fixo", value: "AMOUNT" },
] satisfies Array<{ label: string; value: QuoteDiscountSelectValue }>;

export function useQuotePaymentStep() {
  const { clearErrors, control, getValues, setValue } = useFormContext<CreateQuoteFormInput>();
  const { append, fields, remove } = useFieldArray({
    control,
    name: "stepThree.paymentOptions",
  });
  const paymentOptions = useWatch({ control, name: "stepThree.paymentOptions" }) ?? [];

  const addPaymentOption = useCallback(
    (method: QuotePaymentMethod = "CASH") => {
      append(createPaymentOption(method));
      clearErrors("stepThree.paymentOptions");
    },
    [append, clearErrors],
  );

  const handlePaymentMethodChange = useCallback(
    (index: number, method: QuotePaymentMethod) => {
      const currentPaymentOption = getValues(`stepThree.paymentOptions.${index}`);
      const previousDefaultLabel = currentPaymentOption?.method
        ? paymentMethodLabels[currentPaymentOption.method]
        : "";
      const currentLabel = currentPaymentOption?.label?.trim() ?? "";
      const shouldUseDefaultLabel = !currentLabel || currentLabel === previousDefaultLabel;

      setValue(`stepThree.paymentOptions.${index}.method`, method, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      if (shouldUseDefaultLabel) {
        setValue(`stepThree.paymentOptions.${index}.label`, paymentMethodLabels[method], {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }

      if (method === "CARD") {
        const installments = currentPaymentOption?.installments;
        const interestFree = currentPaymentOption?.interestFree;

        setValue(
          `stepThree.paymentOptions.${index}.installments`,
          typeof installments === "number" && installments > 0 ? installments : 1,
          {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          },
        );
        setValue(
          `stepThree.paymentOptions.${index}.interestFree`,
          typeof interestFree === "boolean" ? interestFree : true,
          {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          },
        );
        return;
      }

      setValue(`stepThree.paymentOptions.${index}.installments`, null, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue(`stepThree.paymentOptions.${index}.interestFree`, null, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [getValues, setValue],
  );

  const handleDiscountTypeChange = useCallback(
    (index: number, discountType: QuoteDiscountSelectValue) => {
      const currentDiscountType = getValues(`stepThree.paymentOptions.${index}.discountType`);

      if (discountType === "NONE") {
        setValue(`stepThree.paymentOptions.${index}.discountType`, null, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue(`stepThree.paymentOptions.${index}.discountValue`, null, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        return;
      }

      setValue(`stepThree.paymentOptions.${index}.discountType`, discountType, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      if (currentDiscountType !== discountType) {
        setValue(`stepThree.paymentOptions.${index}.discountValue`, null, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    },
    [getValues, setValue],
  );

  const paymentOptionRows = fields.map((field, index) => ({
    fieldId: field.id,
    index,
    paymentOption: paymentOptions[index],
  }));

  return {
    addPaymentOption,
    control,
    handleDiscountTypeChange,
    handlePaymentMethodChange,
    paymentOptionRows,
    paymentOptions,
    removePaymentOption: remove,
  };
}

function createPaymentOption(method: QuotePaymentMethod): QuotePaymentOptionInput {
  return {
    method,
    label: paymentMethodLabels[method],
    installments: method === "CARD" ? 1 : null,
    interestFree: method === "CARD" ? true : null,
    discountType: null,
    discountValue: null,
  };
}
