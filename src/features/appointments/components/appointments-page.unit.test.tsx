import type { DatesSetArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import type FullCalendar from "@fullcalendar/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RefObject } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useListAppointmentsMock = vi.hoisted(() => vi.fn());
const useQueryFeedbackErrorMock = vi.hoisted(() => vi.fn());

vi.mock("../hooks/queries/use-list-appointments", () => ({
  useListAppointments: useListAppointmentsMock,
}));

vi.mock("@/shared/hooks/use-query-feedback-error", () => ({
  useQueryFeedbackError: useQueryFeedbackErrorMock,
}));

vi.mock("./appointments-calendar-toolbar", () => ({
  AppointmentsCalendarToolbar: ({
    calendarTitle,
    onSelectDate,
  }: {
    calendarRef: RefObject<FullCalendar | null>;
    calendarTitle: string;
    selectedDate: Date;
    selectedView: string;
    onSelectDate: (date: Date) => void;
  }) => (
    <div>
      <p>Título do calendário: {calendarTitle}</p>
      <button type="button" onClick={() => onSelectDate(new Date("2026-05-22T12:00:00.000Z"))}>
        Selecionar no toolbar
      </button>
    </div>
  ),
}));

vi.mock("./calendar/appointments-calendar", () => ({
  AppointmentsCalendar: ({
    isLoading,
    isError,
    selectedEventId,
    selectedSlotKey,
    onDateClick,
    onDatesSet,
    onEventClick,
    onSlotPress,
    onMonthCellPress,
    onRetry,
  }: {
    selectedEventId: string | null;
    selectedSlotKey: string | null;
    isLoading: boolean;
    isError: boolean;
    onDateClick: (info: DateClickArg) => void;
    onDatesSet: (arg: DatesSetArg) => void;
    onEventClick: (info: EventClickArg) => void;
    onSlotPress: (date: Date) => void;
    onMonthCellPress: (date: Date) => void;
    onRetry: () => void;
  }) => (
    <div>
      <p>Calendário carregando: {isLoading ? "sim" : "não"}</p>
      <p>Calendário com erro: {isError ? "sim" : "não"}</p>
      <p>Evento selecionado no calendário: {selectedEventId ?? "nenhum"}</p>
      <p>Slot selecionado no calendário: {selectedSlotKey ?? "nenhum"}</p>
      <button
        type="button"
        onClick={() =>
          onDateClick({
            date: new Date("2026-05-20T00:00:00.000Z"),
            view: { type: "dayGridMonth" },
          } as DateClickArg)
        }
      >
        Clicar data mensal
      </button>
      <button type="button" onClick={() => onSlotPress(new Date(2026, 4, 20, 8, 30))}>
        Selecionar slot
      </button>
      <button type="button" onClick={() => onMonthCellPress(new Date("2026-05-21T00:00:00.000Z"))}>
        Selecionar célula mensal
      </button>
      <button
        type="button"
        onClick={() =>
          onDatesSet({
            start: new Date("2026-05-01T00:00:00.000Z"),
            end: new Date("2026-06-01T00:00:00.000Z"),
            view: { title: "maio de 2026", type: "dayGridMonth" },
          } as DatesSetArg)
        }
      >
        Atualizar período
      </button>
      <button
        type="button"
        onClick={() =>
          onEventClick({
            jsEvent: { preventDefault: vi.fn() },
            event: {
              id: "appointment-2",
              title: "Polimento",
              start: new Date("2026-05-21T11:00:00.000Z"),
              end: new Date("2026-05-21T12:00:00.000Z"),
              extendedProps: {
                customer: "Bruno Lima",
                service: "Polimento",
                vehicle: "XYZ-9876",
                attendants: ["Lucas Martins"],
                notes: "Sem observações.",
                reminder: "Lembrete padrão",
                tone: "success",
                status: "DONE",
              },
            },
          } as unknown as EventClickArg)
        }
      >
        Clicar evento do calendário
      </button>
      <button type="button" onClick={onRetry}>
        Recarregar calendário
      </button>
    </div>
  ),
}));

vi.mock("./appointments-quick-navigation-card", () => ({
  AppointmentsQuickNavigationCard: ({ onSelectDate }: { onSelectDate: (date: Date) => void }) => (
    <button type="button" onClick={() => onSelectDate(new Date("2026-05-23T12:00:00.000Z"))}>
      Navegação rápida
    </button>
  ),
}));

vi.mock("./appointments-day-agenda-card", () => ({
  AppointmentsDayAgendaCard: ({
    events,
    isLoading,
    isError,
    selectedEventId,
    onSelectEvent,
    onRetry,
  }: {
    events: AppointmentEventMock[];
    isLoading: boolean;
    isError: boolean;
    selectedEventId: string | null;
    onSelectEvent: (event: AppointmentEventMock) => void;
    onRetry: () => void;
  }) => (
    <div>
      <p>Agenda carregando: {isLoading ? "sim" : "não"}</p>
      <p>Agenda com erro: {isError ? "sim" : "não"}</p>
      <p>Evento selecionado na agenda: {selectedEventId ?? "nenhum"}</p>
      <button type="button" onClick={() => onSelectEvent(events[0])}>
        Selecionar item da agenda
      </button>
      <button type="button" onClick={onRetry}>
        Recarregar agenda
      </button>
    </div>
  ),
}));

import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { AppointmentsPage } from "./appointments-page";

type AppointmentEventMock = AppointmentCalendarEvent;

const appointmentEvents: AppointmentCalendarEvent[] = [
  {
    id: "appointment-1",
    title: "Lavagem tecnica",
    start: new Date("2026-05-20T09:00:00.000Z"),
    end: new Date("2026-05-20T10:00:00.000Z"),
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
  },
  {
    id: "appointment-2",
    title: "Polimento",
    start: new Date("2026-05-21T11:00:00.000Z"),
    end: new Date("2026-05-21T12:00:00.000Z"),
    extendedProps: {
      customer: "Bruno Lima",
      service: "Polimento",
      vehicle: "XYZ-9876",
      attendants: ["Lucas Martins"],
      notes: "Sem observações.",
      reminder: "Lembrete padrão",
      tone: "success",
      status: "DONE",
    },
  },
];

describe("AppointmentsPage", () => {
  beforeEach(() => {
    useQueryFeedbackErrorMock.mockReturnValue(null);
    useListAppointmentsMock.mockReturnValue({
      data: appointmentEvents,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      error: null,
    });
  });

  it("passes loading state to children when appointments are pending without data", () => {
    useListAppointmentsMock.mockReturnValue({
      data: [],
      isPending: true,
      isError: false,
      refetch: vi.fn(),
      error: null,
    });

    render(<AppointmentsPage />);

    expect(screen.getByText("Calendário carregando: sim")).toBeInTheDocument();
    expect(screen.getByText("Agenda carregando: sim")).toBeInTheDocument();
  });

  it("passes error state to children when appointments fail without cached data", () => {
    useListAppointmentsMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: true,
      refetch: vi.fn(),
      error: new Error("request failed"),
    });

    render(<AppointmentsPage />);

    expect(screen.getByText("Calendário com erro: sim")).toBeInTheDocument();
    expect(screen.getByText("Agenda com erro: sim")).toBeInTheDocument();
  });

  it("passes visible range filters to the appointments query", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /atualizar período/i }));

    expect(useListAppointmentsMock).toHaveBeenLastCalledWith({
      startsAt: "2026-05-01T00:00:00.000Z",
      endsAt: "2026-06-01T00:00:00.000Z",
    });
    expect(screen.getByText("Título do calendário: maio de 2026")).toBeInTheDocument();
  });

  it("syncs selection when the user selects an agenda item or calendar event", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    expect(screen.getByText("Evento selecionado no calendário: appointment-1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /selecionar item da agenda/i }));

    expect(screen.getByText("Evento selecionado no calendário: appointment-1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clicar evento do calendário/i }));

    expect(screen.getByText("Evento selecionado no calendário: appointment-2")).toBeInTheDocument();
    expect(screen.getByText("Evento selecionado na agenda: appointment-2")).toBeInTheDocument();
  });

  it("tracks manual slot selection and clears it when a month cell is selected", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /selecionar slot/i }));

    expect(
      screen.getByText("Slot selecionado no calendário: 2026-05-20T08:30"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /selecionar célula mensal/i }));

    expect(screen.getByText("Slot selecionado no calendário: nenhum")).toBeInTheDocument();
  });

  it("refetches appointments from child retry actions", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    useListAppointmentsMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: true,
      refetch,
      error: new Error("request failed"),
    });

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /recarregar calendário/i }));
    await user.click(screen.getByRole("button", { name: /recarregar agenda/i }));

    expect(refetch).toHaveBeenCalledTimes(2);
  });
});
