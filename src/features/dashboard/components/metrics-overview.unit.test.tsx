import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DashboardMetricsOverview } from "../types/api-types";

const mocks = vi.hoisted(() => ({
  metricCard: vi.fn(),
}));

type MockMetricCardProps = {
  title: string;
  value: string;
  trend: {
    value: string;
    direction: string;
    label: string;
  };
  chartData: Array<{ value: number }>;
};

type MockDashboardQueryErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

vi.mock("../hooks/use-metrics-overview", () => ({
  useMetricsOverview: vi.fn(),
}));

vi.mock("../hooks/use-dashboard-query-error-feedback", () => ({
  useDashboardQueryErrorFeedback: vi.fn(),
}));

vi.mock("./metric-card", () => ({
  MetricCard: ({ title, value, trend, chartData }: MockMetricCardProps) => {
    mocks.metricCard({ title, value, trend, chartData });

    return (
      <article data-testid="metric-card">
        <h4>{title}</h4>
        <p>{value}</p>
        <p>{trend.value}</p>
        <p>{trend.direction}</p>
        <p>{trend.label}</p>
      </article>
    );
  },
}));

vi.mock("./dashboard-query-state", () => ({
  DashboardMetricCardSkeleton: () => <div data-testid="metric-card-skeleton" />,
  DashboardQueryErrorState: ({
    title,
    description,
    onRetry,
  }: MockDashboardQueryErrorStateProps) => (
    <div>
      <p>{title}</p>
      <p>{description}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      ) : null}
    </div>
  ),
}));

import { useDashboardQueryErrorFeedback } from "../hooks/use-dashboard-query-error-feedback";
import { useMetricsOverview } from "../hooks/use-metrics-overview";
import { MetricsOverview } from "./metrics-overview";

const metricsOverviewMock: DashboardMetricsOverview = {
  appointments: {
    value: 256,
    variationPercentage: 18,
    points: [
      {
        date: "2026-05-01",
        label: "01/05",
        value: 18,
      },
    ],
  },
  totalRevenue: {
    valueInCents: 4738900,
    variationPercentage: 21,
    points: [
      {
        date: "2026-05-01",
        label: "01/05",
        valueInCents: 4738900,
      },
    ],
  },
  cancellationRate: {
    value: 4.2,
    variationPercentage: -1.6,
    points: [
      {
        date: "2026-05-01",
        label: "01/05",
        value: 4.2,
      },
    ],
  },
  averageTicket: {
    valueInCents: 18500,
    variationPercentage: 0,
    points: [
      {
        date: "2026-05-01",
        label: "01/05",
        valueInCents: 18500,
      },
    ],
  },
};

function mockMetricsOverviewQuery(overrides: Partial<ReturnType<typeof useMetricsOverview>> = {}) {
  const refetch = vi.fn();

  vi.mocked(useMetricsOverview).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    refetch,
    ...overrides,
  } as ReturnType<typeof useMetricsOverview>);

  return refetch;
}

function mockErrorFeedback(feedback: ReturnType<typeof useDashboardQueryErrorFeedback> = null) {
  vi.mocked(useDashboardQueryErrorFeedback).mockReturnValue(feedback);
}

describe("MetricsOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockErrorFeedback();
  });

  it("renders four loading skeletons on the first load", () => {
    mockMetricsOverviewQuery({
      isLoading: true,
    });

    render(<MetricsOverview filters={{}} />);

    expect(screen.getAllByTestId("metric-card-skeleton")).toHaveLength(4);
    expect(screen.queryByTestId("metric-card")).not.toBeInTheDocument();
  });

  it("renders an inline error state and retries when the first load fails", async () => {
    const user = userEvent.setup();
    const refetch = mockMetricsOverviewQuery({
      error: new Error("boom"),
    });

    mockErrorFeedback({
      title: "Falha ao carregar a visão geral.",
      description: "Tente novamente em alguns instantes.",
      statusCode: 500,
    });

    render(<MetricsOverview filters={{}} />);

    expect(screen.getByText("Falha ao carregar a visão geral.")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente em alguns instantes.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("maps dashboard metrics into four cards with the expected values and trends", () => {
    mockMetricsOverviewQuery({
      data: metricsOverviewMock,
    });

    render(<MetricsOverview filters={{}} />);

    expect(screen.getAllByTestId("metric-card")).toHaveLength(4);
    expect(screen.getByText("Agendamentos")).toBeInTheDocument();
    expect(screen.getByText("Receita total")).toBeInTheDocument();
    expect(screen.getByText("Taxa de cancelamento")).toBeInTheDocument();
    expect(screen.getByText("Ticket médio")).toBeInTheDocument();
    expect(screen.getByText("256")).toBeInTheDocument();
    expect(screen.getByText(/47\.389,00/)).toBeInTheDocument();
    expect(screen.getByText(/4,2%/)).toBeInTheDocument();
    expect(screen.getByText(/185,00/)).toBeInTheDocument();

    const cancellationMetric = mocks.metricCard.mock.calls.find(
      ([props]) => (props as MockMetricCardProps).title === "Taxa de cancelamento",
    )?.[0] as MockMetricCardProps | undefined;

    expect(cancellationMetric).toEqual(
      expect.objectContaining({
        trend: {
          value: "-1,6%",
          direction: "up",
          label: "vs. período anterior",
        },
        chartData: [{ value: 4.2 }],
      }),
    );
  });

  it("keeps the metric cards visible when a refetch fails after data is already loaded", () => {
    mockMetricsOverviewQuery({
      data: metricsOverviewMock,
      error: new Error("boom"),
    });

    mockErrorFeedback({
      title: "Falha ao carregar a visão geral.",
      description: "Tente novamente em alguns instantes.",
      statusCode: 500,
    });

    render(<MetricsOverview filters={{}} />);

    expect(screen.getAllByTestId("metric-card")).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /tentar novamente/i })).not.toBeInTheDocument();
  });
});
