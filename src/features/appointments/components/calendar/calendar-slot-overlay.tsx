import { addMinutes, format } from "date-fns";

import { cn } from "@/shared/utils/cn";

import styles from "../appointments-page.module.css";
import {
  buildSlotDate,
  doesEventOverlapSlot,
  formatDayKey,
  formatSlotKey,
  SLOT_COUNT,
  SLOT_DURATION_MINUTES,
} from "../../lib/appointments-page.helpers";
import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";
import { CalendarCellAddIndicator } from "./calendar-cell-add-indicator";

type CalendarSlotOverlayProps = {
  date: Date;
  events: AppointmentCalendarEvent[];
  selectedSlotKey: string | null;
  isDayView: boolean;
  onSlotPress: (date: Date) => void;
  onCellAddIndicatorPress: (open: boolean) => void;
};

export function CalendarSlotOverlay({
  date,
  events,
  selectedSlotKey,
  isDayView,
  onSlotPress,
  onCellAddIndicatorPress,
}: CalendarSlotOverlayProps) {
  const dayEvents = events.filter((event) => formatDayKey(event.startsAt) === formatDayKey(date));

  return (
    <div
      className={styles.slotOverlayGrid}
      style={{
        gridTemplateRows: `repeat(${SLOT_COUNT}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: SLOT_COUNT }, (_, slotIndex) => {
        const slotStart = buildSlotDate(date, slotIndex);
        const slotEnd = addMinutes(slotStart, SLOT_DURATION_MINUTES);
        const slotKey = formatSlotKey(slotStart);
        const isOccupied = dayEvents.some((event) =>
          doesEventOverlapSlot(event, slotStart, slotEnd),
        );

        if (isOccupied) {
          return <div key={slotKey} aria-hidden="true" className={styles.slotOverlaySpacer} />;
        }

        const isSelectedSlot = selectedSlotKey === slotKey;

        return (
          <button
            key={slotKey}
            type="button"
            aria-label={`Selecionar horário ${format(slotStart, "HH:mm")} em ${format(date, "dd/MM/yyyy")}`}
            className={cn(styles.emptySlotButton, isSelectedSlot && styles.emptySlotButtonSelected)}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSlotPress(slotStart);
            }}
          >
            <CalendarCellAddIndicator
              className={cn(styles.emptySlotPlus, isDayView && styles.emptySlotPlusCentered)}
              onClick={onCellAddIndicatorPress}
            />
          </button>
        );
      })}
    </div>
  );
}
