import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NextAppointmentItem, UpcomingAppointmentsCard } from "./upcoming-appointments-card";
import type { NextAppointment } from "./upcoming-appointments-card";

function makeAppointment(overrides: Partial<NextAppointment> = {}): NextAppointment {
  return {
    id: "appointment-1",
    startsAt: new Date(2026, 4, 21, 14),
    serviceName: "Lavagem completa",
    customerName: "João da Silva",
    vehiclePlate: "ABC1D23",
    tone: "success",
    ...overrides,
  };
}

describe("UpcomingAppointmentsCard", () => {
  it("renders the empty state while upcoming appointments are not integrated", () => {
    render(<UpcomingAppointmentsCard />);

    expect(screen.getByText("Próximos agendamentos")).toBeInTheDocument();
    expect(screen.getByText("Nenhum próximo agendamento.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ver todos/i })).not.toBeInTheDocument();
  });

  it("renders only the first five next appointments", () => {
    render(
      <UpcomingAppointmentsCard
        appointments={Array.from({ length: 6 }, (_, index) =>
          makeAppointment({
            id: `appointment-${index + 1}`,
            serviceName: `Serviço ${index + 1}`,
          }),
        )}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByText("Serviço 1")).toBeInTheDocument();
    expect(screen.getByText("Serviço 5")).toBeInTheDocument();
    expect(screen.queryByText("Serviço 6")).not.toBeInTheDocument();
  });
});

describe("NextAppointmentItem", () => {
  it("renders appointment time and summary", () => {
    render(<NextAppointmentItem appointment={makeAppointment()} />);

    const item = screen.getByRole("listitem");

    expect(within(item).getByText("21/05")).toBeInTheDocument();
    expect(within(item).getByText("14:00")).toBeInTheDocument();
    expect(within(item).getByText("Lavagem completa")).toBeInTheDocument();
    expect(within(item).getByText("João da Silva")).toBeInTheDocument();
    expect(within(item).getByText("ABC1D23")).toBeInTheDocument();
  });
});
