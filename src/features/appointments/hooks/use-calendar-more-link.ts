import type { MoreLinkArg, MoreLinkMountArg } from "@fullcalendar/core/index.js";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

type MorePopoverPlacement = {
  alignRight: boolean;
  rightOffset: number;
};

function resolveMorePopoverPlacement(linkElement: HTMLElement | null): MorePopoverPlacement | null {
  if (!linkElement) {
    return null;
  }

  const viewHarness = linkElement.closest<HTMLElement>(".fc-view-harness");
  const monthCell = linkElement.closest<HTMLElement>(".fc-daygrid-day");
  const timeGridCell = linkElement.closest<HTMLElement>(".fc-timegrid-col");
  const calendarCell = monthCell ?? timeGridCell;
  const cellSelector = monthCell ? ".fc-daygrid-day" : timeGridCell ? ".fc-timegrid-col" : null;

  if (!viewHarness || !calendarCell || !cellSelector) {
    return null;
  }

  let nextMatchingSibling = calendarCell.nextElementSibling;

  while (nextMatchingSibling && !nextMatchingSibling.matches(cellSelector)) {
    nextMatchingSibling = nextMatchingSibling.nextElementSibling;
  }

  if (nextMatchingSibling) {
    return null;
  }

  const linkRect = linkElement.getBoundingClientRect();
  const harnessRect = viewHarness.getBoundingClientRect();

  return {
    alignRight: true,
    rightOffset: Math.max(0, harnessRect.right - linkRect.right),
  };
}

function updateMoreLinkLabelMode(linkElement: HTMLElement) {
  linkElement.dataset.compact = "false";

  const shouldUseCompactLabel = linkElement.scrollWidth > linkElement.clientWidth + 1;

  linkElement.dataset.compact = shouldUseCompactLabel ? "true" : "false";
}

export function useCalendarMoreLink() {
  const moreLinkObserversRef = useRef(new Map<HTMLElement, ResizeObserver>());
  const [morePopoverPlacement, setMorePopoverPlacement] = useState<MorePopoverPlacement | null>(
    null,
  );

  const handleMoreLinkDidMount = useCallback((arg: MoreLinkMountArg) => {
    if (arg.view.type !== "dayGridMonth") {
      return;
    }

    const updateLabelMode = () => {
      if (!arg.el.isConnected) {
        return;
      }

      updateMoreLinkLabelMode(arg.el);
    };

    updateLabelMode();

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(updateLabelMode);
    }

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateLabelMode();
    });

    observer.observe(arg.el);
    moreLinkObserversRef.current.get(arg.el)?.disconnect();
    moreLinkObserversRef.current.set(arg.el, observer);
  }, []);

  const handleMoreLinkWillUnmount = useCallback((arg: MoreLinkMountArg) => {
    moreLinkObserversRef.current.get(arg.el)?.disconnect();
    moreLinkObserversRef.current.delete(arg.el);
  }, []);

  const handleMoreLinkClick = useCallback((arg: MoreLinkArg) => {
    const currentTarget =
      arg.jsEvent.currentTarget instanceof HTMLElement ? arg.jsEvent.currentTarget : null;
    const target = arg.jsEvent.target instanceof HTMLElement ? arg.jsEvent.target : null;
    const linkElement = currentTarget ?? target?.closest<HTMLElement>(".fc-more-link") ?? null;

    setMorePopoverPlacement(resolveMorePopoverPlacement(linkElement));
  }, []);

  const calendarFrameStyle = morePopoverPlacement?.alignRight
    ? ({
        "--fc-more-popover-right-offset": `${morePopoverPlacement.rightOffset}px`,
      } as CSSProperties)
    : undefined;

  useEffect(() => {
    const observers = moreLinkObserversRef.current;

    return () => {
      observers.forEach((observer) => {
        observer.disconnect();
      });
      observers.clear();
    };
  }, []);

  return {
    calendarFrameStyle,
    isMorePopoverAlignedRight: morePopoverPlacement?.alignRight ?? false,
    handleMoreLinkDidMount,
    handleMoreLinkWillUnmount,
    handleMoreLinkClick,
  };
}
