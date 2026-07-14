"use client";

import type {
  DatesSetArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core/index.js";
import type { DayCellContentArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import FullCalendar from "@fullcalendar/react";
import { addDays, format, isSameDay as isSameDayDateFns, startOfDay } from "date-fns";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { cn } from "@/shared/utils/cn";

import styles from "../appointments-page.module.css";
import { useCalendarMoreLink } from "../../hooks/use-calendar-more-link";
import { useFullCalendarResize } from "../../hooks/use-full-calendar-resize";
import { useMonthCellIndicators } from "../../hooks/use-month-cell-indicators";
import { useSelectedCalendarEventPopover } from "../../hooks/use-selected-calendar-event-popover";
import { getCalendarEventClassNames } from "../../lib/appointments-page.helpers";
import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
  AppointmentExtendedProps,
} from "../../types/appointment-calendar";
import { CalendarEventContent } from "./calendar-event-content";
import { CalendarEventDetailsPopover } from "./calendar-event-details-popover";
import {
  appointmentsCalendarBusinessHours,
  appointmentsCalendarEventTimeFormat,
  appointmentsCalendarLocale,
  appointmentsCalendarPlugins,
  appointmentsCalendarSlotDuration,
  appointmentsCalendarSlotLabelFormat,
  appointmentsCalendarSlotMaxTime,
  appointmentsCalendarSlotMinTime,
  appointmentsCalendarViews,
} from "./appointments-calendar.config";
import { CalendarMoreLinkContent } from "./calendar-more-link-content";
import { CalendarSlotOverlay } from "./calendar-slot-overlay";
import { CalendarListView } from "./calendar-list-view";
import { useUpdateAppointment } from "../../hooks/mutations/use-update-appointment-mutation";
import { formatLocalDateTimeAsUtcISOString } from "@/shared/utils/lib";
import { AlertDialog } from "@/components/ui/alert-dialog/alert-dialog";

type AppointmentsCalendarProps = {
  calendarRef: RefObject<FullCalendar | null>;
  initialSelectedDate: Date;
  events: AppointmentCalendarEvent[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedDate: Date;
  selectedEventId: string | null;
  selectedEventPopoverId: string | null;
  selectedSlotKey: string | null;
  selectedView: AppointmentCalendarView;
  createAppointmentOnMonthCellClick: boolean;
  updatingStatusAppointmentId: string | null;
  onDateClick: (info: DateClickArg) => void;
  onDatesSet: (arg: DatesSetArg) => void;
  onEventClick: (info: EventClickArg) => void;
  onDayNumberClick: (date: Date) => void;
  onClearSelectedEvent: () => void;
  onEditEvent: (event: AppointmentCalendarEvent) => void;
  onMonthCellPress: (date: Date) => void;
  onSlotPress: (date: Date) => void;
  onCellAddIndicatorPress: (open: boolean) => void;
  onListEventSelect: (event: AppointmentCalendarEvent) => void;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
};

const MONTHLY_EVENT_ORIGINAL_ID_EXTENDED_PROP = "__monthlyOriginalEventId";

type CalendarEventIdentityExtendedProps = AppointmentExtendedProps & {
  [MONTHLY_EVENT_ORIGINAL_ID_EXTENDED_PROP]?: string;
};

function getCalendarOriginalEventId({
  eventId,
  extendedProps,
}: {
  eventId: string;
  extendedProps: unknown;
}) {
  if (
    typeof extendedProps === "object" &&
    extendedProps !== null &&
    MONTHLY_EVENT_ORIGINAL_ID_EXTENDED_PROP in extendedProps
  ) {
    const originalEventId = (extendedProps as CalendarEventIdentityExtendedProps)[
      MONTHLY_EVENT_ORIGINAL_ID_EXTENDED_PROP
    ];

    if (originalEventId) {
      return originalEventId;
    }
  }

  return eventId;
}

function getCalendarEventWithOriginalId<TEvent extends { id: string; extendedProps: unknown }>(
  event: TEvent,
) {
  const originalEventId = getCalendarOriginalEventId({
    eventId: event.id,
    extendedProps: event.extendedProps,
  });

  if (originalEventId === event.id) {
    return event;
  }

  return new Proxy(event, {
    get(target, property, receiver) {
      if (property === "id") {
        return originalEventId;
      }

      return Reflect.get(target, property, receiver);
    },
  });
}

function buildCalendarEventInput({
  event,
  isEditable,
  start,
  end,
  id = event.id,
}: {
  event: AppointmentCalendarEvent;
  isEditable: boolean;
  start: Date;
  end?: Date;
  id?: string;
}): EventInput {
  return {
    id,
    title: event.title,
    start,
    end,
    allDay: false,
    editable: isEditable,
    startEditable: isEditable,
    durationEditable: isEditable,
    extendedProps:
      id === event.id
        ? event.extendedProps
        : {
            ...event.extendedProps,
            [MONTHLY_EVENT_ORIGINAL_ID_EXTENDED_PROP]: event.id,
          },
  };
}

function getMonthlyCalendarEventInputs(event: AppointmentCalendarEvent): EventInput[] {
  if (isSameDayDateFns(event.startsAt, event.end)) {
    return [
      buildCalendarEventInput({
        event,
        isEditable: true,
        start: event.startsAt,
        end: event.end,
      }),
    ];
  }

  const eventInputs: EventInput[] = [];
  const firstDay = startOfDay(event.startsAt);
  const lastDay = startOfDay(event.end);
  let currentDay = firstDay;

  while (currentDay.getTime() <= lastDay.getTime()) {
    const isFirstDay = isSameDayDateFns(currentDay, event.startsAt);

    eventInputs.push(
      buildCalendarEventInput({
        event,
        isEditable: false,
        start: isFirstDay ? event.startsAt : currentDay,
        id: `${event.id}__month-${format(currentDay, "yyyy-MM-dd")}`,
      }),
    );

    currentDay = addDays(currentDay, 1);
  }

  return eventInputs;
}

export function AppointmentsCalendar({
  calendarRef,
  initialSelectedDate,
  events,
  isLoading,
  isError,
  onRetry,
  selectedDate,
  selectedEventId,
  selectedEventPopoverId,
  selectedSlotKey,
  selectedView,
  createAppointmentOnMonthCellClick,
  updatingStatusAppointmentId,
  onDateClick,
  onDatesSet,
  onEventClick,
  onDayNumberClick,
  onClearSelectedEvent,
  onEditEvent,
  onMonthCellPress,
  onSlotPress,
  onCellAddIndicatorPress,
  onListEventSelect,
  onStatusChange,
}: AppointmentsCalendarProps) {
  const [openConfirmEventDropDialog, setOpenConfirmEventDropDialog] = useState(false);
  const [eventToDropUpdate, setEventToDropUpdate] = useState<EventDropArg | null>(null);

  const { state: sidebarState } = useSidebar();

  const calendarResizeRef = useRef<HTMLDivElement | null>(null);
  const moreLinkMouseDownClearTimestampRef = useRef(0);

  const isMonthGridView = selectedView === "dayGridMonth";
  const initialCalendarDate = selectedView === "listWeek" ? initialSelectedDate : selectedDate;

  const fullCalendarEvents = useMemo<EventInput[]>(
    () =>
      events.flatMap((event) =>
        isMonthGridView
          ? getMonthlyCalendarEventInputs(event)
          : buildCalendarEventInput({
              event,
              isEditable: false,
              start: event.startsAt,
              end: event.end,
            }),
      ),
    [events, isMonthGridView],
  );
  const {
    isMorePopoverOpen,
    closeActiveMorePopover,
    handleMoreLinkDidMount,
    handleMoreLinkWillUnmount,
    handleMoreLinkClick,
  } = useCalendarMoreLink();
  const selectedPopoverEvent =
    (selectedEventPopoverId ? events.find((event) => event.id === selectedEventPopoverId) : null) ??
    null;
  const {
    monthCellIndicatorPortals,
    handleMonthCellDidMount,
    handleMonthCellWillUnmount,
    renderMonthDayCellContent,
  } = useMonthCellIndicators({
    isHidden: isMorePopoverOpen || createAppointmentOnMonthCellClick,
    onMonthCellPress,
    onCellAddIndicatorPress,
  });

  useFullCalendarResize({
    calendarRef,
    resizeTargetRef: calendarResizeRef,
    calendarViewportHeight: null,
    selectedView,
    sidebarState,
  });

  useEffect(() => {
    closeActiveMorePopover();
  }, [closeActiveMorePopover, selectedView]);
  const {
    hasSelectedEventAnchor,
    handleEventClickAnchor,
    handleEventDidMount,
    handleEventWillUnmount,
    popoverPlacement,
    popoverStyle,
    setEventAnchorElement,
    setPopoverElement,
  } = useSelectedCalendarEventPopover({
    containerRef: calendarResizeRef,
    selectedEventId: selectedEventPopoverId,
  });

  function handleCalendarEventClick(info: EventClickArg) {
    const eventElement = info.el instanceof Element ? info.el : null;
    const eventTarget = info.jsEvent.target instanceof Element ? info.jsEvent.target : eventElement;
    const eventWithOriginalId = getCalendarEventWithOriginalId(info.event);
    const eventClickInfo =
      eventWithOriginalId === info.event
        ? info
        : ({
            ...info,
            event: eventWithOriginalId,
          } as EventClickArg);

    if (eventTarget?.closest(".fc-more-popover") || eventElement?.closest(".fc-more-popover")) {
      info.jsEvent.stopPropagation();
    }

    handleEventClickAnchor(eventClickInfo);
    onEventClick(eventClickInfo);
  }

  function handleCalendarNavLinkDayClick(date: Date, jsEvent: UIEvent) {
    jsEvent.preventDefault();
    onDayNumberClick(date);
  }

  function handleCalendarMoreLinkClick(arg: Parameters<typeof handleMoreLinkClick>[0]) {
    const didClearOnMouseDown = Date.now() - moreLinkMouseDownClearTimestampRef.current < 1000;

    if (didClearOnMouseDown) {
      moreLinkMouseDownClearTimestampRef.current = 0;
    } else {
      onClearSelectedEvent();
    }

    handleMoreLinkClick(arg);
  }

  function handleCalendarMouseDownCapture(event: MouseEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element) || !event.target.closest(".fc-more-link")) {
      return;
    }

    moreLinkMouseDownClearTimestampRef.current = Date.now();
    onClearSelectedEvent();
  }

  function renderDayCellContent(arg: DayCellContentArg) {
    if (arg.view.type.startsWith("timeGrid")) {
      return (
        <CalendarSlotOverlay
          date={arg.date}
          events={events}
          selectedSlotKey={selectedSlotKey}
          isDayView={arg.view.type === "timeGridDay"}
          onSlotPress={onSlotPress}
          onCellAddIndicatorPress={onCellAddIndicatorPress}
        />
      );
    }

    return renderMonthDayCellContent(arg);
  }

  function getDayCellClassNames(arg: DayCellContentArg) {
    if (arg.view.type === "dayGridMonth") {
      return [
        styles.monthDayCell,
        !arg.isOther && isSameDayDateFns(arg.date, selectedDate) ? styles.monthDayCellSelected : "",
      ];
    }

    return [];
  }

  const { mutateAsync: updateAppointment, isPending: updatingAppointment } = useUpdateAppointment();

  function handleEventDrop(info: EventDropArg) {
    setEventToDropUpdate(info);
    setOpenConfirmEventDropDialog(true);
  }

  async function handleConfirmEventDrop(info: EventDropArg) {
    const appointmentId = getCalendarOriginalEventId({
      eventId: info.event.id,
      extendedProps: info.event.extendedProps,
    });

    try {
      await updateAppointment({
        appointmentId,
        body: {
          ...(info.event.start
            ? { startsAt: formatLocalDateTimeAsUtcISOString(info.event.start) }
            : {}),
          ...(info.event.end ? { endsAt: formatLocalDateTimeAsUtcISOString(info.event.end) } : {}),
        },
      });
    } catch {
      info.revert();
    } finally {
      setOpenConfirmEventDropDialog(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-background/40",
        styles.calendarViewport,
        !isMonthGridView && "scrollbar-clean",
      )}
    >
      <div
        ref={calendarResizeRef}
        className={cn("relative h-full overflow-hidden", styles.calendarFrame)}
        onMouseDownCapture={handleCalendarMouseDownCapture}
      >
        {monthCellIndicatorPortals}
        {isError ? (
          <div className="flex h-full min-h-112 flex-col items-center justify-center gap-3 px-6 text-center">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Não foi possível carregar os agendamentos.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Atualize os dados para tentar novamente.
              </p>
            </div>
            <Button variant="outline" onClick={onRetry}>
              Tentar novamente
            </Button>
          </div>
        ) : selectedView === "listWeek" ? (
          <CalendarListView
            events={events}
            selectedDate={selectedDate}
            selectedEventId={selectedEventId}
            isLoading={isLoading}
            onEventAnchorChange={setEventAnchorElement}
            onSelectEvent={onListEventSelect}
          />
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={appointmentsCalendarPlugins}
            locale={appointmentsCalendarLocale}
            headerToolbar={false}
            fixedMirrorParent={document.body}
            initialView={selectedView}
            initialDate={initialCalendarDate}
            firstDay={0}
            nowIndicator
            weekends
            navLinks
            navLinkDayClick={handleCalendarNavLinkDayClick}
            editable={isMonthGridView}
            eventStartEditable={isMonthGridView}
            eventDurationEditable={false}
            eventDrop={isMonthGridView ? handleEventDrop : undefined}
            allDaySlot={false}
            selectable={false}
            stickyHeaderDates={false}
            slotDuration={appointmentsCalendarSlotDuration}
            slotLabelInterval="01:00:00"
            slotLabelFormat={appointmentsCalendarSlotLabelFormat}
            slotMinTime={appointmentsCalendarSlotMinTime}
            slotMaxTime={appointmentsCalendarSlotMaxTime}
            height="100%"
            expandRows={!isMonthGridView}
            eventTimeFormat={appointmentsCalendarEventTimeFormat}
            businessHours={appointmentsCalendarBusinessHours}
            views={appointmentsCalendarViews}
            dayCellContent={renderDayCellContent}
            dayCellDidMount={handleMonthCellDidMount}
            dayCellWillUnmount={handleMonthCellWillUnmount}
            dayCellClassNames={getDayCellClassNames}
            moreLinkContent={(arg) =>
              arg.view.type === "dayGridMonth" ? (
                <CalendarMoreLinkContent count={arg.num} />
              ) : (
                `+${arg.num}`
              )
            }
            moreLinkDidMount={handleMoreLinkDidMount}
            moreLinkWillUnmount={handleMoreLinkWillUnmount}
            moreLinkClick={handleCalendarMoreLinkClick}
            events={fullCalendarEvents}
            dateClick={onDateClick}
            eventClick={handleCalendarEventClick}
            eventDidMount={(arg) => {
              const eventWithOriginalId = getCalendarEventWithOriginalId(arg.event);

              handleEventDidMount(
                eventWithOriginalId === arg.event
                  ? arg
                  : ({
                      ...arg,
                      event: eventWithOriginalId,
                    } as typeof arg),
              );
            }}
            eventWillUnmount={(arg) => {
              const eventWithOriginalId = getCalendarEventWithOriginalId(arg.event);

              handleEventWillUnmount(
                eventWithOriginalId === arg.event
                  ? arg
                  : ({
                      ...arg,
                      event: eventWithOriginalId,
                    } as typeof arg),
              );
            }}
            datesSet={onDatesSet}
            eventContent={(arg) => (
              <CalendarEventContent
                arg={arg}
                onSlotPress={onSlotPress}
                onCellAddIndicatorPress={onCellAddIndicatorPress}
              />
            )}
            eventClassNames={(arg) => {
              const extendedProps = arg.event.extendedProps as AppointmentExtendedProps;

              return getCalendarEventClassNames({
                extendedProps,
                eventId: getCalendarOriginalEventId({
                  eventId: arg.event.id,
                  extendedProps,
                }),
                selectedEventId,
              });
            }}
          />
        )}
        {isLoading || updatingAppointment ? (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-20 rounded-xl border border-border/70 bg-card/90 px-3 py-2 text-center text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            Carregando agendamentos...
          </div>
        ) : null}
        {selectedPopoverEvent && hasSelectedEventAnchor ? (
          <CalendarEventDetailsPopover
            event={selectedPopoverEvent}
            placement={popoverPlacement}
            popoverRef={setPopoverElement}
            style={popoverStyle}
            isUpdatingStatus={updatingStatusAppointmentId === selectedPopoverEvent.id}
            onClose={onClearSelectedEvent}
            onEdit={onEditEvent}
            onStatusChange={onStatusChange}
          />
        ) : null}
      </div>
      <AlertDialog
        open={openConfirmEventDropDialog}
        onOpenChange={setOpenConfirmEventDropDialog}
        title="Atualizar agendamento"
        descriptionContent={
          <>
            Tem certeza que deseja alterar a data do agendamento de{" "}
            <span className="font-medium text-foreground">
              {eventToDropUpdate?.event._def.extendedProps.customer}?
            </span>
          </>
        }
        onConfirm={() => {
          const shouldConfirm = !!eventToDropUpdate;

          if (shouldConfirm) {
            handleConfirmEventDrop(eventToDropUpdate);
          }
        }}
        isLoading={updatingAppointment}
        actionMessage={updatingAppointment ? "Atualizando..." : "Confirmar"}
        confirmVariant="default"
        onCancel={() => {
          eventToDropUpdate?.revert();
          setOpenConfirmEventDropDialog(false);
        }}
      />
    </div>
  );
}
