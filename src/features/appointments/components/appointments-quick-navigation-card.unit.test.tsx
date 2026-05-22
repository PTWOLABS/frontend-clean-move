import type FullCalendar from "@fullcalendar/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({
    month,
    onMonthChange,
    selected,
    onSelect,
  }: {
    month: Date;
    onMonthChange: (date: Date) => void;
    selected: Date;
    onSelect: (date: Date | undefined) => void;
  }) => (
    <div>
      <p>Mês visível: {month.toISOString()}</p>
      <p>Data selecionada: {selected.toISOString()}</p>
      <button type="button" onClick={() => onSelect(new Date(2026, 4, 21, 12))}>
        Selecionar 21/05
      </button>
      <button type="button" onClick={() => onSelect(undefined)}>
        Limpar seleção
      </button>
      <button type="button" onClick={() => onMonthChange(new Date(2026, 5, 1))}>
        Ir para junho
      </button>
    </div>
  ),
}));

import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { AppointmentsQuickNavigationCard } from "./appointments-quick-navigation-card";

function makeAppointmentEvent(
  id: string,
  start: Date,
  end = new Date(start.getTime() + 60 * 60 * 1000),
): AppointmentCalendarEvent {
  return {
    id,
    title: `Agendamento ${id}`,
    start,
    end,
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

describe("AppointmentsQuickNavigationCard", () => {
  it("counts unique busy days for the visible month", async () => {
    const user = userEvent.setup();
    const calendarRef = { current: null } as RefObject<FullCalendar | null>;

    render(
      <AppointmentsQuickNavigationCard
        calendarRef={calendarRef}
        selectedDate={new Date(2026, 4, 20, 12)}
        events={[
          makeAppointmentEvent("1", new Date(2026, 4, 20, 9)),
          makeAppointmentEvent("2", new Date(2026, 4, 20, 14)),
          makeAppointmentEvent("3", new Date(2026, 4, 21, 10)),
          makeAppointmentEvent("4", new Date(2026, 5, 2, 10)),
        ]}
        onSelectDate={vi.fn()}
      />,
    );

    expect(screen.getByText(/2 dias ocupados neste mês/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ir para junho/i }));

    expect(screen.getByText(/1 dias ocupados neste mês/i)).toBeInTheDocument();
  });

  it("selects a date and moves the main calendar when a day is chosen", async () => {
    const user = userEvent.setup();
    const gotoDate = vi.fn();
    const onSelectDate = vi.fn();
    const calendarRef = {
      current: {
        getApi: () => ({
          gotoDate,
        }),
      },
    } as unknown as RefObject<FullCalendar | null>;

    render(
      <AppointmentsQuickNavigationCard
        calendarRef={calendarRef}
        selectedDate={new Date(2026, 4, 20, 12)}
        events={[]}
        onSelectDate={onSelectDate}
      />,
    );

    await user.click(screen.getByRole("button", { name: /selecionar 21\/05/i }));

    expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 4, 21, 12));
    expect(gotoDate).toHaveBeenCalledWith(new Date(2026, 4, 21, 12));
  });

  it("ignores empty date selections", async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    const calendarRef = { current: null } as RefObject<FullCalendar | null>;

    render(
      <AppointmentsQuickNavigationCard
        calendarRef={calendarRef}
        selectedDate={new Date(2026, 4, 20, 12)}
        events={[]}
        onSelectDate={onSelectDate}
      />,
    );

    await user.click(screen.getByRole("button", { name: /limpar seleção/i }));

    expect(onSelectDate).not.toHaveBeenCalled();
  });
});
