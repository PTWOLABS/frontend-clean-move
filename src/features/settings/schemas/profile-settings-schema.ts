import { z } from "zod";

import { formatPhone } from "@/features/customer/lib/format-customer-catalog";
import type { UpdateUserProfilePayload, User } from "@/features/user/types";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

function formatZipCode(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length === 8) {
    return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
  return value;
}

const requiredText = (field: string) => z.string().trim().min(1, `Informe ${field}.`);

const addressSchema = z.object({
  zipCode: z
    .string()
    .trim()
    .refine((value) => onlyDigits(value).length === 8, "Informe um CEP válido."),
  street: requiredText("a rua"),
  complement: z.string().optional(),
  city: requiredText("a cidade"),
  state: z.string().trim().min(2, "Informe o estado.").max(2, "Use a sigla do estado (ex.: SP)."),
  country: z.string().trim().min(1, "Informe o país."),
});

export const profileSettingsSchema = z.object({
  name: requiredText("o nome").min(2, "Informe um nome válido."),
  email: z.string().trim().email("Informe um e-mail válido."),
  phone: z
    .string()
    .trim()
    .refine((value) => {
      const len = onlyDigits(value).length;
      return len === 10 || len === 11;
    }, "Informe um telefone válido (10 ou 11 dígitos)."),
  address: addressSchema,
});

export type ProfileSettingsFormInput = z.input<typeof profileSettingsSchema>;
export type ProfileSettingsFormValues = z.output<typeof profileSettingsSchema>;

export const profileSettingsDefaultValues: ProfileSettingsFormInput = {
  name: "",
  email: "",
  phone: "",
  address: {
    zipCode: "",
    street: "",
    complement: "",
    city: "",
    state: "",
    country: "Brasil",
  },
};

export function mapUserToProfileFormDefaults(user: User): ProfileSettingsFormInput {
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ? formatPhone(user.phone) : "",
    address: {
      zipCode: user.address?.zipCode ? formatZipCode(user.address.zipCode) : "",
      street: user.address?.street ?? "",
      complement: user.address?.complement ?? "",
      city: user.address?.city ?? "",
      state: user.address?.state ?? "",
      country: user.address?.country ?? "Brasil",
    },
  };
}

export function mapProfileFormToPatchPayload(
  values: ProfileSettingsFormValues,
): UpdateUserProfilePayload {
  const complement = values.address.complement?.trim();

  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: onlyDigits(values.phone),
    address: {
      street: values.address.street.trim(),
      complement: complement ? complement : null,
      country: values.address.country.trim(),
      state: values.address.state.trim().toUpperCase(),
      zipCode: onlyDigits(values.address.zipCode),
      city: values.address.city.trim(),
    },
  };
}
