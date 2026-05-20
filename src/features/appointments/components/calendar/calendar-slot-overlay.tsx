import { addMinutes, format } from "date-fns";
import { Plus } from "lucide-react";

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

type CalendarSlotOverlayProps = {
  date: Date;
  events: AppointmentCalendarEvent[];
  selectedSlotKey: string | null;
  onSlotPress: (date: Date) => void;
};

export function CalendarSlotOverlay({
  date,
  events,
  selectedSlotKey,
  onSlotPress,
}: CalendarSlotOverlayProps) {
  const dayEvents = events.filter((event) => formatDayKey(event.start) === formatDayKey(date));

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
            <span aria-hidden="true" className={styles.emptySlotPlus}>
              <Plus className="size-3.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
