import { z } from "zod";

import { formatCpfCnpj } from "@/features/customer/lib/format-customer-catalog";
import { formatIsoDateToBr, parseBrDateToIso } from "@/shared/lib/br-date-input";

import {
  emptyVehicleFormValues,
  hasVehicleData,
  mapVehicleFormToPayload as mapVehicleFieldsToPayload,
  normalizePlate,
  parseVehicleYear,
  vehicleFieldsSchema,
} from "@/features/vehicle/schemas/vehicle-form-schema";
import type { CreateVehiclePayload } from "@/features/vehicle/types";

import type {
  CreateCustomerPayload,
  CustomerAddress,
  CustomerDto,
  CustomerVehicleDto,
} from "../types";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

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
  .refine((value) => !value || parseBrDateToIso(value) !== null, {
    message: "Informe uma data de nascimento válida.",
  })
  .transform((value) => {
    if (!value) return null;
    return parseBrDateToIso(value);
  });

const addressFieldsSchema = z.object({
  street: z.string().optional(),
  complement: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
});

export { emptyVehicleFormValues };

export const emptyAddressFormValues: z.infer<typeof addressFieldsSchema> = {
  street: "",
  complement: "",
  country: "Brasil",
  state: "",
  zipCode: "",
  city: "",
};

export { hasVehicleData };

export function hasCompleteAddress(address?: CustomerAddress | null): boolean {
  if (!address) return false;
  return Boolean(
    address.street?.trim() &&
    address.city?.trim() &&
    address.state?.trim() &&
    address.zipCode?.trim() &&
    address.country?.trim(),
  );
}

const customerFormBaseSchema = z.object({
  fullName: z.string().trim().min(1, "Informe o nome completo."),
  phone: phoneField,
  email: z.email("Informe um e-mail válido."),
  cpfCnpj: cpfCnpjField,
  nickname: optionalNullableTrimmed,
  birthDate: birthDateField,
  includeAddress: z.boolean(),
  includeVehicle: z.boolean(),
  address: addressFieldsSchema,
  vehicle: vehicleFieldsSchema,
});

export const customerFormSchema = customerFormBaseSchema.superRefine((data, ctx) => {
  if (data.includeAddress) {
    const requiredAddressFields: Array<{
      key: keyof z.infer<typeof addressFieldsSchema>;
      message: string;
    }> = [
      { key: "street", message: "Informe a rua." },
      { key: "city", message: "Informe a cidade." },
      { key: "state", message: "Informe a UF." },
      { key: "zipCode", message: "Informe o CEP." },
      { key: "country", message: "Informe o país." },
    ];

    for (const { key, message } of requiredAddressFields) {
      if (!data.address[key]?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["address", key],
          message,
        });
      }
    }

    const zipDigits = onlyDigits(data.address.zipCode ?? "");
    if (data.address.zipCode?.trim() && zipDigits.length !== 8) {
      ctx.addIssue({
        code: "custom",
        path: ["address", "zipCode"],
        message: "Informe um CEP válido.",
      });
    }
  }

  if (!data.includeVehicle) return;

  const plate = normalizePlate(data.vehicle.plate);
  if (plate && plate.length !== 7) {
    ctx.addIssue({
      code: "custom",
      path: ["vehicle", "plate"],
      message: "Placa inválida. Informe 7 caracteres.",
    });
  }

  const year = parseVehicleYear(data.vehicle.year);
  if (year !== undefined && (!Number.isInteger(year) || year < 1900)) {
    ctx.addIssue({
      code: "custom",
      path: ["vehicle", "year"],
      message: "Ano do veículo inválido (mínimo 1900).",
    });
  }
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
  includeAddress: false,
  includeVehicle: false,
  address: emptyAddressFormValues,
  vehicle: emptyVehicleFormValues,
};

export function customerToFormDefaults(
  customer: CustomerDto,
  primaryVehicle: CustomerVehicleDto | null | undefined = customer.vehicles?.[0],
): CustomerFormInput {
  return {
    fullName: customer.fullName ?? "",
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    cpfCnpj: customer.cpfCnpj ? formatCpfCnpj(customer.cpfCnpj) : "",
    nickname: customer.nickname ?? "",
    birthDate: customer.birthDate ? formatIsoDateToBr(customer.birthDate) : "",
    includeAddress: hasCompleteAddress(customer.address),
    includeVehicle: hasVehicleData(primaryVehicle),
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

function buildAddressPayload(address: CustomerFormValues["address"]): CustomerAddress | null {
  const street = address.street?.trim();
  const city = address.city?.trim();
  const state = address.state?.trim();
  const zipCode = address.zipCode?.trim();
  const country = address.country?.trim();

  if (!street || !city || !state || !zipCode || !country) {
    return null;
  }

  const complement = address.complement?.trim();

  return {
    street,
    city,
    state,
    zipCode,
    country,
    ...(complement ? { complement } : {}),
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
    address: values.includeAddress ? buildAddressPayload(values.address) : null,
  };
}

export function mapVehicleFormToPayload(values: CustomerFormValues): CreateVehiclePayload | null {
  if (!values.includeVehicle) return null;
  return mapVehicleFieldsToPayload(values.vehicle);
}
