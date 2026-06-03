import type { DatesSetArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import type FullCalendar from "@fullcalendar/react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode, RefObject } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ state: "expanded" }),
}));

vi.mock("../../hooks/use-calendar-more-link", () => ({
  useCalendarMoreLink: () => ({
    isMorePopoverOpen: false,
    closeActiveMorePopover: vi.fn(),
    handleMoreLinkDidMount: vi.fn(),
    handleMoreLinkWillUnmount: vi.fn(),
    handleMoreLinkClick: vi.fn(),
  }),
}));

vi.mock("../../hooks/use-full-calendar-resize", () => ({
  useFullCalendarResize: vi.fn(),
}));

vi.mock("../../hooks/use-month-cell-indicators", () => ({
  useMonthCellIndicators: () => ({
    monthCellIndicatorPortals: null,
    handleMonthCellDidMount: vi.fn(),
    handleMonthCellWillUnmount: vi.fn(),
    renderMonthDayCellContent: () => "20",
  }),
}));

vi.mock("../../hooks/use-selected-calendar-event-popover", () => ({
  useSelectedCalendarEventPopover: () => ({
    hasSelectedEventAnchor: true,
    handleEventClickAnchor: vi.fn(),
    handleEventDidMount: vi.fn(),
    handleEventWillUnmount: vi.fn(),
    popoverPlacement: "right",
    popoverStyle: {},
    setEventAnchorElement: vi.fn(),
    setPopoverElement: vi.fn(),
  }),
}));

vi.mock("@fullcalendar/react", () => ({
  default: ({
    events,
    dateClick,
    eventClick,
    datesSet,
    eventContent,
    moreLinkContent,
    moreLinkClick,
    eventClassNames,
    navLinkDayClick,
    height,
  }: {
    events: Array<{
      id: string;
      title: string;
      start: Date;
      end: Date;
      extendedProps: Record<string, unknown>;
    }>;
    dateClick: (arg: DateClickArg) => void;
    eventClick: (arg: EventClickArg) => void;
    datesSet: (arg: DatesSetArg) => void;
    eventContent: (arg: {
      event: {
        id: string;
        title: string;
        start: Date;
        end: Date;
        extendedProps: Record<string, unknown>;
      };
      timeText: string;
      view: { type: string };
    }) => ReactNode;
    moreLinkContent: (arg: { num: number; view: { type: string } }) => ReactNode;
    moreLinkClick: (arg: {
      jsEvent: {
        currentTarget: EventTarget | null;
        target: EventTarget | null;
      };
    }) => void;
    eventClassNames: (arg: {
      event: { id: string; extendedProps: Record<string, unknown> };
    }) => string[];
    navLinkDayClick: (date: Date, jsEvent: UIEvent) => void;
    height: string | number;
  }) => {
    const firstEvent = events[0];

    return (
      <div>
        <p>FullCalendar mock</p>
        <p>Altura do calendário: {height}</p>
        {firstEvent ? (
          <>
            <p data-testid="event-start">{firstEvent.start.toISOString()}</p>
            <div data-testid="event-content">
              {eventContent({
                event: firstEvent,
                timeText: "09:00 - 10:00",
                view: { type: "timeGridWeek" },
              })}
            </div>
            <p data-testid="event-class-names">
              {eventClassNames({
                event: {
                  id: firstEvent.id,
                  extendedProps: firstEvent.extendedProps,
                },
              }).join(" ")}
            </p>
            <button
              type="button"
              onClick={() =>
                eventClick({
                  jsEvent: { preventDefault: vi.fn() },
                  event: firstEvent,
                } as unknown as EventClickArg)
              }
            >
              Disparar evento
            </button>
          </>
        ) : null}
        <div data-testid="more-link">
          {moreLinkContent({ num: 2, view: { type: "dayGridMonth" } })}
        </div>
        <button
          type="button"
          className="fc-more-link"
          onClick={(event) =>
            moreLinkClick({
              jsEvent: {
                currentTarget: event.currentTarget,
                target: event.target,
              },
            })
          }
        >
          Abrir mais agendamentos
        </button>
        <button
          type="button"
          onClick={() =>
            dateClick({
              date: new Date("2026-05-20T08:30:00.000Z"),
              view: { type: "timeGridDay" },
            } as DateClickArg)
          }
        >
          Disparar data
        </button>
        <button
          type="button"
          onClick={() =>
            datesSet({
              start: new Date("2026-05-01T00:00:00.000Z"),
              end: new Date("2026-06-01T00:00:00.000Z"),
              view: { title: "maio de 2026", type: "dayGridMonth" },
            } as DatesSetArg)
          }
        >
          Disparar período
        </button>
        <button
          type="button"
          onClick={() =>
            navLinkDayClick(new Date("2026-05-22T00:00:00.000Z"), new UIEvent("click"))
          }
        >
          Clicar número do dia
        </button>
      </div>
    );
  },
}));

