import { describe, expect, it } from "vitest";

import type { AppointmentDTO } from "../types/appointments-dto";
import {
  findNextAppointment,
  formatCalendarRange,
  getAppointmentsForDate,
  getStatusLabel,
  getViewLabel,
  mapAppointmentsToCalendarEvents,
} from "./appointments-calendar";

const response: AppointmentDTO = {
  appointments: [
    {
      id: "appointment-2",
      establishmentId: "est-1",
      customerId: "customer-2",
      customer: {
        fullName: "Marina Oliveira",
        currentResourceStatus: "UNCHANGED",
      },
      vehicleId: "vehicle-2",
      services: [
        {
          id: "service-2",
          name: "Vitrificacao",
          category: { id: "cat-detailing", name: "Detailing Automotivo" },
          durationInMinutes: 120,
          priceInCents: 35000,
          currentResourceStatus: "UNCHANGED",
        },
      ],
      vehicle: {
        plate: "ABC1D23",
        brand: "Toyota",
        model: "Corolla",
        color: "Preto",
        year: 2024,
        currentResourceStatus: "UNCHANGED",
      },
      startsAt: "2026-05-19T13:00:00.000Z",
      endsAt: "2026-05-19T15:00:00.000Z",
      description: "Validar acabamento final.",
      discountInCents: null,
      status: "DONE",
      createdAt: "2026-05-19T10:00:00.000Z",
      updatedAt: "2026-05-19T10:30:00.000Z",
      doneAt: "2026-05-19T15:30:00.000Z",
      cancelledAt: null,
    },
    {
      id: "appointment-1",
      establishmentId: "est-1",
      customerId: "customer-1",
      customer: {
        fullName: "João Pereira",
        currentResourceStatus: "UPDATED",
      },
      vehicleId: null,
      services: [
        {
          id: "service-1",
          name: "Lavagem tecnica",
          category: { id: "cat-wash", name: "Lavagem" },
          durationInMinutes: 45,
          priceInCents: 9000,
          currentResourceStatus: "UPDATED",
        },
        {
          id: "service-3",
          name: "Higienizacao",
          category: { id: "cat-interior", name: "Estofamento" },
          durationInMinutes: 30,
          priceInCents: 12000,
          currentResourceStatus: "DELETED",
        },
      ],
      vehicle: null,
      startsAt: "2026-05-20T09:00:00.000Z",
      endsAt: null,
      description: null,
      discountInCents: null,
      status: "SCHEDULED",
      createdAt: "2026-05-19T08:00:00.000Z",
      updatedAt: "2026-05-19T08:10:00.000Z",
      doneAt: null,
      cancelledAt: null,
    },
    {
      id: "appointment-3",
      establishmentId: "est-1",
      customerId: "customer-3",
      customer: null,
      vehicleId: null,
      services: [
        {
          id: "service-4",
          name: "Polimento",
          category: { id: "cat-detailing", name: "Detailing Automotivo" },
          durationInMinutes: 60,
          priceInCents: 15000,
          currentResourceStatus: "UNCHANGED",
        },
      ],
      vehicle: null,
      startsAt: "2026-05-21T10:00:00.000Z",
      endsAt: null,
      description: null,
      discountInCents: null,
      status: "CANCELLED",
      createdAt: "2026-05-19T08:00:00.000Z",
      updatedAt: "2026-05-19T08:10:00.000Z",
      doneAt: null,
      cancelledAt: "2026-05-19T08:30:00.000Z",
    },
  ],
};

