import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MockSelectProps = {
  options: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }>;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
};

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

const revenueAppointmentsPointsMock = [
  {
    date: "2026-05-01",
    label: "01/05",
    revenueInCents: 2100000,
    appointments: 120,
  },
  {
    date: "2026-05-02",
    label: "02/05",
    revenueInCents: 2638900,
    appointments: 136,
  },
];

const revenueAppointmentsSummaryMock = {
  revenueInCents: 4738900,
  appointments: 256,
  revenueTrendPercent: 21,
  appointmentsTrendPercent: 18,
};

const granularityOptionsMock = [
  {
    label: "Diário",
    value: "daily",
  },
  {
    label: "Semanal",
    value: "weekly",
  },
  {
    label: "Mensal",
    value: "monthly",
  },
] as const;

vi.mock("@/components/ui/select/select", () => ({
  Select: ({ options, value, onChange, className }: MockSelectProps) => (
    <select
      aria-label="Granularidade"
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  ),
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

vi.mock("../hooks/use-dashboard-query-error-feedback", () => ({
  useDashboardQueryErrorFeedback: vi.fn(),
}));

import { useDashboardQueryErrorFeedback } from "../hooks/use-dashboard-query-error-feedback";
import { useFetchMetricsRevenueAndAppointment } from "../hooks/use-fetch-metrics-revenue-and-appointments";
import { RevenueAppointmentsChartCard } from "./revenue-appointments-chart-card";

function mockRevenueAppointmentsQuery(
  overrides: Partial<ReturnType<typeof useFetchMetricsRevenueAndAppointment>> = {},
) {
  const refetch = vi.fn();

  vi.mocked(useFetchMetricsRevenueAndAppointment).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    refetch,
    ...overrides,
  } as ReturnType<typeof useFetchMetricsRevenueAndAppointment>);

  return refetch;
}

function mockErrorFeedback(feedback: ReturnType<typeof useDashboardQueryErrorFeedback> = null) {
  vi.mocked(useDashboardQueryErrorFeedback).mockReturnValue(feedback);
}

describe("RevenueAppointmentsChartCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockErrorFeedback();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders title, legend, chart label, and period summary", () => {
    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="daily"
        showMetrics
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: /receita e agendamentos ao longo do tempo/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /mais informações sobre receita e agendamentos ao longo do tempo/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("daily");
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
        data: revenueAppointmentsPointsMock,
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
        width: 72,
        tickLine: false,
        axisLine: false,
        tickMargin: 8,
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
      data: {
        points: [],
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="daily"
        showMetrics
      />,
    );

    expect(
      screen.getByText("Sem dados de receita e agendamentos para o período."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("area-chart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  it("renders loading skeletons while the first request is pending", () => {
    mockRevenueAppointmentsQuery({
      isLoading: true,
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="monthly"
        showMetrics
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: /receita e agendamentos ao longo do tempo/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("monthly");
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("area-chart")).not.toBeInTheDocument();
  });

  it("renders an inline error state and retries when the first request fails", async () => {
    const user = userEvent.setup();
    const refetch = mockRevenueAppointmentsQuery({
      error: new Error("boom"),
    });

    mockErrorFeedback({
      title: "Falha ao carregar receita e agendamentos.",
      description: "Tente novamente em instantes.",
      statusCode: 500,
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="daily"
        showMetrics
      />,
    );

    expect(screen.getByText("Falha ao carregar receita e agendamentos.")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente em instantes.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("keeps the current chart visible when a refetch fails after data is loaded", () => {
    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
      error: new Error("boom"),
    });

    mockErrorFeedback({
      title: "Falha ao carregar receita e agendamentos.",
      description: "Tente novamente em instantes.",
      statusCode: 500,
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="daily"
        showMetrics
      />,
    );

    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /tentar novamente/i })).not.toBeInTheDocument();
  });

  it("renders a neutral comparison label when trend values are null", () => {
    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: {
          ...revenueAppointmentsSummaryMock,
          revenueTrendPercent: null,
          appointmentsTrendPercent: null,
        },
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="daily"
        showMetrics
      />,
    );

    expect(screen.getAllByText("Sem comparação")).toHaveLength(2);
  });

  it("updates the query input when the granularity action changes", async () => {
    const user = userEvent.setup();

    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="daily"
        showMetrics
      />,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: /granularidade/i }), "weekly");

    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      granularity: "weekly",
    });
  });

  it("uses only daily granularity for the last 7 days period", () => {
    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="weekly"
        filters={{ period: "last-7-days" }}
        showMetrics
      />,
    );

    expect(screen.getByRole("option", { name: "Diário" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Semanal" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Mensal" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("daily");
    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      period: "last-7-days",
      granularity: "daily",
    });
  });

  it("uses only daily granularity for custom ranges up to 7 days", () => {
    const startsAt = new Date("2026-01-01T00:00:00");
    const endsAt = new Date("2026-01-07T23:59:59");

    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="monthly"
        filters={{ startsAt, endsAt }}
        showMetrics
      />,
    );

    expect(screen.getByRole("option", { name: "Diário" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Semanal" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Mensal" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("daily");
    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      startsAt,
      endsAt,
      granularity: "daily",
    });
  });

  it("uses only daily granularity for this month before the eighth day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-07T12:00:00"));

    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="weekly"
        filters={{ period: "this-month" }}
        showMetrics
      />,
    );

    expect(screen.getByRole("option", { name: "Diário" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Semanal" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Mensal" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("daily");
    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      period: "this-month",
      granularity: "daily",
    });
  });

  it("enables daily and weekly for the last 30 days period", () => {
    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="monthly"
        filters={{ period: "last-30-days" }}
        showMetrics
      />,
    );

    expect(screen.getByRole("option", { name: "Diário" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Semanal" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Mensal" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("daily");
    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      period: "last-30-days",
      granularity: "daily",
    });
  });

  it("enables daily and weekly for custom ranges from 8 to 31 days", () => {
    const startsAt = new Date("2026-01-01T00:00:00");
    const endsAt = new Date("2026-01-08T23:59:59");

    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="monthly"
        filters={{ startsAt, endsAt }}
        showMetrics
      />,
    );

    expect(screen.getByRole("option", { name: "Diário" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Semanal" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Mensal" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("daily");
    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      startsAt,
      endsAt,
      granularity: "daily",
    });
  });

  it("applies the 8 to 31 day range rules to this month from the eighth day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-08T12:00:00"));

    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="weekly"
        filters={{ period: "this-month" }}
        showMetrics
      />,
    );

    expect(screen.getByRole("option", { name: "Diário" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Semanal" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Mensal" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("weekly");
    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      period: "this-month",
      granularity: "weekly",
    });
  });

  it("enables weekly and monthly from 32 to 180 days", () => {
    const startsAt = new Date("2026-01-01T00:00:00");
    const endsAt = new Date("2026-02-01T00:00:00");

    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="daily"
        filters={{ startsAt, endsAt }}
        showMetrics
      />,
    );

    expect(screen.getByRole("option", { name: "Diário" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Semanal" })).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "Mensal" })).not.toBeDisabled();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("weekly");
    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      startsAt,
      endsAt,
      granularity: "weekly",
    });
  });

  it("uses only monthly from 181 days", () => {
    const startsAt = new Date("2026-01-01T00:00:00");
    const endsAt = new Date("2026-06-30T00:00:00");

    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="weekly"
        filters={{ startsAt, endsAt }}
        showMetrics
      />,
    );

    expect(screen.getByRole("option", { name: "Diário" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Semanal" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Mensal" })).not.toBeDisabled();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("monthly");
    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      startsAt,
      endsAt,
      granularity: "monthly",
    });
  });

  it("keeps monthly granularity available for ranges longer than 24 months", () => {
    const startsAt = new Date("2024-01-01T00:00:00");
    const endsAt = new Date("2026-01-01T00:00:00");

    mockRevenueAppointmentsQuery({
      data: {
        points: revenueAppointmentsPointsMock,
        summary: revenueAppointmentsSummaryMock,
      },
    });

    render(
      <RevenueAppointmentsChartCard
        granularityOptions={granularityOptionsMock.slice()}
        defaultGranularity="monthly"
        filters={{ startsAt, endsAt }}
        showMetrics
      />,
    );

    expect(screen.getByRole("option", { name: "Diário" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Semanal" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Mensal" })).not.toBeDisabled();
    expect(screen.getByRole("combobox", { name: /granularidade/i })).toHaveValue("monthly");
    expect(vi.mocked(useFetchMetricsRevenueAndAppointment)).toHaveBeenLastCalledWith({
      startsAt,
      endsAt,
      granularity: "monthly",
    });
  });
});
