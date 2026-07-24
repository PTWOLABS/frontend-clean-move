import { z } from "zod";

import {
  dateInputValueToEndOfDayPayload,
  getDateKeyInSaoPaulo,
  parseBrDateToIso,
} from "@/shared/lib/date-time";
import { isValidCnpj, isValidCpf } from "@/shared/lib/validate-cpf-cnpj";
import { getServicePriceValidationIssue } from "@/shared/services/service-price-metadata";
import { onlyDigits } from "@/shared/utils/lib";
import { normalizeVehiclePlate } from "@/shared/utils/vehicle-plate";

const nullableTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().nullable(),
);

const optionalNullableTrimmedString = nullableTrimmedString.optional();

const optionalBrDate = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : null))
  .superRefine((value, context) => {
    if (!value) return;

    const isoDate = parseBrDateToIso(value);

    if (!isoDate) {
      context.addIssue({
        code: "custom",
        message: "Informe uma data válida.",
      });
      return;
    }

    if (isoDate < getDateKeyInSaoPaulo(new Date())) {
      context.addIssue({
        code: "custom",
        message: "A validade deve ser hoje ou uma data futura.",
      });
    }
  })
  .transform((value) => {
    if (!value) return null;

    const isoDate = parseBrDateToIso(value);

    return isoDate ? dateInputValueToEndOfDayPayload(isoDate) : null;
  });

const optionalTermsAndConditions = z
  .string()
  .trim()
  .max(250, "Máximo 250 caracteres.")
  .nullable()
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : null));

const optionalYear = z
  .preprocess((value) => {
    if (value === "" || value == null) return null;
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return value.trim();
    return value;
  }, z.string().nullable())
  .superRefine((value, context) => {
    if (value === null) return;

    if (!/^\d+$/.test(value)) {
      context.addIssue({
        code: "custom",
        message: "Informe apenas números no ano do veículo.",
      });
      return;
    }

    if (value.length > 4) {
      context.addIssue({
        code: "custom",
        message: "Informe no máximo 4 dígitos no ano do veículo.",
      });
      return;
    }

    const year = Number(value);

    if (!Number.isInteger(year) || year < 1900) {
      context.addIssue({
        code: "custom",
        message: "Informe um ano válido.",
      });
    }
  })
  .transform((value) => (value === null ? null : Number(value)));

const optionalNullablePhone = optionalNullableTrimmedString.superRefine((value, context) => {
  if (!value) return;

  const phoneLength = onlyDigits(value).length;

  if (phoneLength !== 10 && phoneLength !== 11) {
    context.addIssue({
      code: "custom",
      message: "Informe um telefone válido com 10 ou 11 dígitos.",
    });
  }
});

const optionalNullableCpfCnpj = optionalNullableTrimmedString.superRefine((value, context) => {
  const digits = onlyDigits(value ?? "");
  if (!digits) return;

  if (digits.length < 11) {
    context.addIssue({
      code: "custom",
      message: "CPF ou CNPJ incompleto.",
    });
    return;
  }

  if (digits.length > 11 && digits.length < 14) {
    context.addIssue({
      code: "custom",
      message: "CNPJ incompleto.",
    });
    return;
  }

  if (digits.length === 11 && !isValidCpf(digits)) {
    context.addIssue({
      code: "custom",
      message: "CPF inválido.",
    });
    return;
  }

  if (digits.length === 14 && !isValidCnpj(digits)) {
    context.addIssue({
      code: "custom",
      message: "CNPJ inválido.",
    });
    return;
  }

  if (digits.length !== 11 && digits.length !== 14) {
    context.addIssue({
      code: "custom",
      message: "Informe um CPF ou CNPJ válido.",
    });
  }
});

const optionalNullableEmail = optionalNullableTrimmedString.superRefine((value, context) => {
  if (!value) return;

  const emailResult = z.email("Informe um e-mail válido.").safeParse(value);

  if (!emailResult.success) {
    context.addIssue({
      code: "custom",
      message: emailResult.error.issues[0]?.message ?? "Informe um e-mail válido.",
    });
  }
});

