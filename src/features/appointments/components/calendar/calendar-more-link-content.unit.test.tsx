import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarMoreLinkContent } from "./calendar-more-link-content";

describe("CalendarMoreLinkContent", () => {
  it("renders singular accessible and compact labels", () => {
    render(<CalendarMoreLinkContent count={1} />);

    expect(screen.getByText("mais 1 agendamento...")).toHaveClass("sr-only");
    expect(screen.getByText("+1 ag.")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders plural accessible and compact labels", () => {
    render(<CalendarMoreLinkContent count={3} />);

    expect(screen.getByText("mais 3 agendamentos...")).toHaveClass("sr-only");
    expect(screen.getByText("+3 ag.")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });
});
