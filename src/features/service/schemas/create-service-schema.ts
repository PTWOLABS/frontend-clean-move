import { z } from "zod";

import { formatReaisToBrlInput, parseBrlMoneyToReais } from "@/shared/money/format-brl-money";
import type { ServiceCategoryRef } from "@/features/service-category/types";

import type { CreateServicePayload, ServiceItem, ServicePriceSpecification } from "../types";

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

const priceTypeField = z.enum(["FIXED", "STARTING_AT", "RANGE"]);

const optionalBrlPriceString = z
  .string()
  .trim()
  .transform((s) => (s.length ? parseBrlMoneyToReais(s) : undefined));

function isPositiveReaisValue(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function asInputPriceInReais(valueInCents: number): string {
  const cents = Math.round(valueInCents);
  if (!Number.isFinite(cents) || cents <= 0) return "1,00";
  const reais = cents / 100;
  return formatReaisToBrlInput(reais) || "1,00";
}

function getPriceFormValues(
  specification: ServicePriceSpecification | undefined,
): Pick<
  CreateServiceFormInput,
  "priceType" | "fixedPriceInReais" | "minPriceInReais" | "maxPriceInReais"
> {
  switch (specification?.type) {
    case "STARTING_AT":
      return {
        priceType: "STARTING_AT",
        fixedPriceInReais: "",
        minPriceInReais: asInputPriceInReais(specification.minPriceInCents),
        maxPriceInReais: "",
      };
    case "RANGE":
      return {
        priceType: "RANGE",
        fixedPriceInReais: "",
        minPriceInReais: asInputPriceInReais(specification.minPriceInCents),
        maxPriceInReais: asInputPriceInReais(specification.maxPriceInCents),
      };
    case "FIXED":
    default:
      return {
        priceType: "FIXED",
        fixedPriceInReais:
          specification?.type === "FIXED"
            ? asInputPriceInReais(specification.fixedPriceInCents)
            : "30,00",
        minPriceInReais: "",
        maxPriceInReais: "",
      };
  }
}

export const createServiceFormSchema = z
  .object({
    serviceName: z.string().trim().min(1, "Informe o nome do serviço."),
    description: z.string().optional(),
    categoryId: z
      .string()
      .transform((s) => s.trim())
      .refine((s) => s === "" || z.string().uuid().safeParse(s).success, {
        message: "Selecione uma categoria válida.",
      })
      .transform((s) => (s === "" ? undefined : s)),
    minInMinutes: positiveIntField("Duração mínima deve ser um número inteiro positivo."),
    maxInMinutes: positiveIntField("Duração máxima deve ser um número inteiro positivo."),
    priceType: priceTypeField,
    fixedPriceInReais: optionalBrlPriceString,
    minPriceInReais: optionalBrlPriceString,
    maxPriceInReais: optionalBrlPriceString,
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.maxInMinutes < data.minInMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A duração máxima deve ser maior ou igual à mínima.",
        path: ["maxInMinutes"],
      });
    }

    if (data.priceType === "FIXED") {
      if (!isPositiveReaisValue(data.fixedPriceInReais)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um preço fixo válido (ex.: 30,00 ou 1.234,56).",
          path: ["fixedPriceInReais"],
        });
      }
      return;
    }

    if (!isPositiveReaisValue(data.minPriceInReais)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe um preço mínimo válido (ex.: 30,00 ou 1.234,56).",
        path: ["minPriceInReais"],
      });
    }

    if (data.priceType === "RANGE") {
      if (!isPositiveReaisValue(data.maxPriceInReais)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe um preço máximo válido (ex.: 30,00 ou 1.234,56).",
          path: ["maxPriceInReais"],
        });
        return;
      }

      if (
        isPositiveReaisValue(data.minPriceInReais) &&
        data.maxPriceInReais < data.minPriceInReais
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O preço máximo deve ser maior ou igual ao mínimo.",
          path: ["maxPriceInReais"],
        });
      }
    }
  });

export type CreateServiceFormInput = z.input<typeof createServiceFormSchema>;
export type CreateServiceFormValues = z.output<typeof createServiceFormSchema>;

export const createServiceDefaultValues: CreateServiceFormInput = {
  serviceName: "",
  description: "",
  categoryId: "",
  minInMinutes: 30,
  maxInMinutes: 60,
  priceType: "FIXED",
  fixedPriceInReais: "30,00",
  minPriceInReais: "",
  maxPriceInReais: "",
  isActive: true,
};

/**
 * Valores iniciais do formulário a partir de um item da listagem (edição).
 */
export function serviceItemToFormDefaults(item: ServiceItem): CreateServiceFormInput {
  const min = item.estimatedDuration?.minInMinutes ?? 30;
  const max = item.estimatedDuration?.maxInMinutes ?? Math.max(min, 60);
  return {
    serviceName: item.serviceName ?? "",
    description: item.description ?? "",
    categoryId: item.category?.id ?? "",
    minInMinutes: min,
    maxInMinutes: Math.max(min, max),
    ...getPriceFormValues(item.priceSpecification),
    isActive: item.isActive,
  };
}

const DUPLICATE_NAME_PREFIX = "Cópia de ";

/**
 * Valores iniciais do formulário para duplicar um serviço (criação com dados copiados).
 */
export function serviceItemToDuplicateFormDefaults(item: ServiceItem): CreateServiceFormInput {
  const base = serviceItemToFormDefaults(item);
  const name = (base.serviceName ?? "").trim();
  const duplicatedName = name.startsWith(DUPLICATE_NAME_PREFIX)
    ? name
    : `${DUPLICATE_NAME_PREFIX}${name}`;
  return { ...base, serviceName: duplicatedName };
}

export function mapCreateServiceFormToPayload(
  values: CreateServiceFormValues,
): CreateServicePayload {
  const description = values.description?.trim();
  const priceSpecification: ServicePriceSpecification =
    values.priceType === "FIXED"
      ? {
          type: "FIXED",
          fixedPriceInCents: Math.round((values.fixedPriceInReais ?? 0) * 100),
        }
      : values.priceType === "STARTING_AT"
        ? {
            type: "STARTING_AT",
            minPriceInCents: Math.round((values.minPriceInReais ?? 0) * 100),
          }
        : {
            type: "RANGE",
            minPriceInCents: Math.round((values.minPriceInReais ?? 0) * 100),
            maxPriceInCents: Math.round((values.maxPriceInReais ?? 0) * 100),
          };

  return {
    serviceName: values.serviceName.trim(),
    ...(description ? { description } : {}),
    categoryId: values.categoryId ?? null,
    estimatedDuration: {
      minInMinutes: values.minInMinutes,
      maxInMinutes: values.maxInMinutes,
    },
    priceSpecification,
    isActive: values.isActive,
  };
}

/** Item de listagem derivado dos valores validados do formulário (update otimista). */
export function formValuesToServiceItem(
  serviceId: string,
  values: CreateServiceFormValues,
  category?: ServiceCategoryRef | null,
): ServiceItem {
  const payload = mapCreateServiceFormToPayload(values);
  const resolvedCategory =
    category ?? (values.categoryId ? { id: values.categoryId, name: "" } : null);

  return {
    id: serviceId,
    serviceName: payload.serviceName,
    description: payload.description,
    category: resolvedCategory,
    estimatedDuration: payload.estimatedDuration,
    priceSpecification: payload.priceSpecification,
    isActive: payload.isActive,
  };
}
