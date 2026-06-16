import type { AppointmentStatus } from "@/shared/types/appointments";

export type AppointmentDisplayStatus = AppointmentStatus | "IN_PROGRESS";

export type AppointmentStatusMeta = {
  label: string;
  className: string;
};

export const appointmentStatusMeta: Record<AppointmentDisplayStatus, AppointmentStatusMeta> = {
  IN_PROGRESS: {
    label: "Em andamento",
    className: "border-transparent bg-info-soft text-info hover:bg-info/10",
  },
  SCHEDULED: {
    label: "Agendado",
    className: "border-transparent bg-info-soft text-info hover:bg-info/10",
  },
  DONE: {
    label: "Concluído",
    className: "border-transparent bg-success-soft text-success hover:bg-success/10",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "border-transparent bg-danger-soft text-danger hover:bg-danger/10",
  },
};

export const appointmentStatusBadgeClassName: Record<AppointmentStatus, string> = {
  SCHEDULED: appointmentStatusMeta.SCHEDULED.className,
  DONE: appointmentStatusMeta.DONE.className,
  CANCELLED: appointmentStatusMeta.CANCELLED.className,
};

export function isAppointmentStatus(status: AppointmentDisplayStatus): status is AppointmentStatus {
  return status !== "IN_PROGRESS";
}
