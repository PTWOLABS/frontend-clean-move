import { z } from "zod";

import { formatReaisToBrlInput, parseBrlMoneyToReais } from "@/shared/money/format-brl-money";
import {
  SERVICE_CATEGORY_CODES,
  type CreateServicePayload,
  type EstablishmentServiceItem,
  type ServiceCategoryCode,
} from "../types";

function parseNumberFromInput(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    if (normalized === "") return Number.NaN;
    return Number(normalized);
  }
  return Number.NaN;
}

const positiveIntField = (message: string) =>
  z
    .union([z.string(), z.number()])
    .transform(parseNumberFromInput)
    .refine((n) => Number.isInteger(n) && n > 0, { message });

const brlPriceString = z
  .string()
  .trim()
  .min(1, "Informe o preço.")
  .transform((s) => parseBrlMoneyToReais(s))
  .refine((n) => Number.isFinite(n) && n > 0, {
    message: "Informe um preço válido (ex.: 30,00 ou 1.234,56).",
  });

export const createServiceFormSchema = z
  .object({
    serviceName: z.string().trim().min(1, "Informe o nome do serviço."),
    description: z.string().optional(),
    category: z.enum(SERVICE_CATEGORY_CODES),
    minInMinutes: positiveIntField("Duração mínima deve ser um número inteiro positivo."),
    maxInMinutes: positiveIntField("Duração máxima deve ser um número inteiro positivo."),
    priceInReais: brlPriceString,
    isActive: z.boolean(),
  })
  .refine((data) => data.maxInMinutes >= data.minInMinutes, {
    message: "A duração máxima deve ser maior ou igual à mínima.",
    path: ["maxInMinutes"],
  });

export type CreateServiceFormInput = z.input<typeof createServiceFormSchema>;
export type CreateServiceFormValues = z.output<typeof createServiceFormSchema>;

export const createServiceDefaultValues: CreateServiceFormInput = {
  serviceName: "",
  description: "",
  category: "WASH",
  minInMinutes: 30,
  maxInMinutes: 60,
  priceInReais: "30,00",
  isActive: true,
};

function normalizeServiceCategory(code: string): ServiceCategoryCode {
  return SERVICE_CATEGORY_CODES.includes(code as ServiceCategoryCode)
    ? (code as ServiceCategoryCode)
    : "WASH";
}

/** Converte centavos da API para texto do campo de preço (pt-BR). */
function priceCentsToFormInput(price: unknown): string {
  const n = typeof price === "number" ? price : Number(price);
  const cents = Number.isFinite(n) ? Math.round(n) : 0;
  if (cents <= 0) return "1,00";
  const reais = cents / 100;
  return formatReaisToBrlInput(reais) || "1,00";
}

/**
 * Valores iniciais do formulário a partir de um item da listagem (edição).
 */
export function establishmentServiceItemToFormDefaults(
  item: EstablishmentServiceItem,
): CreateServiceFormInput {
  const min = item.estimatedDuration?.minInMinutes ?? 30;
  const max = item.estimatedDuration?.maxInMinutes ?? Math.max(min, 60);
  return {
    serviceName: item.serviceName ?? "",
    description: item.description ?? "",
    category: normalizeServiceCategory(item.category),
    minInMinutes: min,
    maxInMinutes: Math.max(min, max),
    priceInReais: priceCentsToFormInput(item.price),
    isActive: item.isActive,
  };
}

export function mapCreateServiceFormToPayload(
  values: CreateServiceFormValues,
): CreateServicePayload {
  const description = values.description?.trim();
  return {
    serviceName: values.serviceName.trim(),
    ...(description ? { description } : {}),
    category: values.category,
    estimatedDuration: {
      minInMinutes: values.minInMinutes,
      maxInMinutes: values.maxInMinutes,
    },
    price: Math.round(values.priceInReais * 100),
    isActive: values.isActive,
  };
}
