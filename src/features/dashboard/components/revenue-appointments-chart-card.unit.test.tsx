import { render, screen } from "@testing-library/react";
import type * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  dashboardRevenueAppointmentsMock,
  dashboardRevenueAppointmentsSummaryMock,
} from "@/features/dashboard/mocks/dashboard-sections.mock";

type MockChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: unknown;
  children: React.ReactNode;
};

type MockAreaChartProps = {
  data: unknown[];
  children: React.ReactNode;
  accessibilityLayer?: boolean;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
};

type MockAreaProps = {
  yAxisId?: string;
  type?: string;
  dataKey: string;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  dot?: unknown;
  activeDot?: unknown;
  isAnimationActive?: boolean;
};

type MockCartesianGridProps = {
  vertical?: boolean;
  strokeDasharray?: string;
};

type MockXAxisProps = {
  dataKey?: string;
  tickLine?: boolean;
  axisLine?: boolean;
  tickMargin?: number;
  interval?: string;
};

type MockYAxisProps = {
  yAxisId?: string;
  orientation?: string;
  width?: number;
  tickLine?: boolean;
  axisLine?: boolean;
  tickFormatter?: unknown;
};

const rechartsMocks = vi.hoisted(() => ({
  Area: vi.fn(),
  AreaChart: vi.fn(),
  CartesianGrid: vi.fn(),
  XAxis: vi.fn(),
  YAxis: vi.fn(),
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
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
}));

vi.mock("recharts", () => ({
  Area: (props: MockAreaProps) => {
    rechartsMocks.Area(props);

    return <div data-testid="area" />;
  },
  AreaChart: ({ children, ...props }: MockAreaChartProps) => {
    rechartsMocks.AreaChart({ children, ...props });

    return <div data-testid="area-chart">{children}</div>;
  },
  CartesianGrid: (props: MockCartesianGridProps) => {
    rechartsMocks.CartesianGrid(props);

    return <div data-testid="cartesian-grid" />;
  },
  XAxis: (props: MockXAxisProps) => {
    rechartsMocks.XAxis(props);

    return <div data-testid="x-axis" />;
  },
  YAxis: (props: MockYAxisProps) => {
    rechartsMocks.YAxis(props);

    return <div data-testid="y-axis" />;
  },
}));

vi.mock("../hooks/use-fetch-metrics-revenue-and-appointments", () => ({
  useFetchMetricsRevenueAndAppointment: vi.fn(),
}));

import { useFetchMetricsRevenueAndAppointment } from "../hooks/use-fetch-metrics-revenue-and-appointments";
import { RevenueAppointmentsChartCard } from "./revenue-appointments-chart-card";

function mockRevenueAppointmentsQuery(
  data: ReturnType<typeof useFetchMetricsRevenueAndAppointment>["data"],
) {
  vi.mocked(useFetchMetricsRevenueAndAppointment).mockReturnValue({
    data,
  } as ReturnType<typeof useFetchMetricsRevenueAndAppointment>);
}

describe("RevenueAppointmentsChartCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title, legend, chart label, and period summary", () => {
    mockRevenueAppointmentsQuery({
      points: dashboardRevenueAppointmentsMock,
      summary: dashboardRevenueAppointmentsSummaryMock,
    });

    render(<RevenueAppointmentsChartCard periodLabel="Diário" />);

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

    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getAllByTestId("area")).toHaveLength(2);
    expect(screen.getAllByTestId("y-axis")).toHaveLength(2);

    expect(screen.getByText("Receita no período")).toBeInTheDocument();
    expect(screen.getByText(/47\.389,00/)).toBeInTheDocument();
    expect(screen.getByText("Agendamentos no período")).toBeInTheDocument();
    expect(screen.getByText("256")).toBeInTheDocument();
    expect(screen.getByText("+21%")).toBeInTheDocument();
    expect(screen.getByText("+18%")).toBeInTheDocument();

    expect(rechartsMocks.AreaChart).toHaveBeenCalledWith(
      expect.objectContaining({
        accessibilityLayer: true,
        data: dashboardRevenueAppointmentsMock,
        margin: {
          top: 12,
          right: 8,
          bottom: 0,
          left: 0,
        },
      }),
    );

    expect(rechartsMocks.CartesianGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        vertical: false,
        strokeDasharray: "4 4",
      }),
    );

    expect(rechartsMocks.XAxis).toHaveBeenCalledWith(
      expect.objectContaining({
        dataKey: "label",
        tickLine: false,
        axisLine: false,
        tickMargin: 10,
        interval: "preserveStartEnd",
      }),
    );

    expect(rechartsMocks.YAxis).toHaveBeenCalledWith(
      expect.objectContaining({
        yAxisId: "revenue",
        width: 56,
        tickLine: false,
        axisLine: false,
      }),
    );

    const revenueAxisProps = vi
      .mocked(rechartsMocks.YAxis)
      .mock.calls.find(([props]) => props.yAxisId === "revenue")?.[0];

    expect(revenueAxisProps?.tickFormatter).toBeInstanceOf(Function);
    const formattedSmallRevenue = (revenueAxisProps?.tickFormatter as (value: number) => string)(
      27000,
    );
    expect(formattedSmallRevenue).toContain("270");
    expect(formattedSmallRevenue).not.toBe("R$ 0k");

    expect(rechartsMocks.YAxis).toHaveBeenCalledWith(
      expect.objectContaining({
        yAxisId: "appointments",
        orientation: "right",
        width: 32,
        tickLine: false,
        axisLine: false,
      }),
    );

    expect(rechartsMocks.Area).toHaveBeenCalledWith(
      expect.objectContaining({
        yAxisId: "revenue",
        type: "monotone",
        dataKey: "revenueInCents",
        stroke: "var(--color-revenueInCents)",
        fill: "url(#revenueGradient)",
        strokeWidth: 2.5,
        isAnimationActive: false,
      }),
    );

    expect(rechartsMocks.Area).toHaveBeenCalledWith(
      expect.objectContaining({
        yAxisId: "appointments",
        type: "monotone",
        dataKey: "appointments",
        stroke: "var(--color-appointments)",
        fill: "url(#appointmentsGradient)",
        strokeWidth: 2.5,
        isAnimationActive: false,
      }),
    );
  });

  it("renders an empty state when there is no chart data", () => {
    mockRevenueAppointmentsQuery({
      points: [],
      summary: dashboardRevenueAppointmentsSummaryMock,
    });

    render(<RevenueAppointmentsChartCard />);

    expect(
      screen.getByText("Sem dados de receita e agendamentos para o período."),
    ).toBeInTheDocument();

    expect(screen.queryByTestId("area-chart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  it("renders a neutral comparison label when trend values are null", () => {
    mockRevenueAppointmentsQuery({
      points: dashboardRevenueAppointmentsMock,
      summary: {
        ...dashboardRevenueAppointmentsSummaryMock,
        revenueTrendPercent: null,
        appointmentsTrendPercent: null,
      },
    });

    render(<RevenueAppointmentsChartCard />);

    expect(screen.getAllByText("Sem comparação")).toHaveLength(2);
  });
});