describe("appointments-calendar helpers", () => {
  it("maps the API response to sorted calendar events with fallbacks", () => {
    const appointments = mapAppointmentsToCalendarEvents(response);

    expect(appointments).toHaveLength(3);
    expect(appointments[0]?.id).toBe("appointment-2");
    expect(appointments[1]?.title).toBe("Lavagem tecnica +1");
    expect(appointments[1]?.end.getHours()).toBe(10);
    expect(appointments[1]?.end.getMinutes()).toBe(15);
    expect(appointments[1]?.extendedProps.customer).toBe("João Pereira");
    expect(appointments[1]?.extendedProps.customerId).toBe("customer-1");
    expect(appointments[1]?.extendedProps.serviceIds).toEqual([
      { value: "service-1", label: "Lavagem tecnica" },
      { value: "service-3", label: "Higienizacao" },
    ]);
    expect(appointments[1]?.extendedProps.vehicleId).toBe("");
    expect(appointments[1]?.extendedProps.vehicle).toEqual({
      plate: "",
      brand: "",
      model: "",
      displayName: "Veículo não informado",
    });
    expect(appointments[1]?.extendedProps.services).toEqual([
      {
        serviceId: "service-1",
        label: "Lavagem tecnica",
        priceInCents: 9000,
        currentResourceStatus: "UPDATED",
      },
      {
        serviceId: "service-3",
        label: "Higienizacao",
        priceInCents: 12000,
        currentResourceStatus: "DELETED",
      },
    ]);
    expect(appointments[1]?.extendedProps.endsAt).toBeNull();
    expect(appointments[1]?.extendedProps.description).toBe("");
    expect(appointments[1]?.extendedProps.discountValue).toBe("");
    expect(appointments[1]?.extendedProps.notes).toBe("Sem observações operacionais.");
  });

  it("keeps vehicle plate separated from the display name", () => {
    const [appointment] = mapAppointmentsToCalendarEvents({
      appointments: [
        {
          ...response.appointments[0]!,
          vehicle: {
            plate: null,
            brand: "Toyota",
            model: "Corolla",
            color: "Preto",
            year: 2024,
            currentResourceStatus: "UNCHANGED",
          },
        },
      ],
    });

    expect(appointment?.extendedProps.vehicle).toEqual({
      plate: "",
      brand: "Toyota",
      model: "Corolla",
      displayName: "Toyota • Corolla",
    });
  });

  it("filters only the appointments of the selected day", () => {
    const appointments = mapAppointmentsToCalendarEvents(response);
    const selectedDate = new Date("2026-05-20T12:00:00.000Z");

    const filteredAppointments = getAppointmentsForDate(appointments, selectedDate);

    expect(filteredAppointments).toHaveLength(1);
    expect(filteredAppointments[0]?.title).toBe("Lavagem tecnica +1");
  });

  it("includes multi-day appointments that cover the selected day", () => {
    const appointments = mapAppointmentsToCalendarEvents({
      appointments: [
        {
          ...response.appointments[0]!,
          startsAt: "2026-05-01T00:00:00.000Z",
          endsAt: "2026-05-29T00:00:00.000Z",
        },
      ],
    });

    const filteredAppointments = getAppointmentsForDate(
      appointments,
      new Date("2026-05-18T12:00:00.000Z"),
    );

    expect(filteredAppointments).toHaveLength(1);
    expect(filteredAppointments[0]?.id).toBe("appointment-2");
  });

  it("uses a fallback customer label when the API does not embed customer details", () => {
    const [appointment] = mapAppointmentsToCalendarEvents({
      appointments: [
        {
          ...response.appointments[0]!,
          customer: null,
        },
      ],
    });

    expect(appointment?.extendedProps.customer).toBe("Cliente não informado");
  });

  it("returns the next upcoming appointment ignoring cancelled events", () => {
    const appointments = mapAppointmentsToCalendarEvents(response);
    const now = new Date("2026-05-20T08:00:00.000Z");

    const nextAppointment = findNextAppointment(appointments, now);

    expect(nextAppointment?.id).toBe("appointment-1");
  });

  it("formats the visible range for the custom header", () => {
    const start = new Date(2026, 4, 1);
    const endExclusive = new Date(2026, 5, 1);

    expect(formatCalendarRange(start, endExclusive)).toBe("1 de maio - 31 de maio de 2026");
  });

  it("exposes readable labels for views and statuses", () => {
    expect(getViewLabel("dayGridMonth")).toBe("Visão mensal");
    expect(getViewLabel("timeGridWeek")).toBe("Visão semanal");
    expect(getStatusLabel("SCHEDULED")).toBe("Agendado");
  });
});