import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";
import { AppointmentsCalendar } from "./appointments-calendar";

const appointmentEvent: AppointmentCalendarEvent = {
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
    vehicle: "ABC-1234",
    endsAt: new Date("2026-05-20T10:00:00.000Z"),
    description: "Sem observações.",
    discountValue: "",
    notes: "Sem observações.",
    tone: "info",
    status: "SCHEDULED",
  },
};

function renderCalendar(props: Partial<React.ComponentProps<typeof AppointmentsCalendar>> = {}) {
  const defaultProps: React.ComponentProps<typeof AppointmentsCalendar> = {
    calendarRef: { current: null } as RefObject<FullCalendar | null>,
    initialSelectedDate: new Date("2026-05-20T12:00:00.000Z"),
    events: [appointmentEvent],
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
    selectedDate: new Date("2026-05-20T12:00:00.000Z"),
    selectedEventId: "appointment-1",
    selectedEventPopoverId: null,
    selectedSlotKey: null,
    selectedView: "dayGridMonth",
    createAppointmentOnMonthCellClick: false,
    updatingStatusAppointmentId: null,
    onClearSelectedEvent: vi.fn(),
    onDateClick: vi.fn(),
    onDayNumberClick: vi.fn(),
    onDatesSet: vi.fn(),
    onEventClick: vi.fn(),
    onEditEvent: vi.fn(),
    onMonthCellPress: vi.fn(),
    onSlotPress: vi.fn(),
    onCellAddIndicatorPress: vi.fn(),
    onListEventSelect: vi.fn(),
    onStatusChange: vi.fn(),
  };

  return render(<AppointmentsCalendar {...defaultProps} {...props} />);
}

