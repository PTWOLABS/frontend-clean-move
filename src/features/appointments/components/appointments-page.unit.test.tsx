import type { DatesSetArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import type FullCalendar from "@fullcalendar/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RefObject } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useListCalendarAppointmentsMock = vi.hoisted(() => vi.fn());
const useQueryFeedbackErrorMock = vi.hoisted(() => vi.fn());
const useUpdateAppointmentStatusMock = vi.hoisted(() => vi.fn());
const updateAppointmentStatusMutateMock = vi.hoisted(() => vi.fn());

type SelectOptionMock = {
  label: string;
  value: string;
};

type SelectMockProps = {
  className?: string;
  onChange: (value: string) => void;
  options: SelectOptionMock[];
  value?: string;
};

type AppointmentStatusMock = "DONE" | "SCHEDULED" | "CANCELLED";

vi.mock("../hooks/queries/use-list-calendar-appointments", () => ({
  useListCalendarAppointments: useListCalendarAppointmentsMock,
}));

vi.mock("../hooks/mutations/use-update-appointment-status-mutation", () => ({
  useUpdateAppointmentStatus: useUpdateAppointmentStatusMock,
}));

vi.mock("@/shared/hooks/use-query-feedback-error", () => ({
  useQueryFeedbackError: useQueryFeedbackErrorMock,
}));

vi.mock("@/components/ui/select/select", () => ({
  Select: ({ className, onChange, options, value }: SelectMockProps) => {
    const ariaLabel = options.some((option) => option.label.startsWith("Status"))
      ? "Status"
      : "Visualização";

    return (
      <select
        aria-label={ariaLabel}
        className={className}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
}));

vi.mock("./appointments-calendar-toolbar", () => ({
  AppointmentsCalendarToolbar: ({
    calendarTitle,
    onSelectDate,
    onSelectView,
  }: {
    calendarRef: RefObject<FullCalendar | null>;
    calendarTitle: string;
    selectedView: string;
    onSelectDate: (date: Date) => void;
    onSelectView: (view: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => void;
  }) => (
    <div>
      <p>Título do calendário: {calendarTitle}</p>
      <button type="button" onClick={() => onSelectDate(new Date("2026-05-22T12:00:00.000Z"))}>
        Selecionar no toolbar
      </button>
      <button type="button" onClick={() => onSelectView("timeGridWeek")}>
        Selecionar semana no toolbar
      </button>
    </div>
  ),
}));

vi.mock("./calendar/appointments-calendar", () => ({
  AppointmentsCalendar: ({
    isLoading,
    isError,
    selectedEventId,
    selectedEventPopoverId,
    selectedSlotKey,
    updatingStatusAppointmentId,
    onClearSelectedEvent,
    onDateClick,
    onDatesSet,
    onEventClick,
    onSlotPress,
    onMonthCellPress,
    onRetry,
    onStatusChange,
  }: {
    selectedEventId: string | null;
    selectedEventPopoverId: string | null;
    selectedSlotKey: string | null;
    updatingStatusAppointmentId: string | null;
    isLoading: boolean;
    isError: boolean;
    onClearSelectedEvent: () => void;
    onDateClick: (info: DateClickArg) => void;
    onDatesSet: (arg: DatesSetArg) => void;
    onEventClick: (info: EventClickArg) => void;
    onSlotPress: (date: Date) => void;
    onMonthCellPress: (date: Date) => void;
    onRetry: () => void;
    onStatusChange: (appointmentId: string, status: AppointmentStatusMock) => void;
  }) => (
    <div>
      <p>Calendário carregando: {isLoading ? "sim" : "não"}</p>
      <p>Calendário com erro: {isError ? "sim" : "não"}</p>
      <p>Evento selecionado no calendário: {selectedEventId ?? "nenhum"}</p>
      <p>Popover selecionado no calendário: {selectedEventPopoverId ?? "nenhum"}</p>
      <p>Slot selecionado no calendário: {selectedSlotKey ?? "nenhum"}</p>
      <p>Status atualizando no calendário: {updatingStatusAppointmentId ?? "nenhum"}</p>
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
            view: {
              currentStart: new Date("2026-05-01T00:00:00.000Z"),
              currentEnd: new Date("2026-06-01T00:00:00.000Z"),
              title: "maio de 2026",
              type: "dayGridMonth",
            },
          } as DatesSetArg)
        }
      >
        Atualizar período
      </button>
      <button
        type="button"
        onClick={() =>
          onDatesSet({
            start: new Date("2026-04-26T00:00:00.000Z"),
            end: new Date("2026-06-07T00:00:00.000Z"),
            view: {
              currentStart: new Date("2026-05-01T00:00:00.000Z"),
              currentEnd: new Date("2026-06-01T00:00:00.000Z"),
              title: "maio de 2026",
              type: "dayGridMonth",
            },
          } as DatesSetArg)
        }
      >
        Atualizar mês com dias externos
      </button>
      <button
        type="button"
        onClick={() =>
          onDatesSet({
            start: new Date("2026-05-08T00:00:00.000Z"),
            end: new Date("2026-05-09T00:00:00.000Z"),
            view: { title: "8 de maio de 2026", type: "listDay" },
          } as DatesSetArg)
        }
      >
        Atualizar dia em lista
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
                notes: "Sem observações.",
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
      <button type="button" onClick={onClearSelectedEvent}>
        Fechar popover do calendário
      </button>
      <button type="button" onClick={() => onStatusChange("appointment-1", "DONE")}>
        Concluir pelo calendário
      </button>
    </div>
  ),
}));

vi.mock("./upcoming-appointments-card", () => ({
  UpcomingAppointmentsCard: ({
    appointments,
    isLoading,
  }: {
    appointments: Array<{ serviceName: string }>;
    isLoading?: boolean;
  }) => (
    <div>
      <p>Próximos carregando: {isLoading ? "sim" : "não"}</p>
      <p>
        Próximos agendamentos:{" "}
        {appointments.map((appointment) => appointment.serviceName).join(", ") || "nenhum"}
      </p>
    </div>
  ),
}));

vi.mock("./appointments-day-agenda-card", () => ({
  AppointmentsDayAgendaCard: ({
    events,
    isLoading,
    isRefreshing,
    isError,
    selectedEventId,
    updatingStatusAppointmentId,
    onSelectEvent,
    onRetry,
    onStatusChange,
  }: {
    events: AppointmentEventMock[];
    isLoading: boolean;
    isRefreshing?: boolean;
    isError: boolean;
    selectedEventId: string | null;
    updatingStatusAppointmentId: string | null;
    onSelectEvent: (event: AppointmentEventMock) => void;
    onRetry: () => void;
    onStatusChange: (appointmentId: string, status: AppointmentStatusMock) => void;
  }) => (
    <div>
      <p>Agenda carregando: {isLoading ? "sim" : "não"}</p>
      <p>Agenda atualizando: {isRefreshing ? "sim" : "não"}</p>
      <p>Agenda com erro: {isError ? "sim" : "não"}</p>
      <p>Evento selecionado na agenda: {selectedEventId ?? "nenhum"}</p>
      <p>Status atualizando na agenda: {updatingStatusAppointmentId ?? "nenhum"}</p>
      <button type="button" onClick={() => onSelectEvent(events[0])}>
        Selecionar item da agenda
      </button>
      <button type="button" onClick={onRetry}>
        Recarregar agenda
      </button>
      <button type="button" onClick={() => onStatusChange("appointment-2", "CANCELLED")}>
        Cancelar pela agenda
      </button>
    </div>
  ),
}));

vi.mock("./form-sheet/appointment-form-sheet", () => ({
  AppointmentFormSheet: ({ open }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="appointment-form-sheet" data-open={String(open)} />
  ),
}));

import type { AppointmentCalendarEvent } from "../types/appointment-calendar";
import { AppointmentsPage } from "./appointments-page";

type AppointmentEventMock = AppointmentCalendarEvent;

const appointmentEvents: AppointmentCalendarEvent[] = [
  {
    id: "appointment-1",
    title: "Lavagem tecnica",
    startsAt: new Date("2026-05-20T09:00:00.000Z"),
    end: new Date("2026-05-20T10:00:00.000Z"),
    extendedProps: {
      customer: "Ana Martins",
      service: "Lavagem tecnica",
      vehicle: "ABC-1234",
      notes: "Sem observações.",
      tone: "info",
      status: "SCHEDULED",
    },
  },
  {
    id: "appointment-2",
    title: "Polimento",
    startsAt: new Date("2026-05-21T11:00:00.000Z"),
    end: new Date("2026-05-21T12:00:00.000Z"),
    extendedProps: {
      customer: "Bruno Lima",
      service: "Polimento",
      vehicle: "XYZ-9876",
      notes: "Sem observações.",
      tone: "success",
      status: "DONE",
    },
  },
];

function makeFutureAppointmentEvent({
  id,
  serviceName,
  daysFromNow,
}: {
  id: string;
  serviceName: string;
  daysFromNow: number;
}): AppointmentCalendarEvent {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + daysFromNow);
  startsAt.setHours(9, 0, 0, 0);

  const end = new Date(startsAt);
  end.setHours(startsAt.getHours() + 1);

  return {
    id,
    title: serviceName,
    startsAt,
    end,
    extendedProps: {
      customer: "Cliente teste",
      service: serviceName,
      vehicle: "ABC-1234",
      notes: "Sem observações.",
      tone: "info",
      status: "SCHEDULED",
    },
  };
}

