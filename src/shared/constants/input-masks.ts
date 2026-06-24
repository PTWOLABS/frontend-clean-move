import type { Modify } from "@react-input/mask";

export const PHONE_MASK_MOBILE = "(__) _____-____";
export const PHONE_MASK_LANDLINE = "(__) ____-____";
/** @deprecated Prefer `PHONE_MASK_MOBILE` ou `getPhoneMask`. */
export const PHONE_MASK = PHONE_MASK_MOBILE;
export const CPF_MASK = "___.___.___-__";
export const CNPJ_MASK = "__.___.___/____-__";
export const ZIP_CODE_MASK = "_____-___";
export const DATE_MASK = "__/__/____";

/** CPF até 11 dígitos; a partir do 12.º usa máscara de CNPJ. */
export function getCpfCnpjMask(value = ""): string {
  const digits = value.replace(/\D/g, "");
  return digits.length > 11 ? CNPJ_MASK : CPF_MASK;
}

/** Troca dinamicamente entre máscara de CPF e CNPJ durante a digitação. */
export const cpfCnpjMaskModify: Modify = ({ value, data, selectionStart, selectionEnd }) => {
  const hasSelection = typeof selectionStart === "number" && typeof selectionEnd === "number";
  const nextValue = hasSelection
    ? value.slice(0, selectionStart) + (data ?? "") + value.slice(selectionEnd)
    : value;
  const digits = nextValue.replace(/\D/g, "");

  return digits.length > 11 ? { mask: CNPJ_MASK } : { mask: CPF_MASK };
};

function resolvePhoneMask(digits: string): string {
  if (digits.length > 10) return PHONE_MASK_MOBILE;
  if (digits.length === 10) return PHONE_MASK_LANDLINE;
  if (digits.length >= 3 && digits[2] === "9") return PHONE_MASK_MOBILE;
  return PHONE_MASK_LANDLINE;
}

/** Celular (11 dígitos) ou fixo (10 dígitos), conforme o valor atual. */
export function getPhoneMask(value = ""): string {
  const digits = value.replace(/\D/g, "");
  return resolvePhoneMask(digits);
}

/** Troca dinamicamente entre máscara de fixo e celular durante a digitação. */
export const phoneMaskModify: Modify = ({ value, data, selectionStart, selectionEnd }) => {
  const hasSelection = typeof selectionStart === "number" && typeof selectionEnd === "number";
  const nextValue = hasSelection
    ? value.slice(0, selectionStart) + (data ?? "") + value.slice(selectionEnd)
    : value;
  const digits = nextValue.replace(/\D/g, "");

  return { mask: resolvePhoneMask(digits) };
};
