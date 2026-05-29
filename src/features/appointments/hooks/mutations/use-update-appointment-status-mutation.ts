"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { updateAppointmentStatus } from "../../api/update-appointment-status";

type UpdateAppointmentStatusRequest = {
  appointmentId: string;
  status: AppointmentStatus;
};

const queriesToInvalidate: QueryKey[] = [
  QUERY_KEYS.appointments(),
  QUERY_KEYS.metricsOverview,
  QUERY_KEYS.metricsAppointment,
  QUERY_KEYS.revenueAndAppointments,
  QUERY_KEYS.popularServices,
];

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, status }: UpdateAppointmentStatusRequest) => {
      return await updateAppointmentStatus(appointmentId, status);
    },
    onSuccess: async () => {
      await Promise.all(
        queriesToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );

      toast.success("Status do agendamento atualizado com sucesso.");
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
