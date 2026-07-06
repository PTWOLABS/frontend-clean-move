import { z } from "zod";

import { parseBrlMoneyToReais } from "@/shared/money/format-brl-money";
import { getServicePriceValidationIssue } from "@/shared/services/service-price-metadata";
import { formatLocalDateTimeAsUtcISOString } from "@/shared/utils/lib";

const dateInput = z.union([z.date(), z.string(), z.number(), z.null(), z.undefined()]);

const requiredDateField = (message: string) =>
  dateInput.transform((value, context) => {
    if (value === null || value === undefined || value === "") {
      context.addIssue({ code: "custom", message });
      return z.NEVER;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      context.addIssue({ code: "custom", message });
      return z.NEVER;
    }

    return formatLocalDateTimeAsUtcISOString(date);
  });

const optionalDateField = dateInput.transform((value, context) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    context.addIssue({ code: "custom", message: "Selecione uma data válida." });
    return z.NEVER;
  }

  return formatLocalDateTimeAsUtcISOString(date);
});

export const appointmentServiceOptionSchema = z.object({
  value: z.string().trim().min(1, "Selecione um serviço válido."),
  label: z.string().trim().min(1, "Selecione um serviço válido."),
});

const appointmentPricedServiceSchema = z.object({
  serviceId: z.string().trim().min(1, "Selecione um serviço válido."),
  serviceLabel: z.string().trim().min(1, "Selecione um serviço válido."),
  source: z.enum(["snapshot", "catalog"]).optional(),
  priceType: z.enum(["FIXED", "STARTING_AT", "RANGE"]),
  minPriceInCents: z.number().int().nonnegative("O valor mínimo do serviço não pode ser negativo."),
  maxPriceInCents: z
    .number()
    .int()
    .nonnegative("O valor máximo do serviço não pode ser negativo.")
    .optional(),
  price: z
    .string()
    .trim()
    .min(1, "Informe o valor do serviço.")
    .refine((value) => {
      const amount = parseBrlMoneyToReais(value);
      return Number.isFinite(amount) && amount >= 0;
    }, "Informe um valor válido (ex.: 150,00)."),
});

function isValidDiscount(value: string) {
  const normalizedValue = value.replace(/^R\$\s?/i, "").trim();

  if (!normalizedValue) return true;

  const amount = parseBrlMoneyToReais(normalizedValue);
  return Number.isFinite(amount) && amount >= 0;
}

function parseOptionalMoneyInCents(value: string) {
  const normalizedValue = value.replace(/^R\$\s?/i, "").trim();

  if (!normalizedValue) return 0;

  const amount = parseBrlMoneyToReais(normalizedValue);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 100);
}

export const appointmentFormFieldsSchema = {
  customerId: z.string().trim().min(1, "Selecione um cliente."),
  serviceIds: z.array(appointmentServiceOptionSchema).min(1, "Selecione pelo menos um serviço."),
  services: z.array(appointmentPricedServiceSchema),
  vehicleId: z.string().trim().min(1, "Selecione um veículo."),
  startsAt: requiredDateField("Selecione a data de início."),
  endsAt: optionalDateField,
  description: z
    .string()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .optional()
    .nullable()
    .transform((value) => {
      const description = value?.trim();
      return description ? description : null;
    }),
  discountValue: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => value?.trim() ?? "")
    .refine(isValidDiscount, {
      message: "Informe um desconto válido (ex.: 10,00).",
    }),
};

export function validateAppointmentServicePrices(
  services: z.output<typeof appointmentPricedServiceSchema>[],
  context: z.RefinementCtx,
) {
  services.forEach((service, index) => {
    if (service.source === "snapshot") {
      return;
    }

    const amountInCents = Math.round(parseBrlMoneyToReais(service.price) * 100);
    const priceIssue = getServicePriceValidationIssue(amountInCents, service);

    if (priceIssue === "BELOW_MIN") {
      context.addIssue({
        code: "custom",
        message: "O valor não pode ser menor que o mínimo do serviço.",
        path: ["services", index, "price"],
      });
    }

    if (priceIssue === "ABOVE_MAX") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O valor não pode ultrapassar o máximo do serviço.",
        path: ["services", index, "price"],
      });
    }
  });
}

export function validateAppointmentDiscount(
  values: {
    discountValue?: string | null;
    services?: z.output<typeof appointmentPricedServiceSchema>[];
  },
  context: z.RefinementCtx,
) {
  if (!values.services?.length) {
    return;
  }

  const discountInCents = parseOptionalMoneyInCents(values.discountValue ?? "");

  if (discountInCents === null) {
    return;
  }

  const servicesAmountInCents = values.services.reduce((total, service) => {
    const amount = parseOptionalMoneyInCents(service.price);

    return total + (amount ?? 0);
  }, 0);

  if (discountInCents > servicesAmountInCents) {
    context.addIssue({
      code: "custom",
      message: "O desconto não pode ser maior que o valor total dos serviços.",
      path: ["discountValue"],
    });
  }
}

export function isAppointmentDateRangeValid(values: {
  startsAt?: string | null;
  endsAt?: string | null;
}) {
  return !values.startsAt || !values.endsAt || new Date(values.endsAt) >= new Date(values.startsAt);
}

export const appointmentDateRangeRefinement = {
  message: "A data de encerramento deve ser igual ou posterior à data de início.",
  path: ["endsAt"],
};

export const createAppointmentFormSchema = z
  .object(appointmentFormFieldsSchema)
  .superRefine((values, context) => {
    const selectedServiceIds = values.serviceIds.map((service) => service.value);
    const pricedServiceIds = new Set(values.services.map((service) => service.serviceId));

    for (const serviceId of selectedServiceIds) {
      if (!pricedServiceIds.has(serviceId)) {
        context.addIssue({
          code: "custom",
          message: "Defina o valor para todos os serviços selecionados.",
          path: ["services"],
        });
        break;
      }
    }

    validateAppointmentServicePrices(values.services, context);
    validateAppointmentDiscount(values, context);
  })
  .refine(isAppointmentDateRangeValid, appointmentDateRangeRefinement);

export type CreateAppointmentFormInput = z.input<typeof createAppointmentFormSchema>;
export type CreateAppointmentFormValues = z.output<typeof createAppointmentFormSchema>;
export type CreateAppointmentRequestBody = Omit<
  CreateAppointmentFormValues,
  "discountValue" | "serviceIds" | "services"
> & {
  discountInCents: number | null;
  services: Array<{
    serviceId: string;
    priceInCents: number;
  }>;
};

export const createAppointmentDefaultValues: CreateAppointmentFormInput = {
  customerId: "",
  serviceIds: [],
  services: [],
  vehicleId: "",
  startsAt: null,
  endsAt: null,
  description: "",
  discountValue: null,
};
