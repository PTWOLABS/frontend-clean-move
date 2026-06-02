import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentStatus } from "../types/appointments";
import { AppointmentDTO } from "@/features/appointments/types/appointments-dto";

export type AppointmentListItem = AppointmentDTO["appointments"][number];

export type AppointmentHistoryStatusMeta = {
  label: string;
  className: string;
};

export const API_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?/;

export const appointmentsHistoryStatusMeta: Record<
  AppointmentStatus,
  AppointmentHistoryStatusMeta
> = {
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

export function parseAppointmentDateTime(value: string) {
  const match = API_DATE_TIME_PATTERN.exec(value);

  if (!match) {
    return new Date(value);
  }

  const [, year, month, day, hour, minute, second = "0", millisecond = "0"] = match;

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(millisecond.slice(0, 3).padEnd(3, "0")),
  );
}

export function getAppointmentDateTimeLabels(startsAt: string) {
  const date = parseAppointmentDateTime(startsAt);

  return {
    date: format(date, "dd/MM/yyyy", { locale: ptBR }),
    time: format(date, "HH:mm", { locale: ptBR }),
  };
}

export function getCustomerName(appointment: AppointmentListItem) {
  return appointment.customer?.fullName?.trim() || "Cliente não informado";
}

export function getVehicleBrandLabel(appointment: AppointmentListItem) {
  return appointment.vehicle?.brand?.trim() || "--";
}

export function getVehicleModelLabel(appointment: AppointmentListItem) {
  const model = appointment.vehicle?.model?.trim();
  const year = appointment.vehicle?.year;

  if (model && year) {
    return `${model} ${year}`;
  }

  return model || "Veículo não informado";
}

export function getServiceName(appointment: AppointmentListItem) {
  const serviceNames = appointment.services
    .map((service) => service.name.trim())
    .filter((serviceName) => serviceName.length > 0);

  if (!serviceNames.length) {
    return "Serviço não informado";
  }

  if (serviceNames.length === 1) {
    return serviceNames[0]!;
  }

  return `${serviceNames[0]} +${serviceNames.length - 1}`;
}

export function getAppointmentAmountInCents(appointment: AppointmentListItem) {
  const servicesAmountInCents = appointment.services.reduce(
    (total, service) => total + service.priceInCents,
    0,
  );

  return Math.max(servicesAmountInCents - (appointment.discountInCents ?? 0), 0);
}
