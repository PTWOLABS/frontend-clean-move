import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { formatSlotKey } from "../../lib/appointments-page.helpers";
import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";
import { CalendarSlotOverlay } from "./calendar-slot-overlay";

function makeAppointmentEvent(): AppointmentCalendarEvent {
  return {
    id: "appointment-1",
    title: "Lavagem tecnica",
    start: new Date(2026, 4, 20, 9),
    end: new Date(2026, 4, 20, 10),
    extendedProps: {
      customer: "Ana Martins",
      service: "Lavagem tecnica",
      vehicle: "ABC-1234",
      attendants: ["Patricia Costa"],
      notes: "Sem observações.",
      reminder: "Lembrete padrão",
      tone: "info",
      status: "SCHEDULED",
    },
  };
}

describe("CalendarSlotOverlay", () => {
  it("renders selectable empty slots and skips occupied slots", () => {
    render(
      <CalendarSlotOverlay
        date={new Date(2026, 4, 20)}
        events={[makeAppointmentEvent()]}
        selectedSlotKey={null}
        onSlotPress={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /selecionar horário 08:30/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /selecionar horário 09:00/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /selecionar horário 09:30/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /selecionar horário 10:00/i })).toBeInTheDocument();
  });

  it("calls onSlotPress with the selected slot date", async () => {
    const user = userEvent.setup();
    const onSlotPress = vi.fn();

    render(
      <CalendarSlotOverlay
        date={new Date(2026, 4, 20)}
        events={[]}
        selectedSlotKey={formatSlotKey(new Date(2026, 4, 20, 8, 30))}
        onSlotPress={onSlotPress}
      />,
    );

    await user.click(screen.getByRole("button", { name: /selecionar horário 08:30/i }));

    expect(onSlotPress).toHaveBeenCalledWith(new Date(2026, 4, 20, 8, 30));
  });
});
