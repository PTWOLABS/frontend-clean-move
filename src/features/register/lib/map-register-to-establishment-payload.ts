import type { RegisterFormValues } from "../schemas/register-schema";
import type { RegisterEstablishmentPayload } from "../types";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** Gera slug estável a partir do nome fantasia (ex.: "Studio Clean" → "studio-clean"). */
export function slugifyTradeName(tradeName: string): string {
  const normalized = tradeName
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "establishment";
}

function formatZipCode(digits: string): string {
  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

export function mapRegisterToEstablishmentPayload(
  values: RegisterFormValues,
): RegisterEstablishmentPayload {
  const zipDigits = onlyDigits(values.zipCode);

  return {
    name: values.fullName.trim(),
    tradeName: values.tradeName.trim(),
    legalBusinessName: values.legalName.trim(),
    email: values.email.trim(),
    password: values.password,
    cnpj: onlyDigits(values.cnpj),
    phone: onlyDigits(values.phone),
    address: {
      street: `${values.street.trim()}, ${values.number.trim()}`,
      complement: values.complement.trim(),
      country: "Brasil",
      state: values.state,
      zipCode: formatZipCode(zipDigits),
      city: values.city.trim(),
    },
    slug: slugifyTradeName(values.tradeName),
  };
}
