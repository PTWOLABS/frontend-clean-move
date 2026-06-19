import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { AppointmentListItem } from "@/shared/utils/appointments-helpers";
import {
  getAppointmentAmountInCents,
  getCustomerName,
  getVehicleName,
  getVehiclePlate,
  parseAppointmentDateTime,
} from "@/shared/utils/appointments-helpers";
import { formatBrlFromCents, formatReaisToBrlInput } from "@/shared/money/format-brl-money";
import type { AppointmentMobileCardItem } from "./appointment-mobile-cards";
import type { AppointmentDisplayStatus } from "@/shared/utils/appointments-status";
import type { ResourceStatus } from "@/features/appointments/types/appointments-dto";

export type AppointmentPresentationService = {
  id: string;
  name: string;
  durationInMinutes: number | null;
  priceInCents: number;
  currentResourceStatus: ResourceStatus;
};

export type AppointmentPresentationItem = {
  id: string;
  customerId: string;
  customerResourceStatus: ResourceStatus;
  vehicleId: string;
  vehicleCurrentResourceStatus: ResourceStatus;
  startsAt: Date;
  endsAt: Date | null;
  time: string;
  timeRange: string;
  customerName: string;
  vehicleName: string;
  vehicleLabel: string;
  vehiclePlate: string;
  vehicleRawPlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleDisplayName: string;
  serviceName: string;
  amountInCents: number;
  discountValue: string;
  description: string;
  status: AppointmentDisplayStatus;
  services: AppointmentPresentationService[];
};

function mapAppointmentServices(
  appointment: AppointmentListItem,
): AppointmentPresentationService[] {
  return appointment.services.map((service) => ({
    id: service.id,
    name: service.name.trim() || "Serviço não informado",
    durationInMinutes: service.durationInMinutes,
    priceInCents: service.priceInCents,
    currentResourceStatus: service.currentResourceStatus,
  }));
}

export function mapAppointmentListItemToPresentationItem(
  appointment: AppointmentListItem,
): AppointmentPresentationItem {
  const startsAt = parseAppointmentDateTime(appointment.startsAt);
  const endsAt = appointment.endsAt ? parseAppointmentDateTime(appointment.endsAt) : null;
  const startTime = format(startsAt, "HH:mm", { locale: ptBR });
  const vehicleName = getVehicleName(appointment);
  const vehiclePlate = getVehiclePlate(appointment);
  const vehicleRawPlate = appointment.vehicle?.plate?.trim() ?? "";
  const vehicleBrand = appointment.vehicle?.brand?.trim() ?? "";
  const vehicleModel = appointment.vehicle?.model?.trim() ?? "";
  const vehicleDisplayName =
    [vehicleBrand, vehicleModel, vehicleRawPlate].filter(Boolean).join(" • ") ||
    "Veículo não informado";
  const services = mapAppointmentServices(appointment);

  return {
    id: appointment.id,
    customerId: appointment.customerId,
    customerResourceStatus: appointment.customer?.currentResourceStatus ?? "UNCHANGED",
    vehicleId: appointment.vehicleId ?? "",
    vehicleCurrentResourceStatus: appointment.vehicle?.currentResourceStatus ?? "UNCHANGED",
    startsAt,
    endsAt,
    time: startTime,
    timeRange: endsAt ? `${startTime} - ${format(endsAt, "HH:mm", { locale: ptBR })}` : startTime,
    customerName: getCustomerName(appointment),
    vehicleName,
    vehicleLabel: `${vehicleName} • ${vehiclePlate}`,
    vehiclePlate,
    vehicleRawPlate,
    vehicleBrand,
    vehicleModel,
    vehicleDisplayName,
    serviceName: services[0]?.name ?? "Serviço não informado",
    amountInCents: getAppointmentAmountInCents(appointment),
    discountValue:
      appointment.discountInCents === null || appointment.discountInCents === undefined
        ? ""
        : formatReaisToBrlInput(appointment.discountInCents / 100),
    description: appointment.description?.trim() ?? "",
    status: appointment.status,
    services,
  };
}

export function mapAppointmentPresentationItemToMobileCardItem(
  appointment: AppointmentPresentationItem,
  { dateLabel }: { dateLabel?: string } = {},
): AppointmentMobileCardItem {
  const servicesCount = appointment.services.length;

  return {
    id: appointment.id,
    dateLabel: dateLabel ?? format(appointment.startsAt, "dd/MM/yy", { locale: ptBR }),
    timeLabel: appointment.time,
    customerName: appointment.customerName,
    vehicleLabel: appointment.vehicleName,
    vehiclePlate: appointment.vehiclePlate,
    serviceName: appointment.serviceName,
    amountLabel: formatBrlFromCents(appointment.amountInCents),
    status: appointment.status,
    servicesCount,
    servicesTooltipLabel:
      servicesCount > 1 ? `${servicesCount} serviços do agendamento` : undefined,
  };
}

export function findAppointmentByMobileCardItem<TAppointment extends { id: string }>(
  appointments: TAppointment[],
  mobileAppointment: AppointmentMobileCardItem,
) {
  return appointments.find(({ id }) => id === mobileAppointment.id) ?? null;
}
