import type { DatesSetArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import type FullCalendar from "@fullcalendar/react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useListCalendarAppointmentsMock = vi.hoisted(() => vi.fn());
const useQueryFeedbackErrorMock = vi.hoisted(() => vi.fn());
const useUpdateAppointmentStatusMock = vi.hoisted(() => vi.fn());
const updateAppointmentStatusMutateMock = vi.hoisted(() => vi.fn());
const navigationMock = vi.hoisted(() => ({
  pathname: "/appointments",
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

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

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMock.pathname,
  useRouter: () => ({
    replace: navigationMock.replace,
  }),
  useSearchParams: () => navigationMock.searchParams,
}));

vi.mock("@/components/ui/select/select", () => ({
  Select: ({ className, onChange, options, value }: SelectMockProps) => {
    return (
      <select
        aria-label="Status"
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
    selectedView,
    onSelectDate,
    onSelectView,
  }: {
    calendarRef: RefObject<FullCalendar | null>;
    calendarTitle: string;
    selectedDate: Date;
    selectedView: string;
    onSelectDate: (date: Date) => void;
    onSelectView: (view: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek") => void;
  }) => (
    <div>
      <p>Título do calendário: {calendarTitle}</p>
      <p>Visualização no toolbar: {selectedView}</p>
      <button type="button" onClick={() => onSelectDate(new Date("2026-05-22T12:00:00.000Z"))}>
        Selecionar no toolbar
      </button>
      <button type="button" onClick={() => onSelectView("timeGridWeek")}>
        Selecionar semana no toolbar
      </button>
      <button type="button" onClick={() => onSelectView("listWeek")}>
        Selecionar lista no toolbar
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
    createAppointmentOnMonthCellClick,
    updatingStatusAppointmentId,
    onClearSelectedEvent,
    onDayNumberClick,
    onEditEvent,
    onDateClick,
    onDatesSet,
    onEventClick,
    onListEventSelect,
    onSlotPress,
    onMonthCellPress,
    onRetry,
    onStatusChange,
  }: {
    selectedEventId: string | null;
    selectedEventPopoverId: string | null;
    selectedSlotKey: string | null;
    createAppointmentOnMonthCellClick: boolean;
    updatingStatusAppointmentId: string | null;
    isLoading: boolean;
    isError: boolean;
    onClearSelectedEvent: () => void;
    onDayNumberClick: (date: Date) => void;
    onEditEvent: (event: AppointmentEventMock) => void;
    onDateClick: (info: DateClickArg) => void;
    onDatesSet: (arg: DatesSetArg) => void;
    onEventClick: (info: EventClickArg) => void;
    onListEventSelect: (event: AppointmentEventMock) => void;
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
      <p>Criação por célula mensal: {createAppointmentOnMonthCellClick ? "sim" : "não"}</p>
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
      <button type="button" onClick={() => onDayNumberClick(new Date("2026-05-22T00:00:00.000Z"))}>
        Clicar número do dia
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
            end: new Date("2026-05-15T00:00:00.000Z"),
            view: { title: "8 - 14 de maio de 2026", type: "listWeek" },
          } as DatesSetArg)
        }
      >
        Atualizar semana em lista
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
                vehicle: {
                  plate: "XYZ-9876",
                  brand: "",
                  model: "",
                  displayName: "XYZ-9876",
                },
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
      <button type="button" onClick={() => onListEventSelect(appointmentEvents[0]!)}>
        Selecionar evento da lista
      </button>
      <button type="button" onClick={onClearSelectedEvent}>
        Fechar popover do calendário
      </button>
      <button type="button" onClick={() => onStatusChange("appointment-1", "DONE")}>
        Concluir pelo calendário
      </button>
      <button
        type="button"
        onClick={() =>
          onEditEvent({
            id: "appointment-2",
            title: "Polimento",
            startsAt: new Date("2026-05-21T11:00:00.000Z"),
            end: new Date("2026-05-21T12:00:00.000Z"),
            extendedProps: {
              customerId: "customer-2",
              customer: "Bruno Lima",
              serviceIds: [{ value: "service-2", label: "Polimento" }],
              service: "Polimento",
              vehicleId: "vehicle-2",
              vehicle: {
                plate: "XYZ-9876",
                brand: "",
                model: "",
                displayName: "XYZ-9876",
              },
              endsAt: new Date("2026-05-21T12:00:00.000Z"),
              description: "Sem observações.",
              discountValue: "",
              notes: "Sem observações.",
              tone: "success",
              status: "DONE",
            },
          })
        }
      >
        Editar pelo calendário
      </button>
    </div>
  ),
}));

