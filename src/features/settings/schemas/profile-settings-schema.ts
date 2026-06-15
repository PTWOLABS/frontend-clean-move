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

const emptyAddressPayload = {
  street: "",
  complement: null,
  country: "",
  state: "",
  zipCode: "",
  city: "",
} as const;

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

  if (!changed.address || !current.address) {
    return changed;
  }

  const initialAddress = initial?.address ?? emptyAddressPayload;
  const addressChanges = getChangedFields(
    current.address as Record<string, unknown>,
    initialAddress as Record<string, unknown>,
  );

  if (Object.keys(addressChanges).length > 0) {
    changed.address = addressChanges;
  } else {
    delete changed.address;
  }

  return changed;
}

export function hasProfileChanges(
  current: UpdateUserProfilePayload,
  initial: UpdateUserProfilePayload | null,
): boolean {
  return Object.keys(getProfileChangedPayload(current, initial)).length > 0;
}
