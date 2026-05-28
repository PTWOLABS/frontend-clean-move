"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { createAppointment } from "../../api/create-appointment";
import { CreateAppointmentRequestBody } from "../../schemas/create-appointment-schema";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateAppointmentRequestBody) => {
      return await createAppointment(body);
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
      const mutationType = "create";

      const feedback = getMutationFeedbackError(resourceLabel, resourceKey, error, mutationType);

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
