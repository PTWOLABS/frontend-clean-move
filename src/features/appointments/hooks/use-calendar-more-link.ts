import type { MoreLinkArg, MoreLinkMountArg } from "@fullcalendar/core/index.js";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

type MorePopoverPlacement = {
  alignRight: boolean;
  leftOffset: number;
  rightOffset: number;
  alignTop: boolean;
  topOffset: number;
  bottomOffset: number;
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

  const linkRect = linkElement.getBoundingClientRect();
  const harnessRect = viewHarness.getBoundingClientRect();
  const cellRect = calendarCell.getBoundingClientRect();
  const cellCenterX = cellRect.left + cellRect.width / 2;
  const cellCenterY = cellRect.top + cellRect.height / 2;
  const harnessCenterX = harnessRect.left + harnessRect.width / 2;
  const harnessCenterY = harnessRect.top + harnessRect.height / 2;
  const shouldAlignRight = cellCenterX >= harnessCenterX;
  const shouldAlignTop = cellCenterY >= harnessCenterY;

  return {
    alignRight: shouldAlignRight,
    leftOffset: Math.max(0, linkRect.left - harnessRect.left),
    rightOffset: Math.max(0, harnessRect.right - linkRect.right),
    alignTop: shouldAlignTop,
    topOffset: Math.max(0, linkRect.bottom - harnessRect.top + 4),
    bottomOffset: Math.max(0, harnessRect.bottom - linkRect.top + 4),
  };
}

function updateMoreLinkLabelMode(linkElement: HTMLElement) {
  linkElement.dataset.compact = "false";

  const shouldUseCompactLabel = linkElement.scrollWidth > linkElement.clientWidth + 1;

  linkElement.dataset.compact = shouldUseCompactLabel ? "true" : "false";
}

function isEventFromMorePopover(event: Event) {
  return (
    event.target instanceof Element &&
    Boolean(event.target.closest<HTMLElement>(".fc-more-popover"))
  );
}