describe("AppointmentsCalendar", () => {
  it("renders an error state and calls onRetry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    renderCalendar({ isError: true, onRetry });

    expect(screen.getByText("Não foi possível carregar os agendamentos.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders the weekly list view and selects an event", async () => {
    const user = userEvent.setup();
    const onListEventSelect = vi.fn();

    renderCalendar({
      selectedView: "listWeek",
      onListEventSelect,
    });

    expect(screen.getByRole("list", { name: /agendamentos em lista/i })).toBeInTheDocument();
    expect(screen.getByText("quarta-feira")).toBeInTheDocument();
    expect(screen.getByText("20 de maio de 2026")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /lavagem tecnica/i }));

    expect(onListEventSelect).toHaveBeenCalledWith(appointmentEvent);
  });

  it("renders the selected event details popover in the weekly list view", async () => {
    renderCalendar({
      selectedView: "listWeek",
      selectedEventPopoverId: "appointment-1",
    });

    const dialog = screen.getByRole("dialog", { name: /detalhes do agendamento/i });

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Ana Martins")).toBeInTheDocument();
  });

  it("calls onDayNumberClick when a calendar day number nav link is clicked", async () => {
    const user = userEvent.setup();
    const onDayNumberClick = vi.fn();

    renderCalendar({ onDayNumberClick });

    await user.click(screen.getByRole("button", { name: /clicar número do dia/i }));

    expect(onDayNumberClick).toHaveBeenCalledWith(new Date("2026-05-22T00:00:00.000Z"));
  });

  it("renders the calendar content and loading overlay", () => {
    renderCalendar({ isLoading: true });

    expect(screen.getByText("FullCalendar mock")).toBeInTheDocument();
    expect(screen.getByText("Altura do calendário: 100%")).toBeInTheDocument();
    expect(screen.getByText("Carregando agendamentos...")).toBeInTheDocument();
    expect(screen.getByText("Lavagem tecnica")).toBeInTheDocument();
    expect(screen.getByTestId("event-start")).toHaveTextContent("2026-05-20T09:00:00.000Z");
    expect(screen.getByText("mais 2 agendamentos...")).toHaveClass("sr-only");
    expect(screen.getByText("+2 ag.")).toBeInTheDocument();
    expect(screen.getByTestId("event-class-names").textContent).toContain("eventSelected");
  });

  it("forwards calendar callbacks from FullCalendar", async () => {
    const user = userEvent.setup();
    const onDateClick = vi.fn();
    const onEventClick = vi.fn();
    const onDatesSet = vi.fn();

    renderCalendar({ onDateClick, onEventClick, onDatesSet });

    await user.click(screen.getByRole("button", { name: /disparar data/i }));
    await user.click(screen.getByRole("button", { name: /disparar evento/i }));
    await user.click(screen.getByRole("button", { name: /disparar período/i }));

    expect(onDateClick).toHaveBeenCalledWith(
      expect.objectContaining({ date: new Date("2026-05-20T08:30:00.000Z") }),
    );
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onDatesSet).toHaveBeenCalledWith(
      expect.objectContaining({
        start: new Date("2026-05-01T00:00:00.000Z"),
        end: new Date("2026-06-01T00:00:00.000Z"),
      }),
    );
  });

  it("renders the selected event details popover and closes it", async () => {
    const user = userEvent.setup();
    const onClearSelectedEvent = vi.fn();

    renderCalendar({
      selectedEventPopoverId: "appointment-1",
      onClearSelectedEvent,
    });

    expect(screen.getByRole("dialog", { name: /detalhes do agendamento/i })).toBeInTheDocument();
    expect(screen.getByText("Ana Martins")).toBeInTheDocument();
    expect(screen.getByText("Sem observações.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fechar detalhes do agendamento/i }));

    expect(onClearSelectedEvent).toHaveBeenCalledTimes(1);
  });

  it("prevents interactions inside selected event details from closing parent calendar popovers", () => {
    const documentPointerDown = vi.fn();
    const documentMouseDown = vi.fn();
    const documentClick = vi.fn();

    document.addEventListener("pointerdown", documentPointerDown);
    document.addEventListener("mousedown", documentMouseDown);
    document.addEventListener("click", documentClick);

    try {
      renderCalendar({
        selectedEventPopoverId: "appointment-1",
      });

      const dialog = screen.getByRole("dialog", { name: /detalhes do agendamento/i });

      fireEvent.pointerDown(dialog);
      fireEvent.mouseDown(dialog);
      fireEvent.click(dialog);

      expect(documentPointerDown).not.toHaveBeenCalled();
      expect(documentMouseDown).not.toHaveBeenCalled();
      expect(documentClick).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener("pointerdown", documentPointerDown);
      document.removeEventListener("mousedown", documentMouseDown);
      document.removeEventListener("click", documentClick);
    }
  });

  it("clears selected event details before opening the more appointments popover", async () => {
    const user = userEvent.setup();
    const onClearSelectedEvent = vi.fn();

    renderCalendar({
      selectedEventPopoverId: "appointment-1",
      onClearSelectedEvent,
    });

    expect(screen.getByRole("dialog", { name: /detalhes do agendamento/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /abrir mais agendamentos/i }));

    expect(onClearSelectedEvent).toHaveBeenCalledTimes(1);
  });

  it("forwards the selected event from the details popover edit action", async () => {
    const user = userEvent.setup();
    const onEditEvent = vi.fn();

    renderCalendar({
      selectedEventPopoverId: "appointment-1",
      onEditEvent,
    });

    await user.click(screen.getByRole("button", { name: /ações do agendamento/i }));
    await user.click(screen.getByRole("menuitem", { name: /editar agendamento/i }));

    expect(onEditEvent).toHaveBeenCalledWith(appointmentEvent);
  });
});
