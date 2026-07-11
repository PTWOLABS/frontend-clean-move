import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQuote } from "../../api/create-quote";
import type { CreateQuoteFormValues } from "../../types/create-quote";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { buildCreateQuoteBody } from "../../lib/create-quote-payload";
import { useRouter } from "@bprogress/next";
import { resolveCreateQuoteErrorFeedback } from "../../lib/create-quote-error-feedback";

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
      const feedback = resolveCreateQuoteErrorFeedback(error);

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
