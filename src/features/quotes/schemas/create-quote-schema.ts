import { z } from "zod";

import { getServicePriceValidationIssue } from "@/shared/services/service-price-metadata";

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

const optionalPriceInCents = z.preprocess((value) => {
  if (value === "" || value == null) return undefined;
  return value;
}, z.number().int("Informe um valor válido.").nonnegative("Informe um valor válido.").optional());

const optionalNullablePositiveInteger = z.preprocess((value) => {
  if (value === "" || value == null) return null;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().int("Informe um valor válido.").positive("Informe um valor válido.").optional().nullable());

const optionalNullableNonnegativeInteger = z.preprocess((value) => {
  if (value === "" || value == null) return null;
  if (typeof value === "string") return Number(value);
  return value;
}, z.number().int("Informe um valor válido.").nonnegative("Informe um valor válido.").optional().nullable());

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

export const quoteServiceItemSchema = z
  .object({
    serviceId: z.uuid().optional().nullable(),
    serviceLabel: z.string().trim().optional(),
    serviceName: z.string().trim().min(1, "Informe o nome do serviço.").optional(),
    priceInCents: optionalPriceInCents,
    isCourtesy: z.boolean().optional(),
    priceType: z.enum(["FIXED", "STARTING_AT", "RANGE"]).optional(),
    minPriceInCents: z.number().int().nonnegative().optional(),
    maxPriceInCents: z.number().int().nonnegative().optional(),
  })
  .superRefine((value, context) => {
    function validatePrice() {
      if (value.priceInCents === undefined) {
        context.addIssue({
          code: "custom",
          message: "Informe o preço do serviço.",
          path: ["priceInCents"],
        });
        return;
      }

      if (!value.priceType || typeof value.minPriceInCents !== "number" || value.isCourtesy) {
        return;
      }

      const priceIssue = getServicePriceValidationIssue(value.priceInCents, {
        priceType: value.priceType,
        minPriceInCents: value.minPriceInCents,
        maxPriceInCents: value.maxPriceInCents,
      });

      if (priceIssue === "BELOW_MIN") {
        context.addIssue({
          code: "custom",
          message: "O valor não pode ser menor que o mínimo do serviço.",
          path: ["priceInCents"],
        });
      }

      if (priceIssue === "ABOVE_MAX") {
        context.addIssue({
          code: "custom",
          message: "O valor não pode ultrapassar o máximo do serviço.",
          path: ["priceInCents"],
        });
      }
    }

    if (value.serviceId) {
      if (value.serviceName !== undefined) {
        context.addIssue({
          code: "custom",
          message: "O nome do serviço não deve ser informado com um serviço existente.",
          path: ["serviceName"],
        });
      }

      validatePrice();
      return;
    }

    if (!value.serviceName) {
      context.addIssue({
        code: "custom",
        message: "Informe o nome do serviço.",
        path: ["serviceName"],
      });
    }

    validatePrice();
  });

export const quoteServicesStepSchema = z.object({
  services: z.array(quoteServiceItemSchema).min(1, "Adicione pelo menos um serviço."),
});

export const quotePaymentOptionSchema = z.object({
  method: z.enum(["CASH", "PIX", "CARD", "OTHER"]),
  label: z.string().trim().min(1, "Informe a descrição da forma de pagamento."),
  installments: optionalNullablePositiveInteger,
  interestFree: z.boolean().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "AMOUNT"]).optional().nullable(),
  discountValue: optionalNullableNonnegativeInteger,
});

export const quotePaymentStepSchema = z.object({
  paymentOptions: z
    .array(quotePaymentOptionSchema)
    .min(1, "Adicione pelo menos uma forma de pagamento."),
});

export const createQuoteFormSchema = z.object({
  stepOne: quoteCustomerVehicleStepSchema,
  stepTwo: quoteServicesStepSchema,
  stepThree: quotePaymentStepSchema,
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
  stepTwo: {
    services: [],
  },
  stepThree: {
    paymentOptions: [],
  },
} satisfies z.input<typeof createQuoteFormSchema>;
