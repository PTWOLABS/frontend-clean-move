import { z } from "zod";

import { formatCpfCnpj } from "@/features/customer/lib/format-customer-catalog";
import type { Establishment, UpdateEstablishmentPayload } from "@/features/establishment/types";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const requiredText = (field: string) => z.string().trim().min(1, `Informe ${field}.`);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const businessSettingsSchema = z.object({
  tradeName: requiredText("o nome fantasia").min(2, "Informe um nome fantasia válido."),
  legalBusinessName: requiredText("a razão social").min(2, "Informe uma razão social válida."),
  cnpj: z
    .string()
    .trim()
    .refine((value) => onlyDigits(value).length === 14, "Informe um CNPJ válido."),
  slug: z
    .string()
    .trim()
    .min(2, "Informe um slug válido.")
    .max(64, "O slug deve ter no máximo 64 caracteres.")
    .refine((value) => slugPattern.test(value), {
      message: "Use apenas letras minúsculas, números e hífens (ex.: clean-move).",
    }),
});

export type BusinessSettingsFormInput = z.input<typeof businessSettingsSchema>;
export type BusinessSettingsFormValues = z.output<typeof businessSettingsSchema>;

export const businessSettingsDefaultValues: BusinessSettingsFormInput = {
  tradeName: "",
  legalBusinessName: "",
  cnpj: "",
  slug: "",
};

export function mapEstablishmentToBusinessFormDefaults(
  establishment: Establishment,
): BusinessSettingsFormInput {
  return {
    tradeName: establishment.tradeName ?? "",
    legalBusinessName: establishment.legalBusinessName ?? "",
    cnpj: establishment.cnpj ? formatCpfCnpj(establishment.cnpj) : "",
    slug: establishment.slug ?? "",
  };
}

export function mapBusinessFormToPatchPayload(
  values: BusinessSettingsFormValues,
): UpdateEstablishmentPayload {
  return {
    tradeName: values.tradeName.trim(),
    legalBusinessName: values.legalBusinessName.trim(),
    cnpj: onlyDigits(values.cnpj),
    slug: values.slug.trim(),
  };
}
