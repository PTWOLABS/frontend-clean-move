import type { CustomerFormInput } from "../schemas/customer-form-schema";

const API_PATH_TO_FORM_FIELD: Record<string, keyof CustomerFormInput> = {
  cpfCnpj: "cpfCnpj",
  phone: "phone",
  email: "email",
  fullName: "fullName",
  "customer.phone": "phone",
  "customer.email": "email",
  "customer.cpfCnpj": "cpfCnpj",
  "customer.fullName": "fullName",
};

const DEFAULT_FIELD_MESSAGES: Partial<Record<keyof CustomerFormInput, string>> = {
  phone: "Informe um telefone válido (10 ou 11 dígitos).",
  email: "Informe um e-mail válido.",
  cpfCnpj: "Informe um CPF ou CNPJ válido.",
  fullName: "Informe o nome completo.",
};

function isTechnicalValidationMessage(message: string) {
  return (
    /expected string/i.test(message) ||
    /received undefined/i.test(message) ||
    /received null/i.test(message) ||
    /invalid input/i.test(message)
  );
}

export function sanitizeCustomerFieldErrorMessage(
  field: keyof CustomerFormInput,
  message: string,
): string {
  if (isTechnicalValidationMessage(message)) {
    return DEFAULT_FIELD_MESSAGES[field] ?? "Revise este campo antes de continuar.";
  }

  return message;
}

export function mapCustomerApiPathToFormField(
  apiPath: string,
): keyof CustomerFormInput | undefined {
  return API_PATH_TO_FORM_FIELD[apiPath];
}

export function mapCustomerApiFieldErrorsToForm(
  fieldErrors: Record<string, string>,
): Partial<Record<keyof CustomerFormInput, string>> {
  return Object.entries(fieldErrors).reduce<Partial<Record<keyof CustomerFormInput, string>>>(
    (mapped, [apiPath, message]) => {
      const formField = mapCustomerApiPathToFormField(apiPath);
      if (formField && !mapped[formField]) {
        mapped[formField] = sanitizeCustomerFieldErrorMessage(formField, message);
      }
      return mapped;
    },
    {},
  );
}
