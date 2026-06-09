import { onlyDigits } from "@/shared/utils/lib";
import { parseBrlMoneyToReais } from "@/shared/money/format-brl-money";
import { optionalText } from "@/shared/utils/required-text";
import {
  customerEmailField,
  customerFullNameField,
  customerPhoneField,
} from "@/features/customer/schemas/customer-form-schema";
import { normalizePlate } from "@/features/vehicle/schemas/vehicle-form-schema";
import z from "zod";

const onboardingServiceCategoryCodes = [
  "WASH",
  "POLISHING",
  "SANITIZATION",
  "COATING",
  "PAINTLESS_DENT_REPAIR",
  "OTHER",
] as const;

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== "string") return value;

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function parseNumberFromInput(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.replace(",", ".").trim();
    if (!normalizedValue) return Number.NaN;

    return Number(normalizedValue);
  }

  return Number.NaN;
}

const optionalTrimmedText = z.preprocess(emptyStringToUndefined, z.string().optional());

const optionalPositiveIntegerField = (message: string) =>
  z.preprocess(
    emptyStringToUndefined,
    z
      .union([z.string(), z.number()])
      .transform(parseNumberFromInput)
      .refine((value) => Number.isInteger(value) && value > 0, { message })
      .optional(),
  );

const optionalBrlPriceField = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .transform((value) => parseBrlMoneyToReais(value))
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "Informe um preço válido (ex.: 30,00 ou 1.234,56).",
    })
    .optional(),
);

export const onboardingCompanyStepSchema = z.object({
  cnpj: optionalText().refine(
    (value) => {
      if (!value) return true;

      return onlyDigits(value).length === 14;
    },
    {
      message: "Informe um CNPJ válido.",
    },
  ),

  legalName: optionalText(),
  tradeName: optionalText(),
});

export const onboardingServiceStepSchema = z
  .object({
    name: optionalTrimmedText,
    description: optionalTrimmedText,
    category: z
      .union([z.enum(onboardingServiceCategoryCodes), z.literal("")])
      .optional()
      .transform((value) => (value ? value : undefined)),
    minDurationInMinutes: optionalPositiveIntegerField(
      "Duração mínima deve ser um número inteiro positivo.",
    ),
    maxDurationInMinutes: optionalPositiveIntegerField(
      "Duração máxima deve ser um número inteiro positivo.",
    ),
    price: optionalBrlPriceField,
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const hasStartedService =
      Boolean(data.name) ||
      Boolean(data.description) ||
      Boolean(data.category) ||
      data.minDurationInMinutes !== undefined ||
      data.maxDurationInMinutes !== undefined ||
      data.price !== undefined ||
      data.isActive === true;

    if (!hasStartedService) return;

    if (!data.name) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o nome do serviço.",
        path: ["name"],
      });
    }

    if (!data.category) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a categoria.",
        path: ["category"],
      });
    }

    if (data.minDurationInMinutes === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a duração mínima.",
        path: ["minDurationInMinutes"],
      });
    }

    if (data.price === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o preço.",
        path: ["price"],
      });
    }

    if (
      data.minDurationInMinutes !== undefined &&
      data.maxDurationInMinutes !== undefined &&
      data.maxDurationInMinutes < data.minDurationInMinutes
    ) {
      ctx.addIssue({
        code: "custom",
        message: "A duração máxima deve ser maior ou igual à mínima.",
        path: ["maxDurationInMinutes"],
      });
    }
  });

export const onboardingCustomerVehicleStepSchema = z
  .object({
    customerFullName: optionalTrimmedText,
    customerPhone: optionalTrimmedText,
    customerEmail: z.preprocess(emptyStringToUndefined, customerEmailField.optional()),

    vehiclePlate: optionalTrimmedText,
    vehicleModel: optionalTrimmedText,
    vehicleColor: optionalTrimmedText,
  })
  .superRefine((data, ctx) => {
    const hasCustomerData = Boolean(
      data.customerFullName || data.customerPhone || data.customerEmail,
    );
    const hasVehicleData = Boolean(data.vehiclePlate || data.vehicleModel || data.vehicleColor);
    const hasAnyStepData = hasCustomerData || hasVehicleData;
    const normalizedPlate = normalizePlate(data.vehiclePlate);

    if (!hasAnyStepData) return;

    if (!data.customerFullName) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o nome completo.",
        path: ["customerFullName"],
      });
    } else {
      const fullNameResult = customerFullNameField.safeParse(data.customerFullName);

      if (!fullNameResult.success) {
        ctx.addIssue({
          code: "custom",
          message: fullNameResult.error.issues[0]?.message ?? "Informe o nome completo.",
          path: ["customerFullName"],
        });
      }
    }

    if (!data.customerPhone) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o telefone do cliente.",
        path: ["customerPhone"],
      });
    } else {
      const phoneResult = customerPhoneField.safeParse(data.customerPhone);

      if (!phoneResult.success) {
        ctx.addIssue({
          code: "custom",
          message: phoneResult.error.issues[0]?.message ?? "Informe um telefone válido.",
          path: ["customerPhone"],
        });
      }
    }

    if (normalizedPlate && normalizedPlate.length !== 7) {
      ctx.addIssue({
        code: "custom",
        message: "Placa inválida. Informe 7 caracteres.",
        path: ["vehiclePlate"],
      });
    }

    if (data.vehicleColor && !data.vehicleModel) {
      ctx.addIssue({
        code: "custom",
        message: "Informe marca/modelo para adicionar a cor do veículo.",
        path: ["vehicleModel"],
      });
    }
  });

export const onboardingSchema = z.intersection(
  z.intersection(onboardingCompanyStepSchema, onboardingServiceStepSchema),
  onboardingCustomerVehicleStepSchema,
);

export type OnboardingFormValues = z.input<typeof onboardingSchema>;

export type OnboardingSubmitValues = z.output<typeof onboardingSchema>;
