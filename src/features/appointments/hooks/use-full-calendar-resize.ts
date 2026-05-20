import FullCalendar from "@fullcalendar/react";
import type { RefObject } from "react";
import { useCallback, useEffect } from "react";

import type { AppointmentCalendarView } from "../types/appointment-calendar";

type UseFullCalendarResizeOptions = {
  calendarRef: RefObject<FullCalendar | null>;
  resizeTargetRef: RefObject<HTMLDivElement | null>;
  calendarViewportHeight: number | null;
  selectedView: AppointmentCalendarView;
  sidebarState: "expanded" | "collapsed";
};

export function useFullCalendarResize({
  calendarRef,
  resizeTargetRef,
  calendarViewportHeight,
  selectedView,
  sidebarState,
}: UseFullCalendarResizeOptions) {
  const updateCalendarSize = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        calendarRef.current?.getApi().updateSize();
      });
    });
  }, [calendarRef]);

  useEffect(() => {
    updateCalendarSize();

    if (typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateCalendarSize();
    }, 320);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [sidebarState, selectedView, updateCalendarSize]);

  useEffect(() => {
    if (typeof window === "undefined" || calendarViewportHeight === null) {
      return;
    }

    updateCalendarSize();
  }, [calendarViewportHeight, updateCalendarSize]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeTarget = resizeTargetRef.current;

    if (!resizeTarget) {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateCalendarSize();
    });

    observer.observe(resizeTarget);

    return () => {
      observer.disconnect();
    };
  }, [resizeTargetRef, updateCalendarSize]);
}
