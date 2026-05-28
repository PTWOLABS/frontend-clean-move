import type { EventClickArg, EventMountArg } from "@fullcalendar/core/index.js";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

const EVENT_POPOVER_VIEWPORT_PADDING = 10;
const EVENT_POPOVER_ANCHOR_GAP = 8;
const EVENT_POPOVER_MIN_SIDE_SPACE = 144;

type EventPopoverPlacement = "bottom" | "left" | "right" | "top";

type ClientRectBounds = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

type UseSelectedCalendarEventPopoverArgs = {
  containerRef: RefObject<HTMLElement | null>;
  selectedEventId: string | null;
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

function getPopoverBounds(containerElement: HTMLElement) {
  return getIntersectingBounds(containerElement.getBoundingClientRect(), getViewportBounds());
}

function getConnectedEventElement(elements: Set<HTMLElement> | undefined) {
  if (!elements) {
    return null;
  }

  return Array.from(elements).find((element) => element.isConnected) ?? null;
}

function getPreferredPlacement({
  anchorRect,
  bounds,
  popoverRect,
}: {
  anchorRect: DOMRect;
  bounds: ClientRectBounds;
  popoverRect: DOMRect;
}): EventPopoverPlacement {
  const availableRight = bounds.right - EVENT_POPOVER_VIEWPORT_PADDING - anchorRect.right;
  const availableLeft = anchorRect.left - bounds.left - EVENT_POPOVER_VIEWPORT_PADDING;

  if (
    availableRight >= popoverRect.width + EVENT_POPOVER_ANCHOR_GAP ||
    availableRight >= availableLeft
  ) {
    return availableRight >= EVENT_POPOVER_MIN_SIDE_SPACE ? "right" : "bottom";
  }

  return availableLeft >= EVENT_POPOVER_MIN_SIDE_SPACE ? "left" : "bottom";
}

function getPopoverPosition({
  anchorElement,
  containerElement,
  placement,
  popoverElement,
}: {
  anchorElement: HTMLElement;
  containerElement: HTMLElement;
  placement: EventPopoverPlacement;
  popoverElement: HTMLElement;
}) {
  const bounds = getPopoverBounds(containerElement);
  const anchorRect = anchorElement.getBoundingClientRect();
  const popoverRect = popoverElement.getBoundingClientRect();
  const originRect = containerElement.getBoundingClientRect();
  const minLeft = bounds.left + EVENT_POPOVER_VIEWPORT_PADDING;
  const maxLeft = bounds.right - EVENT_POPOVER_VIEWPORT_PADDING - popoverRect.width;
  const minTop = bounds.top + EVENT_POPOVER_VIEWPORT_PADDING;
  const maxTop = bounds.bottom - EVENT_POPOVER_VIEWPORT_PADDING - popoverRect.height;
  const availableWidth = Math.max(0, bounds.width - EVENT_POPOVER_VIEWPORT_PADDING * 2);
  const availableHeight = Math.max(0, bounds.height - EVENT_POPOVER_VIEWPORT_PADDING * 2);

  if (placement === "left" || placement === "right") {
    const requestedLeft =
      placement === "right"
        ? anchorRect.right + EVENT_POPOVER_ANCHOR_GAP
        : anchorRect.left - EVENT_POPOVER_ANCHOR_GAP - popoverRect.width;
    const requestedTop = anchorRect.top + anchorRect.height / 2 - popoverRect.height / 2;

    return {
      left: clampValue(requestedLeft, minLeft, maxLeft) - originRect.left,
      top: clampValue(requestedTop, minTop, maxTop) - originRect.top,
      maxHeight: availableHeight,
      maxWidth: availableWidth,
    };
  }

  const requestedLeft = anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;
  const requestedTop =
    placement === "top"
      ? anchorRect.top - EVENT_POPOVER_ANCHOR_GAP - popoverRect.height
      : anchorRect.bottom + EVENT_POPOVER_ANCHOR_GAP;

  return {
    left: clampValue(requestedLeft, minLeft, maxLeft) - originRect.left,
    top: clampValue(requestedTop, minTop, maxTop) - originRect.top,
    maxHeight: availableHeight,
    maxWidth: availableWidth,
  };
}

export function useSelectedCalendarEventPopover({
  containerRef,
  selectedEventId,
}: UseSelectedCalendarEventPopoverArgs) {
  const eventElementsRef = useRef(new Map<string, Set<HTMLElement>>());
  const activeAnchorRef = useRef<{ eventId: string; element: HTMLElement } | null>(null);
  const popoverElementRef = useRef<HTMLDivElement | null>(null);
  const [anchorVersion, setAnchorVersion] = useState(0);
  const [activeAnchorEventId, setActiveAnchorEventId] = useState<string | null>(null);
  const [mountedEventIds, setMountedEventIds] = useState(() => new Set<string>());
  const [popoverPlacement, setPopoverPlacement] = useState<EventPopoverPlacement>("right");
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({
    visibility: "hidden",
  });

  const getSelectedEventElement = useCallback(() => {
    if (!selectedEventId) {
      return null;
    }

    if (
      activeAnchorRef.current?.eventId === selectedEventId &&
      activeAnchorRef.current.element.isConnected
    ) {
      return activeAnchorRef.current.element;
    }

    return getConnectedEventElement(eventElementsRef.current.get(selectedEventId));
  }, [selectedEventId]);

  const positionPopover = useCallback(() => {
    const anchorElement = getSelectedEventElement();
    const popoverElement = popoverElementRef.current;
    const containerElement = containerRef.current;

    if (!selectedEventId || !anchorElement || !popoverElement || !containerElement) {
      setPopoverStyle({ visibility: "hidden" });
      return;
    }

    const bounds = getPopoverBounds(containerElement);
    const anchorRect = anchorElement.getBoundingClientRect();
    const popoverRect = popoverElement.getBoundingClientRect();
    const preferredPlacement = getPreferredPlacement({
      anchorRect,
      bounds,
      popoverRect,
    });
    const nextPlacement =
      preferredPlacement === "bottom" &&
      bounds.bottom - EVENT_POPOVER_VIEWPORT_PADDING - anchorRect.bottom <
        anchorRect.top - bounds.top - EVENT_POPOVER_VIEWPORT_PADDING
        ? "top"
        : preferredPlacement;
    const position = getPopoverPosition({
      anchorElement,
      containerElement,
      placement: nextPlacement,
      popoverElement,
    });

    setPopoverPlacement(nextPlacement);
    setPopoverStyle({
      left: `${position.left}px`,
      maxHeight: `${position.maxHeight}px`,
      maxWidth: `${position.maxWidth}px`,
      top: `${position.top}px`,
      visibility: "visible",
    });
  }, [containerRef, getSelectedEventElement, selectedEventId]);

  const schedulePositionPopover = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(positionPopover);
  }, [positionPopover]);

  const setPopoverElement = useCallback(
    (element: HTMLDivElement | null) => {
      popoverElementRef.current = element;
      schedulePositionPopover();
    },
    [schedulePositionPopover],
  );

  const handleEventDidMount = useCallback((arg: EventMountArg) => {
    const eventId = arg.event.id;
    const eventElements = eventElementsRef.current.get(eventId) ?? new Set<HTMLElement>();

    eventElements.add(arg.el);
    eventElementsRef.current.set(eventId, eventElements);
    setMountedEventIds((currentEventIds) => {
      if (currentEventIds.has(eventId)) {
        return currentEventIds;
      }

      const nextEventIds = new Set(currentEventIds);
      nextEventIds.add(eventId);

      return nextEventIds;
    });
    setAnchorVersion((currentVersion) => currentVersion + 1);
  }, []);

  const handleEventWillUnmount = useCallback((arg: EventMountArg) => {
    const eventId = arg.event.id;
    const eventElements = eventElementsRef.current.get(eventId);

    eventElements?.delete(arg.el);

    if (!eventElements?.size) {
      eventElementsRef.current.delete(eventId);
      setMountedEventIds((currentEventIds) => {
        if (!currentEventIds.has(eventId)) {
          return currentEventIds;
        }

        const nextEventIds = new Set(currentEventIds);
        nextEventIds.delete(eventId);

        return nextEventIds;
      });
    }

    if (activeAnchorRef.current?.element === arg.el) {
      activeAnchorRef.current = null;
      setActiveAnchorEventId(null);
    }

    setAnchorVersion((currentVersion) => currentVersion + 1);
  }, []);

  const handleEventClickAnchor = useCallback((arg: EventClickArg) => {
    activeAnchorRef.current = {
      element: arg.el,
      eventId: arg.event.id,
    };
    setActiveAnchorEventId(arg.event.id);
    setAnchorVersion((currentVersion) => currentVersion + 1);
  }, []);

  useLayoutEffect(() => {
    positionPopover();
  }, [anchorVersion, positionPopover, selectedEventId]);

  useEffect(() => {
    const containerElement = containerRef.current;

    if (!selectedEventId || !containerElement || typeof window === "undefined") {
      return;
    }

    const scrollContainers = Array.from(
      containerElement.querySelectorAll<HTMLElement>(".fc-scroller"),
    );
    const listenerOptions = { capture: true, passive: true };

    scrollContainers.forEach((scrollContainer) => {
      scrollContainer.addEventListener("scroll", schedulePositionPopover, listenerOptions);
    });
    window.addEventListener("resize", schedulePositionPopover);

    return () => {
      scrollContainers.forEach((scrollContainer) => {
        scrollContainer.removeEventListener("scroll", schedulePositionPopover, listenerOptions);
      });
      window.removeEventListener("resize", schedulePositionPopover);
    };
  }, [containerRef, schedulePositionPopover, selectedEventId]);

  return {
    hasSelectedEventAnchor: Boolean(
      selectedEventId &&
      (activeAnchorEventId === selectedEventId || mountedEventIds.has(selectedEventId)),
    ),
    handleEventClickAnchor,
    handleEventDidMount,
    handleEventWillUnmount,
    popoverPlacement,
    popoverStyle,
    setPopoverElement,
  };
}
