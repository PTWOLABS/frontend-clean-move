import type { EventMountArg } from "@fullcalendar/core/index.js";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { RefObject } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useSelectedCalendarEventPopover } from "./use-selected-calendar-event-popover";

type RectInput = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function setRect(element: HTMLElement, rect: RectInput) {
  element.getBoundingClientRect = () =>
    ({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => null,
    }) as DOMRect;
}

function makePopoverDom({
  anchorRect,
  containerRect,
  popoverRect,
}: {
  anchorRect: RectInput;
  containerRect: RectInput;
  popoverRect: RectInput;
}) {
  const container = document.createElement("div");
  setRect(container, containerRect);

  const scroller = document.createElement("div");
  scroller.className = "fc-scroller";

  const anchor = document.createElement("button");
  setRect(anchor, anchorRect);

  const popover = document.createElement("div");
  setRect(popover, popoverRect);

  scroller.appendChild(anchor);
  container.appendChild(scroller);
  container.appendChild(popover);
  document.body.appendChild(container);

  return {
    anchor,
    container,
    popover: popover as HTMLDivElement,
  };
}

function eventMountArg(eventId: string, element: HTMLElement) {
  return {
    el: element,
    event: {
      id: eventId,
    },
  } as EventMountArg;
}

function renderPopoverHook(container: HTMLElement) {
  const containerRef = { current: container } as RefObject<HTMLElement | null>;

  return renderHook(() =>
    useSelectedCalendarEventPopover({
      containerRef,
      selectedEventId: "appointment-1",
    }),
  );
}

describe("useSelectedCalendarEventPopover", () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        callback(0);

        return 1;
      },
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("positions the popover to the right when there is enough space", async () => {
    const { anchor, container, popover } = makePopoverDom({
      anchorRect: { left: 120, top: 100, width: 80, height: 24 },
      containerRect: { left: 0, top: 0, width: 500, height: 400 },
      popoverRect: { left: 0, top: 0, width: 200, height: 160 },
    });
    const { result } = renderPopoverHook(container);

    act(() => {
      result.current.handleEventDidMount(eventMountArg("appointment-1", anchor));
      result.current.setPopoverElement(popover);
    });

    await waitFor(() => {
      expect(result.current.hasSelectedEventAnchor).toBe(true);
      expect(result.current.popoverPlacement).toBe("right");
      expect(result.current.popoverStyle).toMatchObject({
        left: "208px",
        top: "32px",
        visibility: "visible",
      });
    });
  });

  it("positions the popover to the left when the right side would overflow", async () => {
    const { anchor, container, popover } = makePopoverDom({
      anchorRect: { left: 300, top: 100, width: 40, height: 24 },
      containerRect: { left: 0, top: 0, width: 360, height: 400 },
      popoverRect: { left: 0, top: 0, width: 180, height: 160 },
    });
    const { result } = renderPopoverHook(container);

    act(() => {
      result.current.handleEventDidMount(eventMountArg("appointment-1", anchor));
      result.current.setPopoverElement(popover);
    });

    await waitFor(() => {
      expect(result.current.popoverPlacement).toBe("left");
      expect(result.current.popoverStyle).toMatchObject({
        left: "112px",
        top: "32px",
        visibility: "visible",
      });
    });
  });

  it("positions the popover above the event when the bottom side has less space", async () => {
    const { anchor, container, popover } = makePopoverDom({
      anchorRect: { left: 150, top: 360, width: 20, height: 20 },
      containerRect: { left: 0, top: 0, width: 320, height: 400 },
      popoverRect: { left: 0, top: 0, width: 300, height: 160 },
    });
    const { result } = renderPopoverHook(container);

    act(() => {
      result.current.handleEventDidMount(eventMountArg("appointment-1", anchor));
      result.current.setPopoverElement(popover);
    });

    await waitFor(() => {
      expect(result.current.popoverPlacement).toBe("top");
      expect(result.current.popoverStyle).toMatchObject({
        left: "10px",
        top: "192px",
        visibility: "visible",
      });
    });
  });
});
