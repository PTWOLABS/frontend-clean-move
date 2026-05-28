import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { AppointmentsDayAgendaCard } from "./appointments-day-agenda-card";

const appointmentEvent: AppointmentCalendarEvent = {
  id: "appointment-1",
  title: "Lavagem tecnica +1",
  startsAt: new Date("2026-05-20T09:00:00.000Z"),
  end: new Date("2026-05-20T10:15:00.000Z"),
  extendedProps: {
    customer: "Ana Martins",
    service: "Lavagem tecnica, Higienizacao",
    vehicle: "Veículo não informado",
    notes: "Sem observações operacionais.",
    tone: "info",
    status: "SCHEDULED",
  },
};

describe("AppointmentsDayAgendaCard", () => {
  it("renders a loading state", () => {
    render(
      <AppointmentsDayAgendaCard
        selectedDate={new Date("2026-05-20T12:00:00.000Z")}
        selectedEventId={null}
        events={[]}
        isLoading
        isRefreshing={false}
        isError={false}
        updatingStatusAppointmentId={null}
        onRetry={vi.fn()}
        onSelectEvent={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("status", { name: /carregando agenda do dia/i })).toBeInTheDocument();
    expect(screen.queryByText("Nenhum agendamento neste dia.")).not.toBeInTheDocument();
  });

  it("calls onSelectEvent when the user clicks an agenda item", async () => {
    const user = userEvent.setup();
    const onSelectEvent = vi.fn();

    render(
      <AppointmentsDayAgendaCard
        selectedDate={new Date("2026-05-20T12:00:00.000Z")}
        selectedEventId={null}
        events={[appointmentEvent]}
        isLoading={false}
        isRefreshing={false}
        isError={false}
        updatingStatusAppointmentId={null}
        onRetry={vi.fn()}
        onSelectEvent={onSelectEvent}
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /lavagem tecnica/i }));

    expect(onSelectEvent).toHaveBeenCalledWith(appointmentEvent);
  });

  it("renders the agenda loading state while refreshing", () => {
    render(
      <AppointmentsDayAgendaCard
        selectedDate={new Date("2026-05-20T12:00:00.000Z")}
        selectedEventId={null}
        events={[appointmentEvent]}
        isLoading={false}
        isRefreshing
        isError={false}
        updatingStatusAppointmentId={null}
        onRetry={vi.fn()}
        onSelectEvent={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("status", { name: /carregando agenda do dia/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /lavagem tecnica/i })).not.toBeInTheDocument();
  });
});
