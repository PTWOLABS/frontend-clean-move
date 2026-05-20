import type { RefObject } from "react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { CALENDAR_VIEWPORT_BOTTOM_OFFSET } from "../lib/appointments-page.helpers";
import type { AppointmentCalendarView } from "../types/appointment-calendar";

type UseCalendarViewportHeightOptions = {
  viewportRef: RefObject<HTMLDivElement | null>;
  selectedView: AppointmentCalendarView;
  sidebarState: "expanded" | "collapsed";
};

export function useCalendarViewportHeight({
  viewportRef,
  selectedView,
  sidebarState,
}: UseCalendarViewportHeightOptions) {
  const [calendarViewportHeight, setCalendarViewportHeight] = useState<number | null>(null);

  const updateCalendarViewportHeight = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const viewportElement = viewportRef.current;

    if (!viewportElement) {
      return;
    }

    const nextHeight = Math.max(
      window.innerHeight -
        viewportElement.getBoundingClientRect().top -
        CALENDAR_VIEWPORT_BOTTOM_OFFSET,
      0,
    );

    setCalendarViewportHeight((currentHeight) => {
      if (currentHeight !== null && Math.abs(currentHeight - nextHeight) < 2) {
        return currentHeight;
      }

      return nextHeight;
    });
  }, [viewportRef]);

  useLayoutEffect(() => {
    updateCalendarViewportHeight();
  }, [sidebarState, selectedView, updateCalendarViewportHeight]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      updateCalendarViewportHeight();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const timeoutId = window.setTimeout(handleResize, 320);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(timeoutId);
    };
  }, [sidebarState, selectedView, updateCalendarViewportHeight]);

  return {
    calendarViewportHeight,
    isCalendarViewportReady: calendarViewportHeight !== null,
  };
}
