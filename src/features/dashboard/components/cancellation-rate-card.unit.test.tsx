import { render, screen } from "@testing-library/react";
import type * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dashboardCancellationRateMock } from "@/features/dashboard/mocks/dashboard-sections.mock";
import type { CancellationRateData } from "@/features/dashboard/types/dashboard-sections";

type MockChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: unknown;
  children: React.ReactNode;
};

type MockRadialBarChartProps = {
  data: Array<{
    name: string;
    value: number;
  }>;
  children: React.ReactNode;
};

type MockPolarAngleAxisProps = {
  domain: [number, number];
};

type MockRadialBarProps = {
  dataKey: string;
};

const rechartsMocks = vi.hoisted(() => ({
  PolarAngleAxis: vi.fn(),
  RadialBar: vi.fn(),
  RadialBarChart: vi.fn(),
}));

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children, config, ...props }: MockChartContainerProps) => {
    void config;

    return (
      <div data-testid="chart-container" {...props}>
        {children}
      </div>
    );
  },
}));

vi.mock("recharts", () => ({
  PolarAngleAxis: (props: MockPolarAngleAxisProps) => {
    rechartsMocks.PolarAngleAxis(props);

    return <div data-testid="polar-angle-axis" />;
  },
  RadialBar: (props: MockRadialBarProps) => {
    rechartsMocks.RadialBar(props);

    return <div data-testid="radial-bar" />;
  },
  RadialBarChart: ({ children, ...props }: MockRadialBarChartProps) => {
    rechartsMocks.RadialBarChart({ children, ...props });

    return <div data-testid="radial-bar-chart">{children}</div>;
  },
}));

import { CancellationRateCard } from "./cancellation-rate-card";

describe("CancellationRateCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the current rate, target, comparison, and chart label", () => {
    render(<CancellationRateCard data={dashboardCancellationRateMock} />);

    expect(screen.getByRole("heading", { name: /taxa de cancelamento/i })).toBeInTheDocument();
    expect(screen.getAllByText("4,2%")).toHaveLength(2);
    expect(screen.getByText("Cancelamentos")).toBeInTheDocument();
    expect(screen.getByText("Atual")).toBeInTheDocument();
    expect(screen.getByText("5,8%")).toBeInTheDocument();
    expect(screen.getByText("Meta")).toBeInTheDocument();
    expect(screen.getByText("1,6 p.p. abaixo da meta")).toBeInTheDocument();
    expect(screen.getByTestId("chart-container")).toHaveAttribute(
      "aria-label",
      "Taxa de cancelamento atual de 4,2%",
    );
    expect(rechartsMocks.RadialBarChart).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            name: "Atual",
            value:
              (dashboardCancellationRateMock.currentPercent /
                dashboardCancellationRateMock.targetPercent) *
              100,
          },
        ],
      }),
    );
    expect(rechartsMocks.PolarAngleAxis).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: [0, 100],
      }),
    );
    expect(rechartsMocks.RadialBar).toHaveBeenCalledWith(
      expect.objectContaining({
        dataKey: "value",
      }),
    );
  });

  it("clamps the chart value to 100 when the current rate is above target", () => {
    const aboveTargetData: CancellationRateData = {
      currentPercent: 8.4,
      targetPercent: 4.2,
      comparisonPercentPoints: 4.2,
    };

    render(<CancellationRateCard data={aboveTargetData} />);

    expect(rechartsMocks.RadialBarChart).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            name: "Atual",
            value: 100,
          },
        ],
      }),
    );
  });

  it("renders an empty state when cancellation data is missing", () => {
    render(<CancellationRateCard data={null} />);

    expect(screen.getByText("Sem dados de cancelamento para o período.")).toBeInTheDocument();
    expect(screen.queryByTestId("radial-bar-chart")).not.toBeInTheDocument();
  });
});
