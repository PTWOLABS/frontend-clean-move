import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarCellAddIndicator } from "./calendar-cell-add-indicator";

describe("CalendarCellAddIndicator", () => {
  it("renders a decorative add indicator with the provided class", () => {
    const { container } = render(
      <CalendarCellAddIndicator className="indicator-class" onClick={vi.fn()} />,
    );
    const indicator = container.querySelector("span");

    expect(indicator).toHaveClass("indicator-class");
    expect(indicator).toHaveAttribute("aria-hidden", "true");
  });
});
