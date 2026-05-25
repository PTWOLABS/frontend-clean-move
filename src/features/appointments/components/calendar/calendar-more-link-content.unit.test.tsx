import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarMoreLinkContent } from "./calendar-more-link-content";

describe("CalendarMoreLinkContent", () => {
  it("renders singular accessible and compact labels", () => {
    render(<CalendarMoreLinkContent count={1} />);

    expect(screen.getAllByText("mais 1 agendamento...")).toHaveLength(2);
    expect(screen.getByText("mais 1...")).toBeInTheDocument();
  });

  it("renders plural accessible and compact labels", () => {
    render(<CalendarMoreLinkContent count={3} />);

    expect(screen.getAllByText("mais 3 agendamentos...")).toHaveLength(2);
    expect(screen.getByText("mais 3...")).toBeInTheDocument();
  });
});