vi.mock("./form-sheet/appointment-form-sheet", () => ({
  AppointmentFormSheet: ({
    appointment,
    defaultStartsAt,
    onOpenChange,
    open,
  }: {
    appointment?: AppointmentEventMock | null;
    defaultStartsAt: Date;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid="appointment-form-sheet"
      data-open={String(open)}
      data-appointment-id={appointment?.id ?? ""}
      data-default-starts-at={defaultStartsAt.toISOString()}
    >
      <button type="button" onClick={() => onOpenChange(false)}>
        Fechar formulário
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
    startsAt: new Date("2026-05-20T09:00:00.000Z"),
    end: new Date("2026-05-20T10:00:00.000Z"),
    extendedProps: {
      customerId: "customer-1",
      customer: "Ana Martins",
      serviceIds: [{ value: "service-1", label: "Lavagem tecnica" }],
      service: "Lavagem tecnica",
      vehicleId: "vehicle-1",
      vehicle: {
        plate: "ABC-1234",
        brand: "",
        model: "",
        displayName: "ABC-1234",
      },
      endsAt: new Date("2026-05-20T10:00:00.000Z"),
      description: "Sem observações.",
      discountValue: "",
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
      customerId: "customer-2",
      customer: "Bruno Lima",
      serviceIds: [{ value: "service-2", label: "Polimento" }],
      service: "Polimento",
      vehicleId: "vehicle-2",
      vehicle: {
        plate: "XYZ-9876",
        brand: "",
        model: "",
        displayName: "XYZ-9876",
      },
      endsAt: new Date("2026-05-21T12:00:00.000Z"),
      description: "Sem observações.",
      discountValue: "",
      notes: "Sem observações.",
      tone: "success",
      status: "DONE",
    },
  },
];

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("AppointmentsPage", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    navigationMock.pathname = "/appointments";
    navigationMock.searchParams = new URLSearchParams();
    navigationMock.replace.mockClear();
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
  });

  it("opens appointment creation from the new query param and removes it when closed", async () => {
    const user = userEvent.setup();
    navigationMock.searchParams = new URLSearchParams("new=true&view=calendar");

    render(<AppointmentsPage />);

    expect(screen.getByTestId("appointment-form-sheet")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("appointment-form-sheet")).toHaveAttribute("data-appointment-id", "");

    await user.click(screen.getByRole("button", { name: /fechar formulário/i }));

    expect(navigationMock.replace).toHaveBeenCalledWith("/appointments?view=calendar", {
      scroll: false,
    });
  });

  it("shows calendar refresh loading when filters refetch", () => {
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

  it("applies and clears status filters through the status select", () => {
    render(<AppointmentsPage />);

    expect(screen.queryByRole("button", { name: /limpar filtros/i })).not.toBeInTheDocument();
    expect(useListCalendarAppointmentsMock).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ status: expect.any(Array) }),
    );

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "DONE" } });

    expect(screen.getByLabelText("Status")).toHaveValue("DONE");
    expect(useListCalendarAppointmentsMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: ["DONE"] }),
    );

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "ALL" } });

    expect(screen.getByLabelText("Status")).toHaveValue("ALL");
    expect(useListCalendarAppointmentsMock).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ status: expect.any(Array) }),
    );
  });

  it("keeps query filters unchanged when only an appointment selection changes", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    const initialFilters = useListCalendarAppointmentsMock.mock.lastCall?.[0];

    await user.click(screen.getByRole("button", { name: /selecionar evento da lista/i }));

    expect(screen.getByText("Evento selecionado no calendário: appointment-1")).toBeInTheDocument();
    expect(useListCalendarAppointmentsMock.mock.lastCall?.[0]).toEqual(initialFilters);
  });

  it("keeps list ranges mapped to the list view filter and weekly title", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /atualizar semana em lista/i }));

    expect(screen.getByText("Título do calendário: 8 - 14 de mai de 2026")).toBeInTheDocument();
    expect(screen.getByText("Visualização no toolbar: listWeek")).toBeInTheDocument();
  });

  it("switches to list view when the user clicks a day number in the calendar", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /clicar número do dia/i }));

    expect(screen.getByText("Título do calendário: 17 - 23 de mai de 2026")).toBeInTheDocument();
    expect(screen.getByText("Visualização no toolbar: listWeek")).toBeInTheDocument();
    expect(screen.getByText("Slot selecionado no calendário: nenhum")).toBeInTheDocument();
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
    expect(screen.getByText("Visualização no toolbar: dayGridMonth")).toBeInTheDocument();
  });

  it("syncs selection when the user selects a list item or calendar event", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    expect(screen.getByText("Evento selecionado no calendário: appointment-1")).toBeInTheDocument();
    expect(screen.getByText("Popover selecionado no calendário: nenhum")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /selecionar evento da lista/i }));

    expect(screen.getByText("Evento selecionado no calendário: appointment-1")).toBeInTheDocument();
    expect(
      screen.getByText("Popover selecionado no calendário: appointment-1"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clicar evento do calendário/i }));

    expect(screen.getByText("Evento selecionado no calendário: appointment-2")).toBeInTheDocument();
    expect(
      screen.getByText("Popover selecionado no calendário: appointment-2"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fechar popover do calendário/i }));

    expect(screen.getByText("Evento selecionado no calendário: nenhum")).toBeInTheDocument();
    expect(screen.getByText("Popover selecionado no calendário: nenhum")).toBeInTheDocument();
  });

  it("opens the appointment form in edit mode from calendar actions", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /editar pelo calendário/i }));

    expect(screen.getByTestId("appointment-form-sheet")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("appointment-form-sheet")).toHaveAttribute(
      "data-appointment-id",
      "appointment-2",
    );
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

  it("opens appointment creation from month cell clicks on compact screens", async () => {
    const user = userEvent.setup();

    mockMatchMedia(true);
    render(<AppointmentsPage />);

    expect(screen.getByText("Criação por célula mensal: sim")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clicar data mensal/i }));

    expect(screen.getByTestId("appointment-form-sheet")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("appointment-form-sheet")).toHaveAttribute(
      "data-default-starts-at",
      "2026-05-20T00:00:00.000Z",
    );
  });

  it("refetches appointments from calendar retry action", async () => {
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

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("updates appointment status from calendar action", async () => {
    const user = userEvent.setup();

    render(<AppointmentsPage />);

    await user.click(screen.getByRole("button", { name: /concluir pelo calendário/i }));

    expect(updateAppointmentStatusMutateMock).toHaveBeenCalledWith({
      appointmentId: "appointment-1",
      status: "DONE",
    });
  });
});
