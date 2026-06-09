import type { Modify } from "@react-input/mask";

export const PHONE_MASK = "(__) _____-____";
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
export const cpfCnpjMaskModify: Modify = ({ value }) => {
  const digits = value.replace(/\D/g, "");
  return digits.length > 11 ? { mask: CNPJ_MASK } : { mask: CPF_MASK };
};
