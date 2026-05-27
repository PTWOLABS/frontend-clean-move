import type { MoreLinkArg, MoreLinkMountArg } from "@fullcalendar/core/index.js";
import { useCallback, useEffect, useRef, useState } from "react";

const MORE_POPOVER_VIEWPORT_PADDING = 10;
const MORE_POPOVER_LINK_GAP = 4;

type ClientRectBounds = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

function clampValue(value: number, min: number, max: number) {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function getViewportBounds(): ClientRectBounds {
  const width = document.documentElement.clientWidth || window.innerWidth;
  const height = document.documentElement.clientHeight || window.innerHeight;

  return {
    bottom: height,
    height,
    left: 0,
    right: width,
    top: 0,
    width,
  };
}

function getIntersectingBounds(firstRect: DOMRect, secondRect: ClientRectBounds): ClientRectBounds {
  const top = Math.max(firstRect.top, secondRect.top);
  const right = Math.min(firstRect.right, secondRect.right);
  const bottom = Math.min(firstRect.bottom, secondRect.bottom);
  const left = Math.max(firstRect.left, secondRect.left);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);

  return {
    bottom,
    height,
    left,
    right,
    top,
    width,
  };
}

function getPopoverBounds(viewHarness: HTMLElement) {
  return getIntersectingBounds(viewHarness.getBoundingClientRect(), getViewportBounds());
}

function getPopoverAvailableSize(bounds: ClientRectBounds) {
  return {
    height: Math.max(0, bounds.height - MORE_POPOVER_VIEWPORT_PADDING * 2),
    width: Math.max(0, bounds.width - MORE_POPOVER_VIEWPORT_PADDING * 2),
  };
}

function applyPopoverSizeConstraints(popoverElement: HTMLElement, bounds: ClientRectBounds) {
  const availableSize = getPopoverAvailableSize(bounds);

  popoverElement.style.minWidth = `min(14rem, ${availableSize.width}px)`;
  popoverElement.style.maxWidth = `min(18rem, ${availableSize.width}px)`;

  const popoverHeader = popoverElement.querySelector<HTMLElement>(".fc-popover-header");
  const popoverBody = popoverElement.querySelector<HTMLElement>(".fc-popover-body");

  if (popoverBody) {
    const headerHeight = popoverHeader?.getBoundingClientRect().height ?? 0;
    const availableBodyHeight = Math.max(0, availableSize.height - headerHeight);

    popoverBody.style.maxHeight = `min(14rem, ${availableBodyHeight}px)`;
  }
}

function shouldPreferEndAlignment(linkElement: HTMLElement, viewHarness: HTMLElement) {
  const monthCell = linkElement.closest<HTMLElement>(".fc-daygrid-day");
  const timeGridCell = linkElement.closest<HTMLElement>(".fc-timegrid-col");
  const calendarCell = monthCell ?? timeGridCell;

  if (!calendarCell) {
    return false;
  }

  const harnessRect = viewHarness.getBoundingClientRect();
  const cellRect = calendarCell.getBoundingClientRect();
  const cellCenterX = cellRect.left + cellRect.width / 2;
  const harnessCenterX = harnessRect.left + harnessRect.width / 2;

  return cellCenterX >= harnessCenterX;
}

function getHorizontalPopoverPosition({
  bounds,
  linkElement,
  linkRect,
  popoverWidth,
  viewHarness,
}: {
  bounds: ClientRectBounds;
  linkElement: HTMLElement;
  linkRect: DOMRect;
  popoverWidth: number;
  viewHarness: HTMLElement;
}) {
  const minLeft = bounds.left + MORE_POPOVER_VIEWPORT_PADDING;
  const maxLeft = bounds.right - MORE_POPOVER_VIEWPORT_PADDING - popoverWidth;
  const startLeft = linkRect.left;
  const endLeft = linkRect.right - popoverWidth;
  const startFits = startLeft >= minLeft && startLeft <= maxLeft;
  const endFits = endLeft >= minLeft && endLeft <= maxLeft;
  let alignEnd = shouldPreferEndAlignment(linkElement, viewHarness);
  let requestedLeft = alignEnd ? endLeft : startLeft;

  if ((requestedLeft < minLeft || requestedLeft > maxLeft) && alignEnd && startFits) {
    alignEnd = false;
    requestedLeft = startLeft;
  }

  if ((requestedLeft < minLeft || requestedLeft > maxLeft) && !alignEnd && endFits) {
    alignEnd = true;
    requestedLeft = endLeft;
  }

  return {
    alignEnd,
    left: clampValue(requestedLeft, minLeft, maxLeft),
  };
}

