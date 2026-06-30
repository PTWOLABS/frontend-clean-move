import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentDTO } from "@/features/appointments/types/appointments-dto";
import { parseApiDateTimeAsLocalDate } from "@/shared/utils/lib";

export type AppointmentListItem = AppointmentDTO["appointments"][number];

const fallbackVehicleLabel = "Veículo não informado";
const fallbackPlateLabel = "Sem placa";

export function parseAppointmentDateTime(value: string) {
  return parseApiDateTimeAsLocalDate(value);
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

export function getVehicleName(appointment: AppointmentListItem) {
  if (!appointment.vehicle) {
    return fallbackVehicleLabel;
  }

  const vehicleName = [appointment.vehicle.brand, appointment.vehicle.model]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => value!.trim())
    .join(" ");

  return vehicleName || fallbackVehicleLabel;
}

export function getVehiclePlate(appointment: AppointmentListItem) {
  return appointment.vehicle?.plate?.trim() || fallbackPlateLabel;
}
