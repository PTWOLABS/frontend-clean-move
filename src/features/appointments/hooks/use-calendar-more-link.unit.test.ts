import type { MoreLinkArg } from "@fullcalendar/core/index.js";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useCalendarMoreLink } from "./use-calendar-more-link";

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

function makeMoreLinkDom({
  cellRect,
  harnessRect = { left: 0, top: 0, width: 700, height: 600 },
  linkRect,
}: {
  cellRect: RectInput;
  harnessRect?: RectInput;
  linkRect: RectInput;
}) {
  const harness = document.createElement("div");
  harness.className = "fc-view-harness";
  setRect(harness, harnessRect);

  const scroller = document.createElement("div");
  scroller.className = "fc-scroller";

  const cell = document.createElement("div");
  cell.className = "fc-daygrid-day";
  setRect(cell, cellRect);

  const link = document.createElement("button");
  link.className = "fc-more-link";
  setRect(link, linkRect);

  cell.appendChild(link);
  scroller.appendChild(cell);
  harness.appendChild(scroller);
  document.body.appendChild(harness);

  return { harness, link, scroller };
}

function appendPopover(harness: HTMLElement, rect: RectInput) {
  const popover = document.createElement("div");
  popover.className = "fc-more-popover";
  setRect(popover, rect);
  harness.appendChild(popover);

  return popover;
}

function clickMoreLink(link: HTMLElement) {
  return {
    jsEvent: {
      currentTarget: link,
      target: link,
    },
  } as unknown as MoreLinkArg;
}

describe("useCalendarMoreLink", () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(document.documentElement, "clientHeight", {
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("positions the popover below links with available space", async () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { harness, link } = makeMoreLinkDom({
      cellRect: { left: 0, top: 40, width: 100, height: 120 },
      linkRect: { left: 24, top: 128, width: 56, height: 20 },
    });
    const popover = appendPopover(harness, { left: 0, top: 0, width: 220, height: 140 });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    await waitFor(() => {
      expect(result.current.isMorePopoverOpen).toBe(true);
      expect(popover.style.left).toBe("24px");
      expect(popover.style.top).toBe("152px");
    });
    expect(popover.style.transformOrigin).toBe("left top");
  });

  it("aligns the popover by the right edge for links on the right side", async () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { harness, link } = makeMoreLinkDom({
      cellRect: { left: 600, top: 40, width: 100, height: 120 },
      linkRect: { left: 622, top: 128, width: 58, height: 20 },
    });
    const popover = appendPopover(harness, { left: 0, top: 0, width: 220, height: 140 });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    await waitFor(() => {
      expect(popover.style.left).toBe("460px");
      expect(popover.style.top).toBe("152px");
    });
    expect(popover.style.transformOrigin).toBe("right top");
  });

  it("keeps the popover inside narrow viewports", async () => {
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: 320,
    });
    const { result } = renderHook(() => useCalendarMoreLink());
    const { harness, link } = makeMoreLinkDom({
      cellRect: { left: 80, top: 40, width: 100, height: 120 },
      linkRect: { left: 104, top: 128, width: 56, height: 20 },
    });
    const popover = appendPopover(harness, { left: 0, top: 0, width: 288, height: 140 });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    await waitFor(() => {
      expect(popover.style.left).toBe("22px");
      expect(popover.style.top).toBe("152px");
    });
  });

  it("keeps the popover inside an inset calendar harness", async () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { harness, link } = makeMoreLinkDom({
      harnessRect: { left: 16, top: 0, width: 260, height: 600 },
      cellRect: { left: 16, top: 40, width: 80, height: 120 },
      linkRect: { left: 18, top: 128, width: 56, height: 20 },
    });
    const popover = appendPopover(harness, { left: 0, top: 0, width: 220, height: 140 });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    await waitFor(() => {
      expect(popover.style.left).toBe("10px");
      expect(popover.style.top).toBe("152px");
    });
  });

  it("aligns the popover above links when there is not enough space below", async () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { harness, link } = makeMoreLinkDom({
      cellRect: { left: 80, top: 470, width: 100, height: 120 },
      linkRect: { left: 104, top: 558, width: 56, height: 20 },
    });
    const popover = appendPopover(harness, { left: 0, top: 0, width: 220, height: 220 });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    await waitFor(() => {
      expect(popover.style.left).toBe("104px");
      expect(popover.style.top).toBe("334px");
    });
    expect(popover.style.transformOrigin).toBe("left bottom");
  });

  it("aligns the popover above links that would overflow the calendar harness", async () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { harness, link } = makeMoreLinkDom({
      harnessRect: { left: 0, top: 100, width: 700, height: 300 },
      cellRect: { left: 80, top: 280, width: 100, height: 120 },
      linkRect: { left: 104, top: 360, width: 56, height: 20 },
    });
    const popover = appendPopover(harness, { left: 0, top: 0, width: 220, height: 160 });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    await waitFor(() => {
      expect(popover.style.left).toBe("104px");
      expect(popover.style.top).toBe("96px");
    });
    expect(popover.style.transformOrigin).toBe("left bottom");
  });

  it("closes the active popover when the calendar scroller moves", async () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { harness, link, scroller } = makeMoreLinkDom({
      cellRect: { left: 80, top: 220, width: 100, height: 120 },
      linkRect: { left: 104, top: 308, width: 56, height: 20 },
    });
    const popover = document.createElement("div");
    popover.className = "fc-more-popover";
    const closeButton = document.createElement("button");
    closeButton.className = "fc-popover-close";
    closeButton.addEventListener("click", () => {
      popover.remove();
    });
    popover.appendChild(closeButton);
    harness.appendChild(popover);

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    await waitFor(() => {
      expect(result.current.isMorePopoverOpen).toBe(true);
    });

    act(() => {
      scroller.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => {
      expect(result.current.isMorePopoverOpen).toBe(false);
    });
    expect(harness.querySelector(".fc-more-popover")).not.toBeInTheDocument();
  });

  it("closes the active popover on demand", async () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { harness, link } = makeMoreLinkDom({
      cellRect: { left: 80, top: 220, width: 100, height: 120 },
      linkRect: { left: 104, top: 308, width: 56, height: 20 },
    });
    const popover = document.createElement("div");
    popover.className = "fc-more-popover";
    const closeButton = document.createElement("button");
    closeButton.className = "fc-popover-close";
    closeButton.addEventListener("click", () => {
      popover.remove();
    });
    popover.appendChild(closeButton);
    harness.appendChild(popover);

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    await waitFor(() => {
      expect(result.current.isMorePopoverOpen).toBe(true);
    });

    act(() => {
      result.current.closeActiveMorePopover();
    });

    expect(result.current.isMorePopoverOpen).toBe(false);
    expect(harness.querySelector(".fc-more-popover")).not.toBeInTheDocument();
  });

  it("clears the active popover state when the more popover closes", async () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { harness, link } = makeMoreLinkDom({
      cellRect: { left: 80, top: 220, width: 100, height: 120 },
      linkRect: { left: 104, top: 308, width: 56, height: 20 },
    });
    const popover = document.createElement("div");
    popover.className = "fc-more-popover";
    harness.appendChild(popover);

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    expect(result.current.isMorePopoverOpen).toBe(true);

    act(() => {
      popover.remove();
    });

    await waitFor(() => {
      expect(result.current.isMorePopoverOpen).toBe(false);
    });
  });
});
