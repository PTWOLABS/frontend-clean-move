import type { MoreLinkArg } from "@fullcalendar/core/index.js";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

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

function makeMoreLinkDom({ cellRect, linkRect }: { cellRect: RectInput; linkRect: RectInput }) {
  const harness = document.createElement("div");
  harness.className = "fc-view-harness";
  setRect(harness, { left: 0, top: 0, width: 700, height: 600 });

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

function clickMoreLink(link: HTMLElement) {
  return {
    jsEvent: {
      currentTarget: link,
      target: link,
    },
  } as unknown as MoreLinkArg;
}

describe("useCalendarMoreLink", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("keeps the default right-opening behavior for links on the left side", () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { link } = makeMoreLinkDom({
      cellRect: { left: 0, top: 40, width: 100, height: 120 },
      linkRect: { left: 24, top: 128, width: 56, height: 20 },
    });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    expect(result.current.isMorePopoverAlignedRight).toBe(false);
    expect(result.current.calendarFrameStyle).toMatchObject({
      "--fc-more-popover-left-offset": "24px",
      "--fc-more-popover-top-offset": "152px",
    });
  });

  it("aligns the popover by the right edge for links on the right side", () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { link } = makeMoreLinkDom({
      cellRect: { left: 600, top: 40, width: 100, height: 120 },
      linkRect: { left: 622, top: 128, width: 58, height: 20 },
    });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    expect(result.current.isMorePopoverAlignedRight).toBe(true);
    expect(result.current.calendarFrameStyle).toMatchObject({
      "--fc-more-popover-left-offset": "622px",
      "--fc-more-popover-right-offset": "20px",
    });
  });

  it("keeps the popover opening down for links in the top half", () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { link } = makeMoreLinkDom({
      cellRect: { left: 80, top: 40, width: 100, height: 120 },
      linkRect: { left: 104, top: 128, width: 56, height: 20 },
    });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    expect(result.current.isMorePopoverAlignedTop).toBe(false);
  });

  it("aligns the popover above links in the bottom half", () => {
    const { result } = renderHook(() => useCalendarMoreLink());
    const { link } = makeMoreLinkDom({
      cellRect: { left: 80, top: 470, width: 100, height: 120 },
      linkRect: { left: 104, top: 558, width: 56, height: 20 },
    });

    act(() => {
      result.current.handleMoreLinkClick(clickMoreLink(link));
    });

    expect(result.current.isMorePopoverAlignedTop).toBe(true);
    expect(result.current.calendarFrameStyle).toMatchObject({
      "--fc-more-popover-top-offset": "582px",
      "--fc-more-popover-bottom-offset": "46px",
    });
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
      expect(result.current.isMorePopoverPositioned).toBe(true);
    });

    act(() => {
      scroller.dispatchEvent(new Event("scroll"));
    });

    await waitFor(() => {
      expect(result.current.isMorePopoverPositioned).toBe(false);
    });
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

    expect(result.current.isMorePopoverPositioned).toBe(true);

    act(() => {
      popover.remove();
    });

    await waitFor(() => {
      expect(result.current.isMorePopoverPositioned).toBe(false);
    });
    expect(result.current.calendarFrameStyle).toBeUndefined();
  });
});
