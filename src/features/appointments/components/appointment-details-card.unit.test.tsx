import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { AppointmentDetailsCard } from "./appointment-details-card";

const appointmentEvent: AppointmentCalendarEvent = {
  id: "appointment-1",
  title: "Lavagem tecnica +1",
  start: new Date("2026-05-20T09:00:00.000Z"),
  end: new Date("2026-05-20T10:15:00.000Z"),
  extendedProps: {
    customer: "Ana Martins",
    service: "Lavagem tecnica, Higienizacao",
    vehicle: "Veículo não informado",
    attendants: ["Patricia Costa", "Lucas Martins"],
    notes: "Sem observações operacionais.",
    reminder: "Lembrete automático padrão",
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
