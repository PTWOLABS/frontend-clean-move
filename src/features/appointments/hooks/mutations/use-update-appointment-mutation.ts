"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { updateAppointment } from "../../api/update-appointment";
import type { UpdateAppointmentRequestBody } from "../../schemas/update-appointment-schema";

type UpdateAppointmentRequest = {
  appointmentId: string;
  body: UpdateAppointmentRequestBody;
};

const metricsQueriesToInvalidate: QueryKey[] = [
  QUERY_KEYS.metricsOverview,
  QUERY_KEYS.metricsAppointment,
  QUERY_KEYS.revenueAndAppointments,
];

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, body }: UpdateAppointmentRequest) => {
      return await updateAppointment(appointmentId, body);
    },
    onSuccess: async (_, { body }) => {
      const hasScheduleChange = "startsAt" in body || "endsAt" in body;
      const hasServiceChange = "serviceIds" in body || "services" in body;
      const hasRevenueChange = hasScheduleChange || hasServiceChange || "discountValue" in body;

      const queriesToInvalidate: QueryKey[] = [QUERY_KEYS.appointments()];

      if (hasRevenueChange) {
        queriesToInvalidate.push(...metricsQueriesToInvalidate);
      }

      if (hasServiceChange) {
        queriesToInvalidate.push(QUERY_KEYS.popularServices);
      }

      await Promise.all(
        queriesToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );

      toast.success("O agendamento foi atualizado com sucesso.");
    },
    onError: (error) => {
      const resourceKey = QUERY_KEYS.appointments()[0];
      const resourceLabel = "agendamento";
      const mutationType = "update";

      const feedback = getMutationFeedbackError(resourceLabel, resourceKey, error, mutationType);

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
