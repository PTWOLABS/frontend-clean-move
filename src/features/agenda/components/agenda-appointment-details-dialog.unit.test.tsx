import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TodayAgendaItem } from "./today-agenda-card";
import { AgendaAppointmentDetailsDialog } from "./agenda-appointment-details-dialog";

function makeAgendaAppointment({
  endsAt,
  startsAt,
}: {
  endsAt: Date | null;
  startsAt: Date;
}): TodayAgendaItem {
  return {
    id: "appointment-1",
    customerId: "customer-1",
    vehicleId: "vehicle-1",
    startsAt,
    endsAt,
    time: "09:00",
    timeRange: "09:00 - 10:00",
    customerName: "Ana Martins",
    vehicleName: "Toyota Corolla",
    vehicleLabel: "Toyota Corolla - ABC-1234",
    vehiclePlate: "ABC-1234",
    vehicleRawPlate: "ABC-1234",
    vehicleBrand: "Toyota",
    vehicleModel: "Corolla",
    vehicleDisplayName: "Toyota Corolla - ABC-1234",
    serviceName: "Consultoria de Detailing",
    amountInCents: 15000,
    discountValue: "",
    description: "",
    status: "SCHEDULED",
    services: [
      {
        id: "service-1",
        name: "Consultoria de Detailing",
        durationInMinutes: 60,
        priceInCents: 15000,
      },
    ],
  };
}

describe("AgendaAppointmentDetailsDialog", () => {
  it("shows explicit start and end dates for multi-day appointments", () => {
    render(
      <AgendaAppointmentDetailsDialog
        appointment={makeAgendaAppointment({
          startsAt: new Date(2026, 7, 1, 0, 0),
          endsAt: new Date(2026, 7, 29, 0, 0),
        })}
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveTextContent(/, 1 de ago, 00:00 - 29 de ago, 00:00/);
    expect(screen.getByText("1 de ago, 00:00 - 29 de ago, 00:00")).toBeInTheDocument();
    expect(screen.getByText(/per.odo/i)).toBeInTheDocument();
  });

  it("keeps the compact time label for same-day appointments", () => {
    render(
      <AgendaAppointmentDetailsDialog
        appointment={makeAgendaAppointment({
          startsAt: new Date(2026, 7, 1, 9, 0),
          endsAt: new Date(2026, 7, 1, 10, 0),
        })}
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveTextContent(/09:00 - 10:00/);
    expect(screen.getByText("09:00 - 10:00")).toBeInTheDocument();
    expect(screen.getByText(/hor.rio/i)).toBeInTheDocument();
  });
});
