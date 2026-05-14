import { render, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  dashboardRevenueAppointmentsMock,
  dashboardRevenueAppointmentsSummaryMock,
} from "@/features/dashboard/mocks/dashboard-sections.mock";

type MockChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: unknown;
  children: React.ReactNode;
};

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children, config, ...props }: MockChartContainerProps) => {
    void config;

    return (
      <div data-testid="chart-container" {...props}>
        {children}
      </div>
    );
  },
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
}));

vi.mock("recharts", () => ({
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Line: () => <div data-testid="line" />,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
}));

import { RevenueAppointmentsChartCard } from "./revenue-appointments-chart-card";

describe("RevenueAppointmentsChartCard", () => {
  it("renders title, legend, chart label, and period summary", () => {
    render(
      <RevenueAppointmentsChartCard
        data={dashboardRevenueAppointmentsMock}
        summary={dashboardRevenueAppointmentsSummaryMock}
        periodLabel="Diário"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: /receita e agendamentos ao longo do tempo/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Diário")).toBeInTheDocument();
    expect(screen.getByText("Receita (R$)")).toBeInTheDocument();
    expect(screen.getByText("Agendamentos")).toBeInTheDocument();
    expect(screen.getByTestId("chart-container")).toHaveAttribute(
      "aria-label",
      "Gráfico de receita e agendamentos ao longo do tempo",
    );
    expect(screen.getByText("Receita no período")).toBeInTheDocument();
    expect(screen.getByText(/47\.389,00/)).toBeInTheDocument();
    expect(screen.getByText("Agendamentos no período")).toBeInTheDocument();
    expect(screen.getByText("256")).toBeInTheDocument();
    expect(screen.getByText("+21%")).toBeInTheDocument();
    expect(screen.getByText("+18%")).toBeInTheDocument();
  });

  it("renders an empty state when there is no chart data", () => {
    render(
      <RevenueAppointmentsChartCard data={[]} summary={dashboardRevenueAppointmentsSummaryMock} />,
    );

    expect(
      screen.getByText("Sem dados de receita e agendamentos para o período."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });
});
