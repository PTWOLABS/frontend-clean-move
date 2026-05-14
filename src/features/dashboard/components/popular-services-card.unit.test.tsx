import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  dashboardPeriodOptionsMock,
  dashboardPopularServicesMock,
} from "@/features/dashboard/mocks/dashboard-sections.mock";

import { PopularServicesCard } from "./popular-services-card";

describe("PopularServicesCard", () => {
  it("renders only the top five services with percentages and total", () => {
    render(
      <PopularServicesCard
        items={dashboardPopularServicesMock}
        periodOptions={dashboardPeriodOptionsMock}
        defaultPeriod="this-month"
      />,
    );

    expect(screen.getByRole("heading", { name: /serviços populares/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Este mês");
    expect(screen.getByText("Lavagem Completa")).toBeInTheDocument();
    expect(screen.getByText("Higienização Interna")).toBeInTheDocument();
    expect(screen.getByText("Polimento")).toBeInTheDocument();
    expect(screen.getByText("Cristalização")).toBeInTheDocument();
    expect(screen.getByText("Enceramento")).toBeInTheDocument();
    expect(screen.queryByText("Vitrificação")).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(/lavagem completa: 128 serviços, 41% do total/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Total de serviços")).toBeInTheDocument();
    expect(screen.getByText("315")).toBeInTheDocument();
  });

  it("renders an empty state and zero total when there are no services", () => {
    render(
      <PopularServicesCard
        items={[]}
        periodOptions={dashboardPeriodOptionsMock}
        defaultPeriod="this-month"
      />,
    );

    expect(screen.getByText("Nenhum serviço realizado no período.")).toBeInTheDocument();
    expect(screen.getByText("Total de serviços")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
