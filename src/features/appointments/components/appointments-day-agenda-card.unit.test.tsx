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
  it("calls onSelectEvent when the user clicks an agenda item", async () => {
    const user = userEvent.setup();
    const onSelectEvent = vi.fn();

    render(
      <AppointmentsDayAgendaCard
        selectedDate={new Date("2026-05-20T12:00:00.000Z")}
        selectedEventId={null}
        events={[appointmentEvent]}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
        onSelectEvent={onSelectEvent}
      />,
    );

    await user.click(screen.getByRole("button", { name: /lavagem tecnica/i }));

    expect(onSelectEvent).toHaveBeenCalledWith(appointmentEvent);
  });
});
