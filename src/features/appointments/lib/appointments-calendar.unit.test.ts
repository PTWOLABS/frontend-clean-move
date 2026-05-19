import { describe, expect, it } from "vitest";

import {
  buildInitialMockAppointments,
  buildMockAppointment,
  findNextAppointment,
  formatCalendarRange,
  getAppointmentsForDate,
  getStatusLabel,
  getViewLabel,
} from "./appointments-calendar";

describe("appointments-calendar helpers", () => {
  it("builds a sorted set of initial mock appointments", () => {
    const anchorDate = new Date("2026-05-19T09:00:00");
    const appointments = buildInitialMockAppointments(anchorDate);

    expect(appointments).toHaveLength(12);
    expect(appointments[0]?.start.getTime()).toBeLessThan(appointments[1]?.start.getTime());
    expect(appointments.at(-1)?.title).toBe("Entrega pós-serviço");
  });

  it("filters only the appointments of the selected day", () => {
    const anchorDate = new Date("2026-05-19T09:00:00");
    const appointments = buildInitialMockAppointments(anchorDate);
    const selectedDate = new Date("2026-05-20T12:00:00");

    const filteredAppointments = getAppointmentsForDate(appointments, selectedDate);

    expect(filteredAppointments).toHaveLength(2);
    expect(filteredAppointments.map((appointment) => appointment.title)).toEqual([
      "Revisão de orçamento",
      "Lavagem executiva",
    ]);
  });

  it("creates a new mock appointment after the last appointment of the day when only the date is selected", () => {
    const selectedDate = new Date("2026-05-19T00:00:00");
    const existingAppointments = [
      {
        id: "existing",
        title: "Atual",
        start: new Date("2026-05-19T09:00:00"),
        end: new Date("2026-05-19T10:00:00"),
        extendedProps: {
          customer: "Teste",
          service: "Teste",
          vehicle: "Teste",
          attendants: ["Equipe"],
          notes: "Teste",
          reminder: "Teste",
          tone: "primary" as const,
          status: "CONFIRMED" as const,
        },
      },
    ];

    const nextAppointment = buildMockAppointment(selectedDate, 0, existingAppointments);

    expect(nextAppointment.start.getHours()).toBe(10);
    expect(nextAppointment.start.getMinutes()).toBe(30);
    expect(nextAppointment.end.getHours()).toBe(11);
    expect(nextAppointment.end.getMinutes()).toBe(30);
  });

  it("keeps the selected slot time when creating another appointment in an occupied slot", () => {
    const selectedDate = new Date("2026-05-19T09:00:00");
    const existingAppointments = [
      {
        id: "existing",
        title: "Atual",
        start: new Date("2026-05-19T09:00:00"),
        end: new Date("2026-05-19T10:00:00"),
        extendedProps: {
          customer: "Teste",
          service: "Teste",
          vehicle: "Teste",
          attendants: ["Equipe"],
          notes: "Teste",
          reminder: "Teste",
          tone: "primary" as const,
          status: "CONFIRMED" as const,
        },
      },
    ];

    const nextAppointment = buildMockAppointment(selectedDate, 1, existingAppointments);

    expect(nextAppointment.start.getHours()).toBe(9);
    expect(nextAppointment.start.getMinutes()).toBe(0);
  });

  it("returns the next upcoming appointment based on the provided date", () => {
    const baseDate = new Date("2026-05-19T10:00:00");
    const appointments = buildInitialMockAppointments(baseDate);
    const now = new Date("2026-05-19T11:00:00");

    const nextAppointment = findNextAppointment(appointments, now);

    expect(nextAppointment?.title).toBe("Vitrificação rápida");
  });

  it("formats the visible range for the custom header", () => {
    const start = new Date("2026-05-01T00:00:00");
    const endExclusive = new Date("2026-06-01T00:00:00");

    expect(formatCalendarRange(start, endExclusive)).toBe("1 de maio - 31 de maio de 2026");
  });

  it("exposes readable labels for views and statuses", () => {
    expect(getViewLabel("dayGridMonth")).toBe("Visão mensal");
    expect(getViewLabel("timeGridWeek")).toBe("Visão semanal");
    expect(getStatusLabel("CHECK_IN")).toBe("Em andamento");
  });
});
