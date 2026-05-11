import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RegisterSteps } from "./register-steps";

const steps = [{ label: "Conta" }, { label: "Empresa" }, { label: "Endereço" }];

describe("RegisterSteps", () => {
  it("should render all the steps", () => {
    render(<RegisterSteps steps={steps} activatedStep={0} />);

    const list = screen.getByRole("list", { name: /etapas do cadastro/i });
    const items = within(list).getAllByRole("listitem");

    expect(items).toHaveLength(3);
    expect(within(list).getByText("Conta")).toBeInTheDocument();
    expect(within(list).getByText("Empresa")).toBeInTheDocument();
    expect(within(list).getByText("Endereço")).toBeInTheDocument();
  });

  it("should display the step number when not yet completed", () => {
    render(<RegisterSteps steps={steps} activatedStep={0} />);

    const list = screen.getByRole("list", { name: /etapas do cadastro/i });
    expect(within(list).getByText("1")).toBeInTheDocument();
    expect(within(list).getByText("2")).toBeInTheDocument();
    expect(within(list).getByText("3")).toBeInTheDocument();
  });

  it("should display a check icon for completed steps and hide the number", () => {
    const { container } = render(<RegisterSteps steps={steps} activatedStep={2} />);

    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    const checks = container.querySelectorAll("svg.lucide-check");
    expect(checks.length).toBeGreaterThanOrEqual(2);
  });
});
