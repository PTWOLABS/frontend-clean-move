import { formatLocalDateTimeAsUtcISOString, onlyDigits } from "@/shared/utils/lib";
import { parseBrlMoneyToReais } from "@/shared/money/format-brl-money";
import { optionalText } from "@/shared/utils/required-text";
import {
  customerEmailField,
  customerFullNameField,
  customerPhoneField,
} from "@/features/customer/schemas/customer-form-schema";
import { normalizePlate } from "@/features/vehicle/schemas/vehicle-form-schema";
import type { OnboardingPayload } from "../types/onboarding-types";
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

const optionalDateInput = z.union([z.date(), z.string(), z.number(), z.null(), z.undefined()]);

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
    serviceName: optionalTrimmedText,
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
      Boolean(data.serviceName) ||
      Boolean(data.description) ||
      Boolean(data.category) ||
      data.minDurationInMinutes !== undefined ||
      data.maxDurationInMinutes !== undefined ||
      data.price !== undefined ||
      data.isActive === true;

    if (!hasStartedService) return;

    if (!data.serviceName) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o nome do serviço.",
        path: ["serviceName"],
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

    if (normalizedPlate && !data.vehicleModel) {
      ctx.addIssue({
        code: "custom",
        message: "Informe marca/modelo para adicionar a placa do veículo.",
        path: ["vehicleModel"],
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

export const onboardingAppointmentStepSchema = z
  .object({
    startsAt: optionalDateInput.optional(),
    endsAt: optionalDateInput.optional(),
  })
  .superRefine((data, ctx) => {
    const hasStartDate =
      data.startsAt !== null && data.startsAt !== undefined && data.startsAt !== "";
    const hasEndDate = data.endsAt !== null && data.endsAt !== undefined && data.endsAt !== "";
    const hasAnyAppointmentData = hasStartDate || hasEndDate;

    if (!hasAnyAppointmentData) return;

    const startsAt = data.startsAt;
    const endsAt = data.endsAt;

    if (startsAt === null || startsAt === undefined || startsAt === "") {
      ctx.addIssue({
        code: "custom",
        message: "Selecione a data de início.",
        path: ["startsAt"],
      });
      return;
    }

    const startDate = startsAt instanceof Date ? startsAt : new Date(startsAt);

    if (Number.isNaN(startDate.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Selecione uma data válida.",
        path: ["startsAt"],
      });
      return;
    }

    if (endsAt === null || endsAt === undefined || endsAt === "") {
      return;
    }

    const endDate = endsAt instanceof Date ? endsAt : new Date(endsAt);

    if (Number.isNaN(endDate.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Selecione uma data válida.",
        path: ["endsAt"],
      });
      return;
    }

    if (endDate < startDate) {
      ctx.addIssue({
        code: "custom",
        message: "A data de encerramento deve ser igual ou posterior à data de início.",
        path: ["endsAt"],
      });
    }
  });

const onboardingBaseSchema = z.intersection(
  z.intersection(
    z.intersection(onboardingCompanyStepSchema, onboardingServiceStepSchema),
    onboardingCustomerVehicleStepSchema,
  ),
  onboardingAppointmentStepSchema,
);

export const onboardingSchema = onboardingBaseSchema.superRefine((data, ctx) => {
  const hasStartDate =
    data.startsAt !== null && data.startsAt !== undefined && data.startsAt !== "";

  if (!hasStartDate) return;

  const hasService =
    Boolean(data.serviceName) &&
    Boolean(data.category) &&
    data.minDurationInMinutes !== undefined &&
    data.price !== undefined;
  const hasCustomer = Boolean(data.customerFullName && data.customerPhone);
  const hasVehicle = Boolean(data.vehicleModel);

  if (!hasCustomer) {
    ctx.addIssue({
      code: "custom",
      message: "Cadastre um cliente antes de criar o agendamento.",
      path: ["customerFullName"],
    });
  }

  if (!hasService) {
    ctx.addIssue({
      code: "custom",
      message: "Cadastre um serviço antes de criar o agendamento.",
      path: ["serviceName"],
    });
  }

  if (!hasVehicle) {
    ctx.addIssue({
      code: "custom",
      message: "Cadastre um veículo antes de criar o agendamento.",
      path: ["vehicleModel"],
    });
  }
});

export type OnboardingFormValues = z.input<typeof onboardingSchema>;

export type OnboardingSubmitValues = z.output<typeof onboardingSchema>;

function toOptionalTrimmedText(value: string | undefined | null) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function toOptionalIsoDate(
  value: OnboardingSubmitValues["startsAt"] | OnboardingSubmitValues["endsAt"],
) {
  if (value === null || value === undefined || value === "") return undefined;

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return undefined;

  return formatLocalDateTimeAsUtcISOString(date);
}

export function mapOnboardingSubmitToPayload(values: OnboardingSubmitValues): OnboardingPayload {
  const payload: OnboardingPayload = {};

  const tradeName = toOptionalTrimmedText(values.tradeName);
  const legalBusinessName = toOptionalTrimmedText(values.legalName);
  const cnpj = values.cnpj ? onlyDigits(values.cnpj) : undefined;

  if (tradeName || legalBusinessName || cnpj) {
    payload.establishment = {
      ...(tradeName ? { tradeName } : {}),
      ...(legalBusinessName ? { legalBusinessName } : {}),
      ...(cnpj ? { cnpj } : {}),
    };
  }

  if (
    values.serviceName &&
    values.category &&
    values.minDurationInMinutes !== undefined &&
    values.price !== undefined
  ) {
    const description = toOptionalTrimmedText(values.description);

    payload.service = {
      serviceName: values.serviceName.trim(),
      category: values.category,
      ...(description ? { description } : {}),
      estimatedDuration: {
        minInMinutes: values.minDurationInMinutes,
        ...(values.maxDurationInMinutes !== undefined
          ? { maxInMinutes: values.maxDurationInMinutes }
          : {}),
      },
      price: Math.round(values.price * 100),
      isActive: values.isActive ?? false,
    };
  }

  if (values.customerFullName && values.customerPhone) {
    payload.customer = {
      fullName: values.customerFullName.trim(),
      phone: onlyDigits(values.customerPhone),
      ...(values.customerEmail ? { email: values.customerEmail.trim() } : {}),
    };
  }

  const plate = normalizePlate(values.vehiclePlate);
  const model = toOptionalTrimmedText(values.vehicleModel);
  const color = toOptionalTrimmedText(values.vehicleColor);

  if (plate || model || color) {
    payload.vehicle = {
      plate: plate ?? null,
      model: model ?? null,
      ...(color ? { color } : {}),
    };
  }

  const startsAt = toOptionalIsoDate(values.startsAt);
  const endsAt = toOptionalIsoDate(values.endsAt);

  if (startsAt && payload.service && payload.customer && payload.vehicle) {
    payload.appointment = {
      startsAt,
      ...(endsAt ? { endsAt } : {}),
    };
  }

  return payload;
}