const optionalNullableVehiclePlate = optionalNullableTrimmedString
  .superRefine((value, context) => {
    const plate = normalizeVehiclePlate(value);
    if (!plate) return;

    if (plate.length !== 7) {
      context.addIssue({
        code: "custom",
        message: "Placa inválida. Informe 7 caracteres.",
      });
    }
  })
  .transform((value) => (value ? normalizeVehiclePlate(value) : value));

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
      cpfCnpj: optionalNullableCpfCnpj,
      phone: optionalNullablePhone,
      email: optionalNullableEmail,
    }),
    vehicleId: z.string().trim().optional().nullable(),
    vehicleLabel: optionalNullableTrimmedString,
    vehicle: z.object({
      plate: optionalNullableVehiclePlate,
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

export const quotePaymentOptionSchema = z
  .object({
    method: z.enum(["CASH", "PIX", "CARD", "OTHER"]),
    label: z.string().trim().min(1, "Informe a descrição da forma de pagamento."),
    installments: optionalNullablePositiveInteger,
    interestFree: z.boolean().optional().nullable(),
    discountType: z.enum(["PERCENTAGE", "AMOUNT"]).optional().nullable(),
    discountValue: optionalNullableNonnegativeInteger,
  })
  .superRefine((paymentOption, context) => {
    if (!paymentOption.discountType) return;

    if (
      typeof paymentOption.discountValue !== "number" ||
      !Number.isFinite(paymentOption.discountValue)
    ) {
      context.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Informe o valor do desconto.",
      });
      return;
    }

    if (paymentOption.discountValue <= 0) {
      context.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "O desconto deve ser maior que zero.",
      });
    }
  });

export const quotePaymentStepSchema = z.object({
  paymentOptions: z
    .array(quotePaymentOptionSchema)
    .min(1, "Adicione pelo menos uma forma de pagamento."),
  expiresAt: optionalBrDate,
  termsAndConditions: optionalTermsAndConditions,
});

export const createQuoteFormSchema = z
  .object({
    stepOne: quoteCustomerVehicleStepSchema,
    stepTwo: quoteServicesStepSchema,
    stepThree: quotePaymentStepSchema,
  })
  .superRefine((values, context) => {
    const servicesTotalInCents = getQuoteServicesTotalInCents(values.stepTwo.services);

    values.stepThree.paymentOptions.forEach((paymentOption, index) => {
      if (
        !paymentOption.discountType ||
        typeof paymentOption.discountValue !== "number" ||
        !Number.isFinite(paymentOption.discountValue)
      ) {
        return;
      }

      if (paymentOption.discountType === "PERCENTAGE" && paymentOption.discountValue > 100) {
        context.addIssue({
          code: "custom",
          message: "O desconto percentual não pode ultrapassar 100%.",
          path: ["stepThree", "paymentOptions", index, "discountValue"],
        });
      }

      if (
        paymentOption.discountType === "AMOUNT" &&
        paymentOption.discountValue > servicesTotalInCents
      ) {
        context.addIssue({
          code: "custom",
          message: "O desconto não pode ser maior que o total dos serviços.",
          path: ["stepThree", "paymentOptions", index, "discountValue"],
        });
      }
    });
  });

function getQuoteServicesTotalInCents(services: Array<z.output<typeof quoteServiceItemSchema>>) {
  return services.reduce((total, service) => {
    if (service.isCourtesy) return total;
    const priceInCents =
      typeof service.priceInCents === "number" && Number.isFinite(service.priceInCents)
        ? service.priceInCents
        : 0;

    return total + priceInCents;
  }, 0);
}

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
    expiresAt: null,
    termsAndConditions: null,
  },
} satisfies z.input<typeof createQuoteFormSchema>;
