import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
  startAngle?: number;
  endAngle?: number;
  cx?: string;
  cy?: string;
  innerRadius?: string | number;
  outerRadius?: string | number;
  barSize?: number;
};

type MockPolarAngleAxisProps = {
  type?: string;
  domain: [number, number];
  tick?: boolean;
};

type MockRadialBarProps = {
  dataKey: string;
  background?: unknown;
  cornerRadius?: number;
  fill?: string;
  isAnimationActive?: boolean;
};

const rechartsMocks = vi.hoisted(() => ({
  PolarAngleAxis: vi.fn(),
  RadialBar: vi.fn(),
  RadialBarChart: vi.fn(),
}));

const cancellationRateMock: CancellationRateData = {
  currentPercent: 4.2,
  targetPercent: 5.8,
  comparisonPercentPoints: -1.6,
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

vi.mock("../hooks/use-fetch-metrics-appointments", () => ({
  useFetchMetricsAppointment: vi.fn(),
}));

vi.mock("../hooks/use-dashboard-query-error-feedback", () => ({
  useDashboardQueryErrorFeedback: vi.fn(),
}));

import { useDashboardQueryErrorFeedback } from "../hooks/use-dashboard-query-error-feedback";
import { useFetchMetricsAppointment } from "../hooks/use-fetch-metrics-appointments";
import { CancellationRateCard } from "./cancellation-rate-card";

function mockMetricsAppointmentQuery(
  overrides: Partial<ReturnType<typeof useFetchMetricsAppointment>> = {},
) {
  const refetch = vi.fn();

  vi.mocked(useFetchMetricsAppointment).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    refetch,
    ...overrides,
  } as ReturnType<typeof useFetchMetricsAppointment>);

  return refetch;
}

function mockErrorFeedback(feedback: ReturnType<typeof useDashboardQueryErrorFeedback> = null) {
  vi.mocked(useDashboardQueryErrorFeedback).mockReturnValue(feedback);
}

describe("CancellationRateCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMetricsAppointmentQuery();
    mockErrorFeedback();
  });

  it("renders the current rate, target, legend, and chart label", () => {
    render(<CancellationRateCard data={cancellationRateMock} />);

    expect(screen.getByRole("heading", { name: /taxa de cancelamento/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mais informações sobre taxa de cancelamento/i }),
    ).toBeInTheDocument();

    expect(screen.getAllByText("4,2%")).toHaveLength(2);
    expect(screen.getByText("Cancelamentos")).toBeInTheDocument();
    expect(screen.getByText("Atual")).toBeInTheDocument();
    expect(screen.getByText("5,8%")).toBeInTheDocument();
    expect(screen.getByText("Meta")).toBeInTheDocument();

    expect(screen.getByTestId("chart-container")).toHaveAttribute(
      "aria-label",
      "Taxa de cancelamento atual de 4,2%",
    );

    expect(rechartsMocks.RadialBarChart).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          {
            name: "Atual",
            value: (cancellationRateMock.currentPercent / cancellationRateMock.targetPercent) * 100,
          },
        ],
        startAngle: 190,
        endAngle: -10,
        cx: "50%",
        cy: "50%",
        innerRadius: "80%",
        outerRadius: "100%",
        barSize: 16,
      }),
    );

    expect(rechartsMocks.PolarAngleAxis).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "number",
        domain: [0, 100],
        tick: false,
      }),
    );

    expect(rechartsMocks.RadialBar).toHaveBeenCalledWith(
      expect.objectContaining({
        dataKey: "value",
        cornerRadius: 999,
        fill: "url(#cancellationGradient)",
        isAnimationActive: false,
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

  it("renders a loading skeleton while the first request is pending", () => {
    mockMetricsAppointmentQuery({
      isLoading: true,
    });

    render(<CancellationRateCard />);

    expect(screen.getByRole("heading", { name: /taxa de cancelamento/i })).toBeInTheDocument();
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("radial-bar-chart")).not.toBeInTheDocument();
  });

  it("renders an inline error state and retries when the first request fails", async () => {
    const user = userEvent.setup();
    const refetch = mockMetricsAppointmentQuery({
      error: new Error("boom"),
    });

    mockErrorFeedback({
      title: "Falha ao carregar a taxa de cancelamento.",
      description: "Tente novamente em alguns instantes.",
      statusCode: 500,
    });

    render(<CancellationRateCard />);

    expect(screen.getByText("Falha ao carregar a taxa de cancelamento.")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente em alguns instantes.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
