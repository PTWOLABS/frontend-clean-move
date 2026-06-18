import type { MutationFeedbackErrorOverride } from "@/shared/hooks/use-mutation-feedback-error";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

const CUSTOMER_RESOURCE_LABEL = "o cliente";
const CUSTOMER_RESOURCE_KEY = QUERY_KEYS.customers()[0];

export const CUSTOMER_MUTATION_ERROR_OVERRIDE: MutationFeedbackErrorOverride = {
  validation: {
    message: "Revise os dados informados antes de continuar.",
  },
  badRequest: {
    message: "Revise os dados informados antes de continuar.",
  },
  messages: [
    {
      match: /expected string|received undefined|received null|invalid input/i,
      message: "Revise os dados informados antes de continuar.",
      statusCode: 400,
    },
    {
      match: /phone|telefone/i,
      message: "Informe um telefone válido (10 ou 11 dígitos).",
      field: "phone",
      statusCode: 400,
    },
    {
      match: /email|e-mail/i,
      message: "Informe um e-mail válido.",
      field: "email",
      statusCode: 400,
    },
    {
      match: /cpf|cnpj|document/i,
      message: "Informe um CPF ou CNPJ válido.",
      field: "cpfCnpj",
      statusCode: 400,
    },
    {
      match: /phone|telefone/i,
      message: "Já existe um cliente com este telefone.",
      field: "phone",
      statusCode: 409,
    },
    {
      match: /email|e-mail/i,
      message: "Já existe um cliente com este e-mail.",
      field: "email",
      statusCode: 409,
    },
    {
      match: /cpf|cnpj|document/i,
      message: "Já existe um cliente com este CPF/CNPJ.",
      field: "cpfCnpj",
      statusCode: 409,
    },
  ],
};

export function getCustomerMutationFeedbackError(
  error: unknown,
  mutationType: "create" | "update",
) {
  return getMutationFeedbackError(
    CUSTOMER_RESOURCE_LABEL,
    CUSTOMER_RESOURCE_KEY,
    error,
    mutationType,
    CUSTOMER_MUTATION_ERROR_OVERRIDE,
  );
}

export function getVehicleCreationErrorMessage(error: ApiError): string {
  if (error.statusCode === 409 && error.message.includes("Vehicle already registered")) {
    return "Já existe um veículo com essa placa.";
  }

  return error.message || "Não foi possível cadastrar o veículo.";
}
