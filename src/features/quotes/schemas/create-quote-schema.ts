import { z } from "zod";

const nullableTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().nullable(),
);

const optionalNullableTrimmedString = nullableTrimmedString.optional();

const optionalYear = z.preprocess((value) => {
  if (value === "" || value == null) return null;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().int("Informe um ano valido.").optional().nullable());

export const quoteCustomerVehicleStepSchema = z
  .object({
    customerId: z.string().trim().optional().nullable(),
    customer: z.object({
      name: z.string().trim(),
      cpfCnpj: optionalNullableTrimmedString,
      phone: optionalNullableTrimmedString,
      email: optionalNullableTrimmedString,
    }),
    vehicleId: z.string().trim().optional().nullable(),
    vehicleLabel: optionalNullableTrimmedString,
    vehicle: z.object({
      plate: optionalNullableTrimmedString,
      brand: optionalNullableTrimmedString,
      model: optionalNullableTrimmedString,
      color: optionalNullableTrimmedString,
      year: optionalYear,
    }),
  })
  .superRefine((values, context) => {
    if (!values.customerId && !values.customer.name.trim()) {
      context.addIssue({
        code: "custom",
        path: ["customer", "name"],
        message: "Informe o cliente ou selecione um cadastro existente.",
      });
    }

    if (values.vehicleId) return;

    if (!values.vehicle.brand?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["vehicle", "brand"],
        message: "Informe a marca do veículo.",
      });
    }

    if (!values.vehicle.model?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["vehicle", "model"],
        message: "Informe o modelo do veículo.",
      });
    }
  });

export const createQuoteFormSchema = z.object({
  stepOne: quoteCustomerVehicleStepSchema,
});

export const createQuoteFormDefaultValues = {
  stepOne: {
    customerId: null,
    customer: {
      name: "",
      cpfCnpj: null,
      phone: null,
      email: null,
    },
    vehicleId: null,
    vehicleLabel: null,
    vehicle: {
      plate: null,
      brand: null,
      model: null,
      color: null,
      year: null,
    },
  },
} satisfies z.input<typeof createQuoteFormSchema>;
