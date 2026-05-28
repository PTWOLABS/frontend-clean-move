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
    startsAt: new Date(2026, 4, 20, 9),
    end: new Date(2026, 4, 20, 10),
    extendedProps: {
      customer: "Ana Martins",
      service: "Lavagem tecnica",
      vehicle: "ABC-1234",
      notes: "Sem observações.",
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
        isDayView={false}
        onSlotPress={vi.fn()}
        onCellAddIndicatorPress={vi.fn()}
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
        isDayView={false}
        onSlotPress={onSlotPress}
        onCellAddIndicatorPress={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /selecionar horário 08:30/i }));

    expect(onSlotPress).toHaveBeenCalledWith(new Date(2026, 4, 20, 8, 30));
  });

  it("opens the appointment sheet when the user clicks the add indicator", async () => {
    const user = userEvent.setup();
    const onCellAddIndicatorPress = vi.fn();

    render(
      <CalendarSlotOverlay
        date={new Date(2026, 4, 20)}
        events={[]}
        selectedSlotKey={null}
        isDayView={false}
        onSlotPress={vi.fn()}
        onCellAddIndicatorPress={onCellAddIndicatorPress}
      />,
    );

    const slotButton = screen.getByRole("button", { name: /selecionar horário 08:30/i });
    const addIndicator = slotButton.querySelector("span");

    expect(addIndicator).not.toBeNull();

    await user.click(addIndicator!);

    expect(onCellAddIndicatorPress).toHaveBeenCalledWith(true);
  });
});
