"use client";

import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, CarFront, Tag, UserRound, Wrench, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { HintTooltip, HintTooltipProvider } from "@/shared/components/hint-tooltip";
import type { AppointmentStatus } from "@/shared/types/appointments";
import { cn } from "@/shared/utils/cn";

import { AppointmentStatusActions } from "../appointment-status-actions";
import styles from "../appointments-page.module.css";
import { getStatusLabel } from "../../lib/appointments-calendar";
import {
  formatAppointmentTimeRange,
  statusBadgeClassName,
} from "../../lib/appointments-page.helpers";
import type { AppointmentCalendarEvent } from "../../types/appointment-calendar";
import { formatCurrency } from "@/shared/utils/lib";

type CalendarEventDetailsPopoverProps = {
  event: AppointmentCalendarEvent;
  placement: "bottom" | "left" | "right" | "top";
  popoverRef: (element: HTMLDivElement | null) => void;
  style: CSSProperties;
  isUpdatingStatus: boolean;
  onClose: () => void;
  onEdit: (event: AppointmentCalendarEvent) => void;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
};

function stopNativePopoverInteraction(event: Event) {
  if (
    event.target instanceof Element &&
    event.target.closest("button[aria-haspopup='menu'], [data-radix-menu-content]")
  ) {
    return;
  }

  event.stopPropagation();
}

function useCalendarEventDetailsPopoverRef(popoverRef: (element: HTMLDivElement | null) => void) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const setElement = useCallback(
    (element: HTMLDivElement | null) => {
      elementRef.current?.removeEventListener("pointerdown", stopNativePopoverInteraction);
      elementRef.current?.removeEventListener("mousedown", stopNativePopoverInteraction);
      elementRef.current = element;
      elementRef.current?.addEventListener("pointerdown", stopNativePopoverInteraction);
      elementRef.current?.addEventListener("mousedown", stopNativePopoverInteraction);
      popoverRef(element);
    },
    [popoverRef],
  );

  useEffect(
    () => () => {
      elementRef.current?.removeEventListener("pointerdown", stopNativePopoverInteraction);
      elementRef.current?.removeEventListener("mousedown", stopNativePopoverInteraction);
      popoverRef(null);
    },
    [popoverRef],
  );

  return setElement;
}

export function CalendarEventDetailsPopover({
  event,
  placement,
  popoverRef,
  style,
  isUpdatingStatus,
  onClose,
  onEdit,
  onStatusChange,
}: CalendarEventDetailsPopoverProps) {
  const setPopoverElement = useCalendarEventDetailsPopoverRef(popoverRef);

  const amount = formatCurrency(
    event.extendedProps.services?.reduce((acc, current) => {
      return (acc += current.priceInCents);
    }, 0) || 0,
  );

  return (
    <div
      ref={setPopoverElement}
      role="dialog"
      aria-label="Detalhes do agendamento"
      data-placement={placement}
      className={styles.eventDetailsPopover}
      style={style}
      onClick={(popoverEvent) => {
        popoverEvent.stopPropagation();
      }}
      onDoubleClick={(popoverEvent) => {
        popoverEvent.stopPropagation();
      }}
      onPointerDown={(popoverEvent) => {
        popoverEvent.stopPropagation();
      }}
    >
      <div className={styles.eventDetailsHeader}>
        <div className="min-w-0">
          <p className={styles.eventDetailsTitle}>{event.title}</p>
          <p className={styles.eventDetailsSubtitle}>{event.extendedProps.service}</p>
        </div>

        <HintTooltipProvider>
          <div className="flex shrink-0 items-center gap-1.5">
            <HintTooltip label="Fechar" side="bottom">
              <button
                type="button"
                className={styles.eventDetailsIconAction}
                aria-label="Fechar detalhes do agendamento"
                onClick={onClose}
              >
                <X className="size-4" aria-hidden />
              </button>
            </HintTooltip>
          </div>
        </HintTooltipProvider>
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
          <AppointmentStatusActions
            appointmentId={event.id}
            currentStatus={event.extendedProps.status}
            isUpdating={isUpdatingStatus}
            onEdit={() => onEdit(event)}
            onStatusChange={onStatusChange}
          />
        </div>

        <div className={styles.eventDetailsInfoList}>
          <div className={styles.eventDetailsInfoRow}>
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className={styles.eventDetailsInfoPrimary}>
                {format(event.startsAt, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className={styles.eventDetailsInfoSecondary}>
                {formatAppointmentTimeRange(event)}
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
              <p className={styles.eventDetailsInfoPrimary}>
                {event.extendedProps.vehicle.displayName}
              </p>
              <p className={styles.eventDetailsInfoSecondary}>Veículo</p>
            </div>
          </div>
          <div className={styles.eventDetailsInfoRow}>
            <Tag className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className={styles.eventDetailsInfoPrimary}>{amount}</p>
              <p className={styles.eventDetailsInfoSecondary}>Valor total</p>
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
