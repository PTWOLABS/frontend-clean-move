import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuote } from "../../api/create-quote";
import type { CreateQuoteFormValues } from "../../types/create-quote";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { buildCreateQuoteBody } from "../../lib/create-quote-payload";
import { useRouter } from "@bprogress/next";

export function useCreateQuote() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: CreateQuoteFormValues) => createQuote(buildCreateQuoteBody(values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quotes() });

      toast.success("Orçamento criado com sucesso.");
      router.replace("/quotes");
    },
    onError: (error) => {
      const resourceKey = QUERY_KEYS.quotes()[0];
      const resourceLabel = "orçamento";
      const mutationType = "create";

      const feedback = getMutationFeedbackError(resourceLabel, resourceKey, error, mutationType);

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
