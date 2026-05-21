"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { getQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.appointments(),
      });
      toast.success("Agendamento criado com sucesso.");
    },
    onError: (error) => {
      const resourceKey = QUERY_KEYS.appointments()[0];
      const resourceLabel = "agendamento";
      const feedback = getQueryFeedbackError(resourceLabel, resourceKey, error);

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
