import { z } from "zod";

import type {
  CreateCustomerPayload,
  CreateCustomerVehiclePayload,
  CustomerDto,
  CustomerVehicleDto,
} from "../types";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const optionalTrimmed = z
  .string()
  .optional()
  .transform((value) => {
    const parsed = value?.trim();
    return parsed ? parsed : undefined;
  });

const optionalNullableTrimmed = z
  .string()
  .optional()
  .transform((value) => {
    const parsed = value?.trim();
    return parsed ? parsed : null;
  });

const phoneField = z
  .string()
  .trim()
  .refine((value) => {
    const len = onlyDigits(value).length;
    return len === 10 || len === 11;
  }, "Informe um telefone válido (10 ou 11 dígitos).");

const cpfCnpjField = z
  .string()
  .optional()
  .transform((value) => {
    const digits = onlyDigits(value ?? "");
    return digits.length > 0 ? digits : undefined;
  })
  .refine((value) => !value || value.length === 11 || value.length === 14, {
    message: "Informe um CPF ou CNPJ válido.",
  });

const birthDateField = z
  .string()
  .optional()
  .transform((value) => {
    const parsed = value?.trim();
    return parsed ? parsed : null;
  })
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "Informe uma data de nascimento válida.",
  });

const addressSchema = z
  .object({
    street: optionalTrimmed,
    complement: optionalTrimmed,
    country: optionalTrimmed,
    state: optionalTrimmed,
    zipCode: optionalTrimmed,
    city: optionalTrimmed,
  })
  .transform((value) => {
    if (!value.street || !value.country || !value.state || !value.zipCode || !value.city) {
      return null;
    }

    return {
      street: value.street,
      complement: value.complement,
      country: value.country,
      state: value.state,
      zipCode: value.zipCode,
      city: value.city,
    };
  });

const vehicleYearField = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "number") return value;
    return Number(value);
  })
  .refine((value) => value === undefined || (Number.isInteger(value) && value >= 1900), {
    message: "Ano do veículo inválido (mínimo 1900).",
  });

const vehiclePlateField = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const normalized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return normalized || undefined;
  })
  .refine((value) => !value || value.length === 7, {
    message: "Placa inválida. Informe 7 caracteres.",
  });

export const customerFormSchema = z.object({
  fullName: z.string().trim().min(1, "Informe o nome completo."),
  phone: phoneField,
  email: z.email("Informe um e-mail válido."),
  cpfCnpj: cpfCnpjField,
  nickname: optionalNullableTrimmed,
  birthDate: birthDateField,
  address: addressSchema.optional(),
  vehicle: z.object({
    id: z.string().optional(),
    plate: vehiclePlateField,
    brand: optionalTrimmed,
    model: optionalTrimmed,
    color: optionalTrimmed,
    year: vehicleYearField,
    notes: optionalTrimmed,
  }),
});

export type CustomerFormInput = z.input<typeof customerFormSchema>;
export type CustomerFormValues = z.output<typeof customerFormSchema>;

export const customerFormDefaultValues: CustomerFormInput = {
  fullName: "",
  phone: "",
  email: "",
  cpfCnpj: "",
  nickname: "",
  birthDate: "",
  address: {
    street: "",
    complement: "",
    country: "Brasil",
    state: "",
    zipCode: "",
    city: "",
  },
  vehicle: {
    id: undefined,
    plate: "",
    brand: "",
    model: "",
    color: "",
    year: undefined,
    notes: "",
  },
};

export function customerToFormDefaults(
  customer: CustomerDto,
  primaryVehicle?: CustomerVehicleDto | null,
): CustomerFormInput {
  return {
    fullName: customer.fullName ?? "",
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    cpfCnpj: customer.cpfCnpj ?? "",
    nickname: customer.nickname ?? "",
    birthDate: customer.birthDate ? customer.birthDate.slice(0, 10) : "",
    address: {
      street: customer.address?.street ?? "",
      complement: customer.address?.complement ?? "",
      country: customer.address?.country ?? "Brasil",
      state: customer.address?.state ?? "",
      zipCode: customer.address?.zipCode ?? "",
      city: customer.address?.city ?? "",
    },
    vehicle: {
      id: primaryVehicle?.id,
      plate: primaryVehicle?.plate ?? "",
      brand: primaryVehicle?.brand ?? "",
      model: primaryVehicle?.model ?? "",
      color: primaryVehicle?.color ?? "",
      year: primaryVehicle?.year ?? undefined,
      notes: primaryVehicle?.notes ?? "",
    },
  };
}

export function mapCustomerFormToPayload(values: CustomerFormValues): CreateCustomerPayload {
  return {
    fullName: values.fullName.trim(),
    phone: onlyDigits(values.phone),
    email: values.email.trim(),
    cpfCnpj: values.cpfCnpj ?? null,
    nickname: values.nickname ?? null,
    birthDate: values.birthDate ?? null,
    address: values.address ?? null,
  };
}

export function mapVehicleFormToPayload(
  values: CustomerFormValues["vehicle"],
): CreateCustomerVehiclePayload | null {
  const payload: CreateCustomerVehiclePayload = {
    plate: values.plate,
    brand: values.brand,
    model: values.model,
    color: values.color,
    year: values.year,
    notes: values.notes,
  };

  const hasAnyValue = Object.values(payload).some(
    (value) => value !== undefined && value !== null && value !== "",
  );

  return hasAnyValue ? payload : null;
}
