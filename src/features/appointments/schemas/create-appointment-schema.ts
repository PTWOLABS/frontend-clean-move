import { z } from "zod";

import { parseBrlMoneyToReais } from "@/shared/money/format-brl-money";

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

    return date;
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

  return date;
});

const serviceOptionSchema = z.object({
  value: z.string().trim().min(1, "Selecione um serviço válido."),
  label: z.string().trim().min(1, "Selecione um serviço válido."),
});

function isValidDiscount(value: string) {
  const normalizedValue = value.replace(/^R\$\s?/i, "").trim();

  if (!normalizedValue) return true;

  const amount = parseBrlMoneyToReais(normalizedValue);
  return Number.isFinite(amount) && amount >= 0;
}

export const createAppointmentFormSchema = z
  .object({
    customerName: z.string().trim().min(1, "Informe o nome do cliente."),
    serviceIds: z.array(serviceOptionSchema).min(1, "Selecione pelo menos um serviço."),
    vehicleName: z.string().trim().min(1, "Informe o nome do veículo."),
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
  })
  .refine((values) => !values.endsAt || values.endsAt >= values.startsAt, {
    message: "A data de encerramento deve ser igual ou posterior à data de início.",
    path: ["endsAt"],
  });

export type CreateAppointmentFormInput = z.input<typeof createAppointmentFormSchema>;
export type CreateAppointmentFormValues = z.output<typeof createAppointmentFormSchema>;

export const createAppointmentDefaultValues: CreateAppointmentFormInput = {
  customerName: "",
  serviceIds: [],
  vehicleName: "",
  startsAt: null,
  endsAt: null,
  description: "",
  discountValue: "",
};