export function useCalendarMoreLink() {
  const moreLinkObserversRef = useRef(new Map<HTMLElement, ResizeObserver>());
  const activeMoreLinkRef = useRef<HTMLElement | null>(null);
  const activeCalendarRootRef = useRef<HTMLElement | null>(null);
  const [morePopoverPlacement, setMorePopoverPlacement] = useState<MorePopoverPlacement | null>(
    null,
  );

  const clearMorePopoverState = useCallback(() => {
    activeMoreLinkRef.current = null;
    activeCalendarRootRef.current = null;
    setMorePopoverPlacement(null);
  }, []);

  const closeActiveMorePopover = useCallback(() => {
    const linkElement = activeMoreLinkRef.current;
    const viewHarness = linkElement?.closest<HTMLElement>(".fc-view-harness");
    const calendarRoot =
      activeCalendarRootRef.current ?? viewHarness?.closest<HTMLElement>(".fc") ?? viewHarness;
    const popover = calendarRoot?.querySelector<HTMLElement>(".fc-more-popover");
    const closeButton = popover?.querySelector<HTMLElement>(".fc-popover-close");

    if (closeButton) {
      closeButton.click();
    } else {
      popover?.remove();
    }

    clearMorePopoverState();
  }, [clearMorePopoverState]);

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

  const handleMoreLinkWillUnmount = useCallback(
    (arg: MoreLinkMountArg) => {
      moreLinkObserversRef.current.get(arg.el)?.disconnect();
      moreLinkObserversRef.current.delete(arg.el);

      if (activeMoreLinkRef.current === arg.el) {
        clearMorePopoverState();
      }
    },
    [clearMorePopoverState],
  );

  const handleMoreLinkClick = useCallback((arg: MoreLinkArg) => {
    const currentTarget =
      arg.jsEvent.currentTarget instanceof HTMLElement ? arg.jsEvent.currentTarget : null;
    const target = arg.jsEvent.target instanceof HTMLElement ? arg.jsEvent.target : null;
    const linkElement = currentTarget ?? target?.closest<HTMLElement>(".fc-more-link") ?? null;
    const viewHarness = linkElement?.closest<HTMLElement>(".fc-view-harness");

    activeMoreLinkRef.current = linkElement;
    activeCalendarRootRef.current = viewHarness?.closest<HTMLElement>(".fc") ?? viewHarness ?? null;
    setMorePopoverPlacement(resolveMorePopoverPlacement(linkElement));
  }, []);

  const calendarFrameStyle = morePopoverPlacement
    ? ({
        "--fc-more-popover-left-offset": `${morePopoverPlacement.leftOffset}px`,
        "--fc-more-popover-right-offset": `${morePopoverPlacement.rightOffset}px`,
        "--fc-more-popover-top-offset": `${morePopoverPlacement.topOffset}px`,
        "--fc-more-popover-bottom-offset": `${morePopoverPlacement.bottomOffset}px`,
      } as CSSProperties)
    : undefined;

  useEffect(() => {
    const linkElement = activeMoreLinkRef.current;
    const viewHarness = linkElement?.closest<HTMLElement>(".fc-view-harness");

    if (!morePopoverPlacement || !viewHarness || typeof window === "undefined") {
      return;
    }

    const closeOnViewportChange = (event: Event) => {
      if (isEventFromMorePopover(event)) {
        return;
      }

      closeActiveMorePopover();
    };
    const listenerOptions = { capture: true, passive: true };
    const scrollContainers = Array.from(
      viewHarness.querySelectorAll<HTMLElement>(".fc-scroller"),
    ).filter((scrollContainer) => !scrollContainer.closest(".fc-more-popover"));

    scrollContainers.forEach((scrollContainer) => {
      scrollContainer.addEventListener("scroll", closeOnViewportChange, listenerOptions);
    });
    window.addEventListener("scroll", closeOnViewportChange, listenerOptions);
    window.addEventListener("resize", closeActiveMorePopover);
    document.addEventListener("scroll", closeOnViewportChange, listenerOptions);

    return () => {
      scrollContainers.forEach((scrollContainer) => {
        scrollContainer.removeEventListener("scroll", closeOnViewportChange, listenerOptions);
      });
      window.removeEventListener("scroll", closeOnViewportChange, listenerOptions);
      window.removeEventListener("resize", closeActiveMorePopover);
      document.removeEventListener("scroll", closeOnViewportChange, listenerOptions);
    };
  }, [closeActiveMorePopover, morePopoverPlacement]);

  useEffect(() => {
    const linkElement = activeMoreLinkRef.current;
    const viewHarness = linkElement?.closest<HTMLElement>(".fc-view-harness");
    const calendarRoot =
      activeCalendarRootRef.current ?? viewHarness?.closest<HTMLElement>(".fc") ?? viewHarness;

    if (
      !morePopoverPlacement ||
      !calendarRoot ||
      typeof window === "undefined" ||
      typeof MutationObserver === "undefined"
    ) {
      return;
    }

    let animationFrameId: number | null = null;
    let hasObservedPopover = Boolean(calendarRoot.querySelector(".fc-more-popover"));

    const clearStateIfPopoverClosed = () => {
      animationFrameId = null;

      if (!calendarRoot.isConnected) {
        clearMorePopoverState();
        return;
      }

      const hasOpenPopover = Boolean(calendarRoot.querySelector(".fc-more-popover"));

      if (hasOpenPopover) {
        hasObservedPopover = true;
        return;
      }

      if (hasObservedPopover) {
        clearMorePopoverState();
      }
    };

    const schedulePopoverCheck = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(clearStateIfPopoverClosed);
    };

    const observer = new MutationObserver((mutations) => {
      hasObservedPopover ||= mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
          (node) =>
            node instanceof HTMLElement &&
            (node.matches(".fc-more-popover") || Boolean(node.querySelector(".fc-more-popover"))),
        ),
      );

      schedulePopoverCheck();
    });

    observer.observe(calendarRoot, {
      childList: true,
      subtree: true,
    });
    schedulePopoverCheck();

    return () => {
      observer.disconnect();

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [clearMorePopoverState, morePopoverPlacement]);

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
    isMorePopoverPositioned: morePopoverPlacement !== null,
    isMorePopoverAlignedRight: morePopoverPlacement?.alignRight ?? false,
    isMorePopoverAlignedTop: morePopoverPlacement?.alignTop ?? false,
    handleMoreLinkDidMount,
    handleMoreLinkWillUnmount,
    handleMoreLinkClick,
  };
}
