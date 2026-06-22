import { addMinutes, format, isSameMonth, isSameYear, startOfDay, subMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

import { formatReaisToBrlInput } from "@/shared/money/format-brl-money";
import type { AppointmentStatus } from "@/shared/types/appointments";

import type { AppointmentDTO } from "../types/appointments-dto";
import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
  AppointmentTone,
  AppointmentVehicleExtendedProps,
} from "../types/appointment-calendar";
import { parseAppointmentDateTime } from "@/shared/utils/appointments-helpers";

type AppointmentListItem = AppointmentDTO["appointments"][number];

const DEFAULT_APPOINTMENT_DURATION_IN_MINUTES = 60;
const FALLBACK_CUSTOMER_LABEL = "Cliente não informado";
const FALLBACK_VEHICLE_LABEL = "Veículo não informado";

function sortAppointmentsByStart(left: AppointmentCalendarEvent, right: AppointmentCalendarEvent) {
  return left.startsAt.getTime() - right.startsAt.getTime();
}

function getCustomerLabel(appointment: AppointmentListItem) {
  const customerLabel = appointment.customer?.fullName;

  return customerLabel?.trim() || FALLBACK_CUSTOMER_LABEL;
}

function getServicesSummary(appointment: AppointmentListItem) {
  const serviceNames = appointment.services
    .map((service) => service.name.trim())
    .filter((serviceName) => serviceName.length > 0);

  if (!serviceNames.length) {
    return {
      title: "Serviço não informado",
      label: "Serviço não informado",
    };
  }

  if (serviceNames.length === 1) {
    return {
      title: serviceNames[0]!,
      label: serviceNames[0]!,
    };
  }

  return {
    title: `${serviceNames[0]} +${serviceNames.length - 1}`,
    label: serviceNames.join(", "),
  };
}

function getServiceOptions(appointment: AppointmentListItem) {
  return appointment.services.map((service) => ({
    value: service.id,
    label: service.name.trim() || "Serviço não informado",
  }));
}

function getPricedServices(appointment: AppointmentListItem) {
  return appointment.services.map((service) => ({
    serviceId: service.id,
    label: service.name.trim() || "Serviço não informado",
    priceInCents: service.priceInCents,
    currentResourceStatus: service.currentResourceStatus,
  }));
}

function normalizeVehicleText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function getVehicleDetails(appointment: AppointmentListItem): AppointmentVehicleExtendedProps {
  if (!appointment.vehicle) {
    return {
      plate: "",
      brand: "",
      model: "",
      displayName: FALLBACK_VEHICLE_LABEL,
    };
  }

  const plate = normalizeVehicleText(appointment.vehicle.plate);
  const brand = normalizeVehicleText(appointment.vehicle.brand);
  const model = normalizeVehicleText(appointment.vehicle.model);
  const displayName = [brand, model, plate].filter(Boolean).join(" • ") || FALLBACK_VEHICLE_LABEL;

  return {
    plate,
    brand,
    model,
    displayName,
    currentResourceStatus: appointment.vehicle.currentResourceStatus,
  };
}

function getDiscountValue(appointment: AppointmentListItem) {
  if (appointment.discountInCents === null || appointment.discountInCents === undefined) {
    return "";
  }

  return formatReaisToBrlInput(appointment.discountInCents / 100);
}

function getAppointmentDurationInMinutes(appointment: AppointmentListItem) {
  const totalDuration = appointment.services.reduce((total, service) => {
    if (!service.durationInMinutes || service.durationInMinutes <= 0) {
      return total;
    }

    return total + service.durationInMinutes;
  }, 0);

  return totalDuration > 0 ? totalDuration : DEFAULT_APPOINTMENT_DURATION_IN_MINUTES;
}

function getAppointmentEnd(appointment: AppointmentListItem, start: Date) {
  if (appointment.endsAt) {
    return parseAppointmentDateTime(appointment.endsAt);
  }

  return addMinutes(start, getAppointmentDurationInMinutes(appointment));
}

