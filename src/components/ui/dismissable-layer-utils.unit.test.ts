/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SELECT_CONTENT_ATTRIBUTE,
  composeSelectAwareInteractOutside,
  composeSelectAwarePointerDownOutside,
} from "./dismissable-layer-utils";

function makeInteractOutsideEvent(target: Element) {
  const event = new CustomEvent("interactOutside", {
    cancelable: true,
    detail: { originalEvent: new FocusEvent("focusin") },
  });

  Object.defineProperty(event, "target", {
    configurable: true,
    value: target,
  });

  return event;
}

describe("composeSelectAwareInteractOutside", () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it("prevents parent dismiss while select content is open", () => {
    const outsideTarget = document.createElement("button");
    const selectContent = document.createElement("div");
    const handler = vi.fn();
    const event = makeInteractOutsideEvent(outsideTarget);

    selectContent.setAttribute(SELECT_CONTENT_ATTRIBUTE, "");
    selectContent.setAttribute("data-state", "open");
    document.body.append(outsideTarget, selectContent);

    composeSelectAwareInteractOutside(handler)(event);

    expect(handler).toHaveBeenCalledWith(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not prevent parent dismiss when no select content is open", () => {
    const outsideTarget = document.createElement("button");
    const event = makeInteractOutsideEvent(outsideTarget);

    document.body.append(outsideTarget);

    composeSelectAwareInteractOutside()(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("prevents parent dismiss after a select outside interaction", () => {
    const outsideTarget = document.createElement("button");
    const selectOutsideEvent = new CustomEvent("pointerDownOutside", {
      cancelable: true,
      detail: { originalEvent: new MouseEvent("pointerdown") as PointerEvent },
    });
    const parentOutsideEvent = makeInteractOutsideEvent(outsideTarget);

    document.body.append(outsideTarget);

    composeSelectAwarePointerDownOutside()(selectOutsideEvent);
    composeSelectAwareInteractOutside()(parentOutsideEvent);

    expect(parentOutsideEvent.defaultPrevented).toBe(true);
  });
});