describe("AppointmentsPage", () => {
  beforeEach(() => {
    updateAppointmentStatusMutateMock.mockClear();
    useQueryFeedbackErrorMock.mockReturnValue(null);
    useUpdateAppointmentStatusMock.mockReturnValue({
      mutate: updateAppointmentStatusMutateMock,
      isPending: false,
      variables: undefined,
    });
    useListCalendarAppointmentsMock.mockReturnValue({
      data: appointmentEvents,
      isPending: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
      error: null,
    });
  });

  it("passes loading state to children when appointments are pending without data", () => {
    useListCalendarAppointmentsMock.mockReturnValue({
      data: [],
      isPending: true,
      isFetching: true,
      isError: false,
      refetch: vi.fn(),
      error: null,
    });

    render(<AppointmentsPage />);

    expect(screen.getByText("Calendário carregando: sim")).toBeInTheDocument();
    expect(screen.getByText("Agenda carregando: sim")).toBeInTheDocument();
  });

  it("shows calendar refresh loading while keeping side cards stable when filters refetch", () => {
    useListCalendarAppointmentsMock.mockReturnValue({
      data: appointmentEvents,
      isPending: false,
      isFetching: true,
      isError: false,
      refetch: vi.fn(),
      error: null,
    });

    render(<AppointmentsPage />);

    expect(screen.getByText("Calendário carregando: sim")).toBeInTheDocument();
    expect(screen.getByText("Agenda carregando: não")).toBeInTheDocument();
    expect(screen.getByText("Agenda atualizando: sim")).toBeInTheDocument();
    expect(screen.getByText("Próximos carregando: não")).toBeInTheDocument();
  });

  it("passes error state to children when appointments fail without cached data", () => {
    useListCalendarAppointmentsMock.mockReturnValue({
      data: [],
      isPending: false,
      isFetching: false,
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

    expect(useListCalendarAppointmentsMock).toHaveBeenLastCalledWith({
      startsAt: "2026-05-01T00:00:00.000Z",
      endsAt: "2026-06-01T00:00:00.000Z",
    });
    expect(screen.getByText("Título do calendário: Maio de 2026")).toBeInTheDocument();
  });

  it("keeps upcoming appointments from the first loaded events when filters change", async () => {
    const user = userEvent.setup();
    let queryEvents = [
      makeFutureAppointmentEvent({
        id: "initial-upcoming",
        serviceName: "Lavagem inicial",
        daysFromNow: 1,
      }),
    ];

    useListCalendarAppointmentsMock.mockImplementation(() => ({
      data: queryEvents,
      isPending: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
      error: null,
    }));

    render(<AppointmentsPage />);

    expect(await screen.findByText("Próximos agendamentos: Lavagem inicial")).toBeInTheDocument();

    queryEvents = [
      makeFutureAppointmentEvent({
        id: "filtered-upcoming",
        serviceName: "Polimento filtrado",
        daysFromNow: 2,
      }),
    ];

    await user.selectOptions(screen.getByLabelText("Status"), "DONE");

    expect(screen.getByText("Próximos agendamentos: Lavagem inicial")).toBeInTheDocument();
    expect(screen.queryByText("Próximos agendamentos: Polimento filtrado")).not.toBeInTheDocument();
  });

  it("keeps list-like day ranges mapped to the day view filter and full date title", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /atualizar dia em lista/i }));

    expect(screen.getByText("Título do calendário: 8 de maio de 2026")).toBeInTheDocument();
    expect(screen.getByLabelText("Visualização")).toHaveValue("timeGridDay");
    expect(screen.getByDisplayValue("Visualização: Dia")).toBeInTheDocument();
  });

  it("uses the current month for the monthly title instead of the visible grid start", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /atualizar mês com dias externos/i }));

    expect(useListCalendarAppointmentsMock).toHaveBeenLastCalledWith({
      startsAt: "2026-04-26T00:00:00.000Z",
      endsAt: "2026-06-07T00:00:00.000Z",
    });
    expect(screen.getByText("Título do calendário: Maio de 2026")).toBeInTheDocument();
    expect(screen.getByLabelText("Visualização")).toHaveValue("dayGridMonth");
  });

  it("syncs selection when the user selects an agenda item or calendar event", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    expect(screen.getByText("Evento selecionado no calendário: appointment-1")).toBeInTheDocument();
    expect(screen.getByText("Popover selecionado no calendário: nenhum")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /selecionar item da agenda/i }));

    expect(screen.getByText("Evento selecionado no calendário: appointment-1")).toBeInTheDocument();
    expect(
      screen.getByText("Popover selecionado no calendário: appointment-1"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clicar evento do calendário/i }));

    expect(screen.getByText("Evento selecionado no calendário: appointment-2")).toBeInTheDocument();
    expect(screen.getByText("Evento selecionado na agenda: appointment-2")).toBeInTheDocument();
    expect(
      screen.getByText("Popover selecionado no calendário: appointment-2"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fechar popover do calendário/i }));

    expect(screen.getByText("Evento selecionado no calendário: nenhum")).toBeInTheDocument();
    expect(screen.getByText("Popover selecionado no calendário: nenhum")).toBeInTheDocument();
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
    useListCalendarAppointmentsMock.mockReturnValue({
      data: [],
      isPending: false,
      isFetching: false,
      isError: true,
      refetch,
      error: new Error("request failed"),
    });

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /recarregar calendário/i }));
    await user.click(screen.getByRole("button", { name: /recarregar agenda/i }));

    expect(refetch).toHaveBeenCalledTimes(2);
  });

  it("updates appointment status from calendar and agenda actions", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /concluir pelo calendário/i }));
    await user.click(screen.getByRole("button", { name: /cancelar pela agenda/i }));

    expect(updateAppointmentStatusMutateMock).toHaveBeenNthCalledWith(1, {
      appointmentId: "appointment-1",
      status: "DONE",
    });
    expect(updateAppointmentStatusMutateMock).toHaveBeenNthCalledWith(2, {
      appointmentId: "appointment-2",
      status: "CANCELLED",
    });
  });
});