function getVerticalPopoverPosition({
  bounds,
  linkRect,
  popoverHeight,
}: {
  bounds: ClientRectBounds;
  linkRect: DOMRect;
  popoverHeight: number;
}) {
  const minTop = bounds.top + MORE_POPOVER_VIEWPORT_PADDING;
  const maxTop = bounds.bottom - MORE_POPOVER_VIEWPORT_PADDING - popoverHeight;
  const belowTop = linkRect.bottom + MORE_POPOVER_LINK_GAP;
  const aboveTop = linkRect.top - MORE_POPOVER_LINK_GAP - popoverHeight;
  const belowFits = belowTop >= minTop && belowTop <= maxTop;
  const aboveFits = aboveTop >= minTop && aboveTop <= maxTop;
  const spaceAbove = linkRect.top - minTop;
  const spaceBelow = maxTop - belowTop;
  let openAbove = !belowFits && aboveFits;

  if (!belowFits && !aboveFits) {
    openAbove = spaceAbove > spaceBelow;
  }

  return {
    openAbove,
    top: clampValue(openAbove ? aboveTop : belowTop, minTop, maxTop),
  };
}

function positionMorePopover(linkElement: HTMLElement | null, popoverElement: HTMLElement | null) {
  const viewHarness = linkElement?.closest<HTMLElement>(".fc-view-harness");

  if (!linkElement || !popoverElement || !viewHarness) {
    return;
  }

  const bounds = getPopoverBounds(viewHarness);

  applyPopoverSizeConstraints(popoverElement, bounds);

  const linkRect = linkElement.getBoundingClientRect();
  const popoverRect = popoverElement.getBoundingClientRect();
  const { alignEnd, left } = getHorizontalPopoverPosition({
    bounds,
    linkElement,
    linkRect,
    popoverWidth: popoverRect.width,
    viewHarness,
  });
  const { openAbove, top } = getVerticalPopoverPosition({
    bounds,
    linkRect,
    popoverHeight: popoverRect.height,
  });
  const offsetParent =
    popoverElement.offsetParent instanceof HTMLElement ? popoverElement.offsetParent : viewHarness;
  const originRect = offsetParent.getBoundingClientRect();

  popoverElement.style.left = `${left - originRect.left}px`;
  popoverElement.style.top = `${top - originRect.top}px`;
  popoverElement.style.right = "";
  popoverElement.style.bottom = "";
  popoverElement.style.transformOrigin = `${alignEnd ? "right" : "left"} ${
    openAbove ? "bottom" : "top"
  }`;
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
  const [isMorePopoverOpen, setIsMorePopoverOpen] = useState(false);

  const clearMorePopoverState = useCallback(() => {
    activeMoreLinkRef.current = null;
    activeCalendarRootRef.current = null;
    setIsMorePopoverOpen(false);
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

    if (!linkElement) {
      clearMorePopoverState();
      return;
    }

    activeMoreLinkRef.current = linkElement;
    activeCalendarRootRef.current = viewHarness?.closest<HTMLElement>(".fc") ?? viewHarness ?? null;
    setIsMorePopoverOpen(true);
  }, [clearMorePopoverState]);

  useEffect(() => {
    const linkElement = activeMoreLinkRef.current;
    const viewHarness = linkElement?.closest<HTMLElement>(".fc-view-harness");

    if (!isMorePopoverOpen || !viewHarness || typeof window === "undefined") {
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
  }, [closeActiveMorePopover, isMorePopoverOpen]);

  useEffect(() => {
    const linkElement = activeMoreLinkRef.current;
    const viewHarness = linkElement?.closest<HTMLElement>(".fc-view-harness");
    const calendarRoot =
      activeCalendarRootRef.current ?? viewHarness?.closest<HTMLElement>(".fc") ?? viewHarness;

    if (
      !isMorePopoverOpen ||
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
        positionMorePopover(
          activeMoreLinkRef.current,
          calendarRoot.querySelector<HTMLElement>(".fc-more-popover"),
        );
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
  }, [clearMorePopoverState, isMorePopoverOpen]);

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
    isMorePopoverOpen,
    handleMoreLinkDidMount,
    handleMoreLinkWillUnmount,
    handleMoreLinkClick,
  };
}
