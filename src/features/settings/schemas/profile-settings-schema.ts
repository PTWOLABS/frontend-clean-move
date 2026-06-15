import { z } from "zod";

import { formatPhone } from "@/features/customer/lib/format-customer-catalog";
import type { UpdateUserProfilePayload, User } from "@/features/user/types";
import { getChangedFields } from "@/shared/utils/get-changed-fields";
import { optionalText } from "@/shared/utils/required-text";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

function formatZipCode(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length === 8) {
    return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
  return value;
}

const addressSchema = z.object({
  zipCode: optionalText().refine(
    (value) => {
      if (!value) return true;

      return onlyDigits(value).length === 8;
    },
    {
      message: "Informe um CEP válido.",
    },
  ),
  street: optionalText(),
  complement: optionalText(),
  city: optionalText(),
  state: optionalText().refine(
    (value) => {
      if (!value) return true;

      return value.length === 2;
    },
    {
      message: "Use a sigla do estado (ex.: SP).",
    },
  ),
  country: optionalText(),
});

export const completeAddressSchema = z.object({
  zipCode: z
    .string()
    .trim()
    .refine((value) => onlyDigits(value).length === 8, "Informe um CEP válido."),
  street: z.string().trim().min(1, "Informe a rua."),
  city: z.string().trim().min(1, "Informe a cidade."),
  state: z.string().trim().length(2, "Use a sigla do estado (ex.: SP)."),
  country: z.string().trim().min(1, "Informe o país."),
  complement: optionalText(),
});

export const profileSettingsSchema = z.object({
  name: optionalText(),
  email: optionalText().refine(
    (value) => {
      if (!value) return true;

      return z.email().safeParse(value).success;
    },
    {
      message: "Informe um e-mail válido.",
    },
  ),
  phone: optionalText().refine(
    (value) => {
      if (!value) return true;

      const len = onlyDigits(value).length;
      return len === 10 || len === 11;
    },
    {
      message: "Informe um telefone válido (10 ou 11 dígitos).",
    },
  ),
  address: addressSchema,
});

export function createProfileSettingsSchema(initial: UpdateUserProfilePayload | null) {
  return profileSettingsSchema.superRefine((data, ctx) => {
    const parsed = profileSettingsSchema.safeParse(data);
    if (!parsed.success) {
      return;
    }

    const payload = mapProfileFormToPatchPayload(parsed.data);
    if (!isAddressPayloadChanged(payload, initial)) {
      return;
    }

    const addressResult = completeAddressSchema.safeParse(parsed.data.address);
    if (addressResult.success) {
      return;
    }

    for (const issue of addressResult.error.issues) {
      ctx.addIssue({
        ...issue,
        path: ["address", ...(issue.path ?? [])],
      });
    }
  });
}

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
    name: values.name?.trim() ?? "",
    email: values.email?.trim() ?? "",
    phone: onlyDigits(values.phone ?? ""),
    address: {
      street: values.address.street?.trim() ?? "",
      complement: complement ? complement : null,
      country: values.address.country?.trim() ?? "Brasil",
      state: (values.address.state?.trim() ?? "").toUpperCase(),
      zipCode: onlyDigits(values.address.zipCode ?? ""),
      city: values.address.city?.trim() ?? "",
    },
  };
}

export function getProfileChangedPayload(
  current: UpdateUserProfilePayload,
  initial: UpdateUserProfilePayload | null,
): UpdateUserProfilePayload {
  const changed = getChangedFields(
    current as Record<string, unknown>,
    initial as Record<string, unknown> | null,
  ) as UpdateUserProfilePayload;

  if (changed.address && current.address) {
    changed.address = current.address;
  }

  return changed;
}

export function isAddressPayloadChanged(
  current: UpdateUserProfilePayload,
  initial: UpdateUserProfilePayload | null,
): boolean {
  return "address" in getProfileChangedPayload(current, initial);
}

export function canSaveProfileSettings(
  values: unknown,
  initial: UpdateUserProfilePayload | null,
): boolean {
  const schema = createProfileSettingsSchema(initial);
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    return false;
  }

  const payload = mapProfileFormToPatchPayload(parsed.data);
  return hasProfileChanges(payload, initial);
}

export function hasProfileChanges(
  current: UpdateUserProfilePayload,
  initial: UpdateUserProfilePayload | null,
): boolean {
  return Object.keys(getProfileChangedPayload(current, initial)).length > 0;
}
