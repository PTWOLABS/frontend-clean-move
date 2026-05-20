import { addMinutes, format, isSameDay, isSameMonth, isSameYear, subMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { AppointmentStatus } from "@/shared/types/appointments";

import type { AppointmentDTO } from "../types/appointments-dto";
import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
  AppointmentTone,
} from "../types/appointment-calendar";

type AppointmentListItem = AppointmentDTO["appointments"][number];

const DEFAULT_APPOINTMENT_DURATION_IN_MINUTES = 60;
const DEFAULT_ATTENDANTS = ["Patricia Costa", "Lucas Martins"];
const FALLBACK_CUSTOMER_NAMES = [
  "Ana Martins",
  "Bruno Costa",
  "Carla Souza",
  "Diego Lima",
  "Fernanda Rocha",
  "Mariana Alves",
];

function sortAppointmentsByStart(left: AppointmentCalendarEvent, right: AppointmentCalendarEvent) {
  return left.start.getTime() - right.start.getTime();
}

function getStableIndex(seed: string, size: number) {
  return [...seed].reduce((total, character) => total + character.charCodeAt(0), 0) % size;
}

function getFallbackCustomerName(appointmentId: string) {
  return FALLBACK_CUSTOMER_NAMES[getStableIndex(appointmentId, FALLBACK_CUSTOMER_NAMES.length)]!;
}

function getFallbackAttendants(appointmentId: string) {
  const startIndex = getStableIndex(appointmentId, DEFAULT_ATTENDANTS.length);
  return [
    DEFAULT_ATTENDANTS[startIndex]!,
    DEFAULT_ATTENDANTS[(startIndex + 1) % DEFAULT_ATTENDANTS.length]!,
  ];
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

function getVehicleLabel(appointment: AppointmentListItem) {
  if (!appointment.vehicle) {
    return "Veículo não informado";
  }

  const segments = [appointment.vehicle.brand, appointment.vehicle.model, appointment.vehicle.plate]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => value!.trim());

  return segments.length ? segments.join(" • ") : "Veículo não informado";
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
    return new Date(appointment.endsAt);
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
  const start = new Date(appointment.startsAt);
  const end = getAppointmentEnd(appointment, start);
  const services = getServicesSummary(appointment);

  return {
    id: appointment.id,
    title: services.title,
    start,
    end,
    extendedProps: {
      customer: getFallbackCustomerName(appointment.id),
      service: services.label,
      vehicle: getVehicleLabel(appointment),
      attendants: getFallbackAttendants(appointment.id),
      notes: appointment.description?.trim() || "Sem observações operacionais.",
      reminder: "Lembrete automático padrão",
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

export function getAppointmentsForDate(events: AppointmentCalendarEvent[], date: Date) {
  return events.filter((event) => isSameDay(event.start, date)).sort(sortAppointmentsByStart);
}

export function findNextAppointment(events: AppointmentCalendarEvent[], now: Date = new Date()) {
  return (
    events
      .filter(
        (event) =>
          event.extendedProps.status !== "CANCELLED" && event.start.getTime() >= now.getTime(),
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
