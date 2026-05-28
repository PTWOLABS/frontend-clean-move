"use client";

import type { CSSProperties } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, CarFront, UserRound, Wrench, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

import styles from "../appointments-page.module.css";
import { getStatusLabel } from "../../lib/appointments-calendar";
import {
  formatAppointmentTimeRange,
  statusBadgeClassName,
} from "../../lib/appointments-page.helpers";
import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";

type CalendarEventDetailsPopoverProps = {
  event: AppointmentCalendarEvent;
  placement: "bottom" | "left" | "right" | "top";
  popoverRef: (element: HTMLDivElement | null) => void;
  style: CSSProperties;
  onClose: () => void;
};

export function CalendarEventDetailsPopover({
  event,
  placement,
  popoverRef,
  style,
  onClose,
}: CalendarEventDetailsPopoverProps) {
  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Detalhes do agendamento"
      data-placement={placement}
      className={styles.eventDetailsPopover}
      style={style}
    >
      <div className={styles.eventDetailsHeader}>
        <div className="min-w-0">
          <p className={styles.eventDetailsTitle}>{event.title}</p>
          <p className={styles.eventDetailsSubtitle}>{event.extendedProps.service}</p>
        </div>

        <button
          type="button"
          className={styles.eventDetailsClose}
          aria-label="Fechar detalhes do agendamento"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className={styles.eventDetailsBody}>
        <div className="flex items-center justify-between gap-3">
          <Badge
            variant="outline"
            className={cn(
              "min-w-0 rounded-full px-2.5 py-1 text-[11px]",
              statusBadgeClassName[event.extendedProps.status],
            )}
          >
            {getStatusLabel(event.extendedProps.status)}
          </Badge>
          <span className="shrink-0 text-[0.7rem] font-medium text-muted-foreground">
            {formatAppointmentTimeRange(event)}
          </span>
        </div>

        <div className={styles.eventDetailsInfoList}>
          <div className={styles.eventDetailsInfoRow}>
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className={styles.eventDetailsInfoPrimary}>
                {format(event.startsAt, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className={styles.eventDetailsInfoRow}>
            <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className={styles.eventDetailsInfoPrimary}>{event.extendedProps.customer}</p>
              <p className={styles.eventDetailsInfoSecondary}>Cliente</p>
            </div>
          </div>

          <div className={styles.eventDetailsInfoRow}>
            <CarFront className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className={styles.eventDetailsInfoPrimary}>{event.extendedProps.vehicle}</p>
              <p className={styles.eventDetailsInfoSecondary}>Veículo</p>
            </div>
          </div>

          <div className={styles.eventDetailsInfoRow}>
            <Wrench className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className={styles.eventDetailsInfoPrimary}>{event.extendedProps.notes}</p>
              <p className={styles.eventDetailsInfoSecondary}>Observações</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
