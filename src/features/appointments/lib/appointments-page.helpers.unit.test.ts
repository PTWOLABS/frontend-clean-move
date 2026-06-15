import { describe, expect, it } from "vitest";

import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { formatAppointmentTimeRange } from "./appointments-page.helpers";

function makeAppointmentEvent({
  end,
  startsAt,
}: {
  end: Date;
  startsAt: Date;
}): AppointmentCalendarEvent {
  return {
    id: "appointment-1",
    title: "Consultoria de Detailing",
    startsAt,
    end,
    extendedProps: {
      customerId: "customer-1",
      customer: "Ana Martins",
      serviceIds: [{ value: "service-1", label: "Consultoria de Detailing" }],
      service: "Consultoria de Detailing",
      vehicleId: "vehicle-1",
      vehicle: {
        plate: "ABC-1234",
        brand: "Toyota",
        model: "Corolla",
        displayName: "Toyota - Corolla - ABC-1234",
      },
      endsAt: end,
      description: "",
      discountValue: "",
      notes: "Sem observacoes operacionais.",
      tone: "info",
      status: "SCHEDULED",
    },
  };
}

describe("appointments-page helpers", () => {
  it("formats same-day appointment time ranges with only hours", () => {
    const appointment = makeAppointmentEvent({
      startsAt: new Date(2026, 7, 1, 9, 0),
      end: new Date(2026, 7, 1, 10, 30),
    });

    expect(formatAppointmentTimeRange(appointment)).toBe("09:00 - 10:30");
  });

  it("includes the start and end dates when the appointment crosses days", () => {
    const appointment = makeAppointmentEvent({
      startsAt: new Date(2026, 7, 1, 0, 0),
      end: new Date(2026, 7, 29, 0, 0),
    });

    expect(formatAppointmentTimeRange(appointment)).toBe("1 de ago, 00:00 - 29 de ago, 00:00");
  });
});
