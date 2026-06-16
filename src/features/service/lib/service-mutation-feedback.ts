import type { MutationFeedbackErrorOverride } from "@/shared/hooks/use-mutation-feedback-error";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

const SERVICE_RESOURCE_LABEL = "o serviço";
const SERVICE_RESOURCE_KEY = QUERY_KEYS.services()[0];

export const SERVICE_MUTATION_ERROR_OVERRIDE: MutationFeedbackErrorOverride = {
  forbidden: {
    title: "Sem permissão para gerir serviços.",
    message: "O seu utilizador não tem permissão para esta operação.",
  },
  notFound: {
    title: "Serviço não encontrado.",
    message: "O serviço pode ter sido removido. Atualize a página.",
  },
};

export function getServiceMutationFeedbackError(
  error: unknown,
  mutationType: "create" | "update" | "delete",
) {
  return getMutationFeedbackError(
    SERVICE_RESOURCE_LABEL,
    SERVICE_RESOURCE_KEY,
    error,
    mutationType,
    SERVICE_MUTATION_ERROR_OVERRIDE,
  );
}
