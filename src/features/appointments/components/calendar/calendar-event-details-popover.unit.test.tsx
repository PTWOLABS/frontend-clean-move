import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";
import { CalendarEventDetailsPopover } from "./calendar-event-details-popover";

const deleteAppointmentMutationMock = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
}));

vi.mock("../../hooks/mutations/use-delete-appointment-mutation", () => ({
  useDeleteAppointment: () => deleteAppointmentMutationMock,
}));

const appointmentEvent: AppointmentCalendarEvent = {
  id: "appointment-1",
  title: "Lavagem tecnica +1",
  startsAt: new Date("2026-05-20T09:00:00.000Z"),
  end: new Date("2026-05-20T10:15:00.000Z"),
  extendedProps: {
    customerId: "customer-1",
    customer: "Ana Martins",
    serviceIds: [{ value: "service-1", label: "Lavagem tecnica" }],
    services: [
      {
        serviceId: "service-1",
        label: "Lavagem tecnica",
        priceInCents: 9000,
      },
      {
        serviceId: "service-2",
        label: "Higienizacao",
        priceInCents: 12000,
      },
    ],
    service: "Lavagem tecnica, Higienizacao",
    vehicleId: "vehicle-1",
    vehicle: {
      plate: "ABC-1234",
      brand: "Honda",
      model: "Civic",
      displayName: "Honda Civic ABC-1234",
    },
    endsAt: new Date("2026-05-20T10:15:00.000Z"),
    description: "",
    discountValue: "50,00",
    discountInCents: 5000,
    notes: "Sem observações operacionais.",
    tone: "info",
    status: "SCHEDULED",
  },
};

describe("CalendarEventDetailsPopover", () => {
  beforeEach(() => {
    deleteAppointmentMutationMock.mutate.mockClear();
  });

  it("shows the total amount with the appointment discount applied", () => {
    render(
      <CalendarEventDetailsPopover
        event={appointmentEvent}
        placement="bottom"
        popoverRef={vi.fn()}
        style={{}}
        isUpdatingStatus={false}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/R\$\s*160,00/)).toBeInTheDocument();
    expect(screen.queryByText(/R\$\s*210,00/)).not.toBeInTheDocument();
  });
});
