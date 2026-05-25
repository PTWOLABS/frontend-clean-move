import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppointmentInfoCard } from "./appointment-info-card";

describe("AppointmentInfoCard", () => {
  it("renders the title, main content and description", () => {
    render(
      <AppointmentInfoCard
        title="Periodo visivel"
        mainContent="12 agendamentos"
        description="26 de abril - 6 de junho de 2026"
      />,
    );

    expect(screen.getByText("Periodo visivel")).toBeInTheDocument();
    expect(screen.getByText("12 agendamentos")).toBeInTheDocument();
    expect(screen.getByText("26 de abril - 6 de junho de 2026")).toBeInTheDocument();
  });
});
