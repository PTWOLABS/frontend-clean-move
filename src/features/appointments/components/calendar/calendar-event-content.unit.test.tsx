import type { EventContentArg } from "@fullcalendar/core/index.js";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
        customer: "Ana Martins",
        service: "Lavagem completa",
        vehicle: "ABC-1234",
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
      />,
    );

    expect(screen.getByText("Dia inteiro")).toBeInTheDocument();
  });
});
