import { z } from "zod";

import { formatCpfCnpj } from "@/features/customer/lib/format-customer-catalog";
import type { Establishment, UpdateEstablishmentPayload } from "@/features/establishment/types";
import { optionalText } from "@/shared/utils/required-text";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const businessSettingsSchema = z.object({
  tradeName: optionalText(),
  legalBusinessName: optionalText(),
  cnpj: optionalText().refine(
    (value) => {
      if (!value) return true;

      return onlyDigits(value).length === 14;
    },
    {
      message: "Informe um CNPJ válido.",
    },
  ),
});

export type BusinessSettingsFormInput = z.input<typeof businessSettingsSchema>;
export type BusinessSettingsFormValues = z.output<typeof businessSettingsSchema>;

export const businessSettingsDefaultValues: BusinessSettingsFormInput = {
  tradeName: "",
  legalBusinessName: "",
  cnpj: "",
};

export function mapEstablishmentToBusinessFormDefaults(
  establishment: Establishment,
): BusinessSettingsFormInput {
  return {
    tradeName: establishment.tradeName ?? "",
    legalBusinessName: establishment.legalBusinessName ?? "",
    cnpj: establishment.cnpj ? formatCpfCnpj(establishment.cnpj) : "",
  };
}

export function mapBusinessFormToPatchPayload(
  values: BusinessSettingsFormValues,
): UpdateEstablishmentPayload {
  return {
    tradeName: values.tradeName?.trim() ?? "",
    legalBusinessName: values.legalBusinessName?.trim() ?? "",
    cnpj: onlyDigits(values.cnpj ?? ""),
  };
}
