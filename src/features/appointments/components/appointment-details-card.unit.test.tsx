import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { AppointmentDetailsCard } from "./appointment-details-card";

const appointmentEvent: AppointmentCalendarEvent = {
  id: "appointment-1",
  title: "Lavagem tecnica +1",
  startsAt: new Date("2026-05-20T09:00:00.000Z"),
  end: new Date("2026-05-20T10:15:00.000Z"),
  extendedProps: {
    customerId: "customer-1",
    customer: "Ana Martins",
    serviceIds: [{ value: "service-1", label: "Lavagem tecnica" }],
    service: "Lavagem tecnica, Higienizacao",
    vehicleId: "vehicle-1",
    vehicle: "Veículo não informado",
    endsAt: new Date("2026-05-20T10:15:00.000Z"),
    description: "",
    discountValue: "",
    notes: "Sem observações operacionais.",
    tone: "info",
    status: "SCHEDULED",
  },
};

describe("AppointmentDetailsCard", () => {
  it("renders an error action when the query fails", () => {
    render(
      <AppointmentDetailsCard
        events={[]}
        selectedEventId={null}
        isLoading={false}
        isError
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("renders the selected event details", () => {
    render(
      <AppointmentDetailsCard
        events={[appointmentEvent]}
        selectedEventId="appointment-1"
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("Lavagem tecnica +1")).toBeInTheDocument();
    expect(screen.getByText("Lavagem tecnica, Higienizacao")).toBeInTheDocument();
  });
});
