"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { createAppointment } from "../../api/create-appointment";
import { CreateAppointmentRequestBody } from "../../schemas/create-appointment-schema";

const queriesToInvalidate: QueryKey[] = [
  QUERY_KEYS.appointments(),
  QUERY_KEYS.metricsOverview,
  QUERY_KEYS.metricsAppointment,
  QUERY_KEYS.revenueAndAppointments,
  QUERY_KEYS.popularServices,
];

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateAppointmentRequestBody) => {
      return await createAppointment(body);
    },
    onSuccess: async () => {
      await Promise.all(
        queriesToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );

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
