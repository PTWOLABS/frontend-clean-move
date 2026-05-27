import { describe, expect, it } from "vitest";

import type { AppointmentDTO } from "../types/appointments-dto";
import { mapAppointmentsToCalendarEvents } from "./appointments-calendar";

describe("appointments calendar timezone mapping", () => {
  it("preserves the API appointment time when mapping UTC-shaped strings to calendar dates", () => {
    const response: AppointmentDTO = {
      appointments: [
        {
          id: "appointment-timezone",
          establishmentId: "est-1",
          customerId: "customer-1",
          customer: {
            name: "Cliente",
          },
          vehicleId: null,
          services: [
            {
              id: "service-1",
              name: "Lavagem",
              category: "WASH",
              durationInMinutes: 60,
              priceInCents: 10000,
            },
          ],
          vehicle: null,
          startsAt: "2026-12-25T12:30:00Z",
          endsAt: "2026-12-25T14:00:00Z",
          description: null,
          discountInCents: null,
          status: "SCHEDULED",
          createdAt: "2026-12-20T10:00:00Z",
          updatedAt: "2026-12-20T10:00:00Z",
          doneAt: null,
          cancelledAt: null,
        },
      ],
    };

    const [appointment] = mapAppointmentsToCalendarEvents(response);

    expect(appointment?.start.getFullYear()).toBe(2026);
    expect(appointment?.start.getMonth()).toBe(11);
    expect(appointment?.start.getDate()).toBe(25);
    expect(appointment?.start.getHours()).toBe(12);
    expect(appointment?.start.getMinutes()).toBe(30);
    expect(appointment?.end.getHours()).toBe(14);
    expect(appointment?.end.getMinutes()).toBe(0);
  });
});