function getAppointmentTone(status: AppointmentStatus): AppointmentTone {
  switch (status) {
    case "DONE":
      return "success";
    case "CANCELLED":
      return "danger";
    case "SCHEDULED":
      return "info";
  }
}

export function mapAppointmentToCalendarEvent(
  appointment: AppointmentListItem,
): AppointmentCalendarEvent {
  const start = parseAppointmentDateTime(appointment.startsAt);
  const end = getAppointmentEnd(appointment, start);
  const explicitEnd = appointment.endsAt ? parseAppointmentDateTime(appointment.endsAt) : null;
  const services = getServicesSummary(appointment);
  const vehicle = getVehicleDetails(appointment);
  const description = appointment.description?.trim() ?? "";

  return {
    id: appointment.id,
    title: services.title,
    startsAt: start,
    end,
    extendedProps: {
      customerId: appointment.customerId,
      customer: getCustomerLabel(appointment),
      customerResourceStatus: appointment.customer?.currentResourceStatus,
      serviceIds: getServiceOptions(appointment),
      services: getPricedServices(appointment),
      service: services.label,
      vehicleId: appointment.vehicleId ?? "",
      vehicle,
      endsAt: explicitEnd,
      description,
      discountValue: getDiscountValue(appointment),
      discountInCents: appointment.discountInCents ?? 0,
      notes: description || "Sem observações operacionais.",
      tone: getAppointmentTone(appointment.status),
      status: appointment.status,
    },
  };
}

export function mapAppointmentsToCalendarEvents(
  response: AppointmentDTO | null | undefined,
): AppointmentCalendarEvent[] {
  const appointments = response?.appointments ?? [];

  return appointments.map(mapAppointmentToCalendarEvent).sort(sortAppointmentsByStart);
}

export function getAppointmentCalendarAmountInCents(event: AppointmentCalendarEvent) {
  const servicesAmountInCents =
    event.extendedProps.services?.reduce((total, service) => total + service.priceInCents, 0) ?? 0;

  return Math.max(servicesAmountInCents - (event.extendedProps.discountInCents ?? 0), 0);
}

export function getAppointmentsForDate(events: AppointmentCalendarEvent[], date: Date) {
  const selectedDay = startOfDay(date).getTime();

  return events
    .filter((event) => {
      const eventStartDay = startOfDay(event.startsAt).getTime();
      const eventEndDay = startOfDay(event.end).getTime();

      return eventStartDay <= selectedDay && eventEndDay >= selectedDay;
    })
    .sort(sortAppointmentsByStart);
}

export function findNextAppointment(events: AppointmentCalendarEvent[], now: Date = new Date()) {
  return (
    events
      .filter(
        (event) =>
          event.extendedProps.status !== "CANCELLED" && event.startsAt.getTime() >= now.getTime(),
      )
      .sort(sortAppointmentsByStart)[0] ?? null
  );
}

export function formatCalendarRange(start: Date, endExclusive: Date) {
  const inclusiveEnd = subMinutes(endExclusive, 1);
  const startLabel = format(start, "d 'de' MMMM", { locale: ptBR });
  const endLabel = format(
    inclusiveEnd,
    isSameYear(start, inclusiveEnd) ? "d 'de' MMMM 'de' yyyy" : "d 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  );

  if (isSameMonth(start, inclusiveEnd) && isSameYear(start, inclusiveEnd)) {
    return `${startLabel} - ${endLabel}`;
  }

  if (isSameYear(start, inclusiveEnd)) {
    return `${startLabel} - ${endLabel}`;
  }

  return `${format(start, "d 'de' MMMM 'de' yyyy", { locale: ptBR })} - ${endLabel}`;
}

export function getViewLabel(view: AppointmentCalendarView) {
  switch (view) {
    case "dayGridMonth":
      return "Visão mensal";
    case "timeGridWeek":
      return "Visão semanal";
    case "timeGridDay":
      return "Visão diária";
    case "listWeek":
      return "Visão em lista";
  }
}

export function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case "DONE":
      return "Finalizado";
    case "SCHEDULED":
      return "Agendado";
    case "CANCELLED":
      return "Cancelado";
  }
}
