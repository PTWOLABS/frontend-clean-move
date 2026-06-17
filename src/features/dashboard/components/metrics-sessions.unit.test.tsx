import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { normalizeQueryParamsFilters } from "@/shared/utils/lib";

import {
  areDashboardFiltersDefault,
  getCustomDashboardDateRangeFilters,
  getDashboardMetricsFilters,
  limitCustomDashboardDateRange,
  MetricsSections,
} from "./metrics-sessions";

type SelectOptionMock = {
  label: string;
  value: string;
};

type SelectMockProps = {
  className?: string;
  onChange: (value: string) => void;
  options: SelectOptionMock[];
  value?: string;
};

vi.mock("@/components/ui/calendar/date-picker-with-range", () => ({
  DatePickerWithRange: ({ disabled }: { disabled?: boolean }) => (
    <button type="button" disabled={disabled}>
      Período do dashboard
    </button>
  ),
}));

vi.mock("@/components/ui/select/select", () => ({
  Select: ({ className, onChange, options, value }: SelectMockProps) => {
    const ariaLabel = options.some((option) => option.value === "last-30-days")
      ? "Período"
      : "Status";

    return (
      <select
        aria-label={ariaLabel}
        className={className}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
}));

vi.mock("@/features/dashboard/providers/dashboard-metrics-visibility-provider", () => ({
  useDashboardMetricsVisibility: () => ({ shouldShowMetrics: true }),
}));

vi.mock("./metrics-overview", () => ({
  MetricsOverview: () => <div>Resumo de métricas</div>,
}));

vi.mock("./popular-services-card", () => ({
  PopularServicesCard: () => <div>Serviços populares</div>,
}));

vi.mock("./revenue-appointments-chart-card", () => ({
  RevenueAppointmentsChartCard: () => <div>Gráfico de receita</div>,
}));

vi.mock("./tables/appointments-history/appointments-history-table", () => ({
  AppointmentsHistoryTable: () => <div>Histórico de agendamentos</div>,
}));

vi.mock("./tables/most-frequent-customers/most-frequent-customers-table", () => ({
  MostFrequentCustomersTable: () => <div>Clientes frequentes</div>,
}));

afterEach(() => {
  vi.useRealTimers();
});

describe("getCustomDashboardDateRangeFilters", () => {
  it("normalizes custom endsAt to the end of the selected day", () => {
    const filters = getCustomDashboardDateRangeFilters({
      from: new Date(2026, 4, 1),
      to: new Date(2026, 4, 29),
    });

    expect(filters.startsAt).toEqual(new Date(2026, 4, 1));
    expect(filters.endsAt).toEqual(new Date(2026, 4, 29, 23, 59, 59, 999));
    expect(normalizeQueryParamsFilters(filters)).toEqual({
      startsAt: "2026-05-01T00:00:00.000Z",
      endsAt: "2026-05-29T23:59:59.999Z",
    });
  });

  it("keeps endsAt undefined when the custom range has no end date", () => {
    const filters = getCustomDashboardDateRangeFilters({
      from: new Date(2026, 4, 1),
    });

    expect(filters).toEqual({
      startsAt: new Date(2026, 4, 1),
      endsAt: undefined,
    });
    expect(normalizeQueryParamsFilters(filters)).toEqual({
      startsAt: "2026-05-01T00:00:00.000Z",
    });
  });

  it("limits custom ranges to 24 months before serializing filters", () => {
    const filters = getCustomDashboardDateRangeFilters({
      from: new Date(2024, 4, 29),
      to: new Date(2026, 4, 30),
    });

    expect(filters.endsAt).toEqual(new Date(2026, 4, 29, 23, 59, 59, 999));
    expect(normalizeQueryParamsFilters(filters)).toEqual({
      startsAt: "2024-05-29T00:00:00.000Z",
      endsAt: "2026-05-29T23:59:59.999Z",
    });
  });

  it("returns a date range capped at the 24 month limit", () => {
    const limitedDateRange = limitCustomDashboardDateRange({
      from: new Date(2024, 4, 29),
      to: new Date(2026, 5, 10),
    });

    expect(limitedDateRange).toEqual({
      from: new Date(2024, 4, 29),
      to: new Date(2026, 4, 29),
    });
  });

  it("uses preset filters for custom ranges that match a preset", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00"));

    expect(
      getDashboardMetricsFilters({
        period: "custom",
        dateRange: {
          from: new Date(2026, 4, 23),
          to: new Date(2026, 4, 29),
        },
        status: "ALL",
      }),
    ).toEqual({
      period: "last-7-days",
      status: ["DONE", "SCHEDULED"],
    });

    expect(
      getDashboardMetricsFilters({
        period: "custom",
        dateRange: {
          from: new Date(2026, 3, 30),
          to: new Date(2026, 4, 29),
        },
        status: "DONE",
      }),
    ).toEqual({
      period: "last-30-days",
      status: ["DONE"],
    });

    expect(
      getDashboardMetricsFilters({
        period: "custom",
        dateRange: {
          from: new Date(2026, 4, 1),
          to: new Date(2026, 4, 31),
        },
        status: "SCHEDULED",
      }),
    ).toEqual({
      period: "this-month",
      status: ["SCHEDULED"],
    });
  });

  it("resolves all dashboard statuses to done and scheduled only", () => {
    const filters = getDashboardMetricsFilters({
      period: "last-30-days",
      status: "ALL",
    });

    expect(filters).toEqual({
      period: "last-30-days",
      status: ["DONE", "SCHEDULED"],
    });
    expect(filters.status).not.toContain("CANCELLED");
    expect(normalizeQueryParamsFilters(filters)).toEqual({
      period: "last-30-days",
      status: ["DONE", "SCHEDULED"],
    });
  });

  it("uses explicit date filters for custom ranges that do not match a preset", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00"));

    const filters = getDashboardMetricsFilters({
      period: "custom",
      dateRange: {
        from: new Date(2026, 4, 2),
        to: new Date(2026, 4, 29),
      },
      status: "DONE",
    });

    expect(filters).toEqual({
      startsAt: new Date(2026, 4, 2),
      endsAt: new Date(2026, 4, 29, 23, 59, 59, 999),
      status: ["DONE"],
    });
  });
});

describe("areDashboardFiltersDefault", () => {
  it("detects the default dashboard filter state", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00"));

    expect(
      areDashboardFiltersDefault({
        period: "last-30-days",
        dateRange: {
          from: new Date(2026, 3, 30),
          to: new Date(2026, 4, 29),
        },
        status: "ALL",
      }),
    ).toBe(true);

    expect(
      areDashboardFiltersDefault({
        period: "last-30-days",
        dateRange: {
          from: new Date(2026, 3, 30),
          to: new Date(2026, 4, 29),
        },
        status: "DONE",
      }),
    ).toBe(false);
  });
});

describe("MetricsSections", () => {
  it("resets dashboard filters to their default values", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00"));

    render(<MetricsSections />);

    const clearButton = screen.getByRole("button", { name: /limpar filtros/i });

    expect(clearButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "DONE" } });

    expect(clearButton).toBeEnabled();

    fireEvent.click(clearButton);

    expect(screen.getByLabelText("Período")).toHaveValue("last-30-days");
    expect(screen.getByLabelText("Status")).toHaveValue("ALL");
    expect(clearButton).toBeDisabled();
  });
});
