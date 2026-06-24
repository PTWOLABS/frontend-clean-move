"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";

import { deleteAppointment } from "../../api/delete-appointment";
import { removeAppointmentFromAppointmentsCache } from "../../lib/appointments-query-cache";

const metricsQueriesToInvalidate: QueryKey[] = [
  QUERY_KEYS.metricsOverview,
  QUERY_KEYS.metricsAppointment,
  QUERY_KEYS.revenueAndAppointments,
  QUERY_KEYS.popularServices,
];

const deleteAppointmentFeedbackOverride = {
  badRequest: {
    title: "Agendamento inválido.",
    message: "Verifique o agendamento selecionado e tente novamente.",
  },
  forbidden: {
    title: "Acesso negado.",
    message: "Seu usuário não tem a função ou recurso necessário para apagar este agendamento.",
  },
  notFound: {
    title: "Agendamento não encontrado.",
    message: "O agendamento ou perfil do estabelecimento não foi encontrado.",
  },
  serverError: {
    title: "Não foi possível apagar o agendamento.",
    message: "O servidor falhou ao apagar o agendamento. Tente novamente em instantes.",
  },
} as const;

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => deleteAppointment(appointmentId),
    onSuccess: async (_data, appointmentId) => {
      removeAppointmentFromAppointmentsCache(queryClient, appointmentId);

      await Promise.all(
        metricsQueriesToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );

      toast.success("Agendamento apagado com sucesso.");
    },
    onError: (error) => {
      const resourceKey = QUERY_KEYS.appointments()[0];
      const resourceLabel = "agendamento";
      const mutationType = "delete";

      const feedback = getMutationFeedbackError(
        resourceLabel,
        resourceKey,
        error,
        mutationType,
        deleteAppointmentFeedbackOverride,
      );

      toast.error(feedback.title, {
        id: feedback.id,
        description: feedback.description,
      });
    },
  });
}
