import type { EventContentArg } from "@fullcalendar/core/index.js";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CalendarEventContent } from "./calendar-event-content";

function makeEventContentArg({
  viewType,
  start,
  end,
  timeText,
}: {
  viewType: string;
  start: Date | null;
  end: Date | null;
  timeText: string;
}): EventContentArg {
  return {
    timeText,
    view: {
      type: viewType,
    },
    event: {
      title: "Lavagem tecnica",
      start,
      end,
      extendedProps: {
        customerId: "customer-1",
        customer: "Ana Martins",
        serviceIds: [{ value: "service-1", label: "Lavagem completa" }],
        service: "Lavagem completa",
        vehicleId: "vehicle-1",
        vehicle: {
          plate: "ABC-1234",
          brand: "",
          model: "",
          displayName: "ABC-1234",
        },
        endsAt: end,
        description: "Sem observações.",
        discountValue: "",
        notes: "Sem observações.",
        tone: "info",
        status: "SCHEDULED",
      },
    },
  } as unknown as EventContentArg;
}

describe("CalendarEventContent", () => {
  it("renders compact title and time in month view", () => {
    render(
      <CalendarEventContent
        arg={makeEventContentArg({
          viewType: "dayGridMonth",
          start: new Date("2026-05-20T09:00:00.000Z"),
          end: new Date("2026-05-20T10:00:00.000Z"),
          timeText: "09:00",
        })}
        onSlotPress={vi.fn()}
        onCellAddIndicatorPress={vi.fn()}
      />,
    );

    expect(screen.getByText("Lavagem tecnica")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.queryByText(/Ana Martins/)).not.toBeInTheDocument();
  });

  it("renders customer and vehicle metadata for long time grid events", () => {
    render(
      <CalendarEventContent
        arg={makeEventContentArg({
          viewType: "timeGridWeek",
          start: new Date("2026-05-20T09:00:00.000Z"),
          end: new Date("2026-05-20T10:00:00.000Z"),
          timeText: "09:00 - 10:00",
        })}
        onSlotPress={vi.fn()}
        onCellAddIndicatorPress={vi.fn()}
      />,
    );

    expect(screen.getByText("Lavagem tecnica")).toBeInTheDocument();
    expect(screen.getByText("09:00 - 10:00")).toBeInTheDocument();
    expect(screen.getByText("Ana Martins • ABC-1234")).toBeInTheDocument();
  });

  it("hides metadata for short time grid events", () => {
    render(
      <CalendarEventContent
        arg={makeEventContentArg({
          viewType: "timeGridDay",
          start: new Date("2026-05-20T09:00:00.000Z"),
          end: new Date("2026-05-20T09:30:00.000Z"),
          timeText: "09:00",
        })}
        onSlotPress={vi.fn()}
        onCellAddIndicatorPress={vi.fn()}
      />,
    );

    expect(screen.getByText("Lavagem tecnica")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.queryByText("Ana Martins • ABC-1234")).not.toBeInTheDocument();
  });

  it("falls back to all day text when time text is empty", () => {
    render(
      <CalendarEventContent
        arg={makeEventContentArg({
          viewType: "timeGridDay",
          start: null,
          end: null,
          timeText: "",
        })}
        onSlotPress={vi.fn()}
        onCellAddIndicatorPress={vi.fn()}
      />,
    );

    expect(screen.getByText("Dia inteiro")).toBeInTheDocument();
  });

  it("opens the appointment sheet from the time grid event add indicator", async () => {
    const user = userEvent.setup();
    const onCellAddIndicatorPress = vi.fn();
    const onSlotPress = vi.fn();
    const { container } = render(
      <CalendarEventContent
        arg={makeEventContentArg({
          viewType: "timeGridWeek",
          start: new Date("2026-05-20T09:00:00.000Z"),
          end: new Date("2026-05-20T10:00:00.000Z"),
          timeText: "09:00 - 10:00",
        })}
        onSlotPress={onSlotPress}
        onCellAddIndicatorPress={onCellAddIndicatorPress}
      />,
    );
    const addIndicator = container.querySelector("span[class*='eventAddIndicator']");

    expect(addIndicator).not.toBeNull();

    await user.click(addIndicator!);

    expect(onSlotPress).toHaveBeenCalledWith(new Date("2026-05-20T09:00:00.000Z"));
    expect(onCellAddIndicatorPress).toHaveBeenCalledWith(true);
  });
});
