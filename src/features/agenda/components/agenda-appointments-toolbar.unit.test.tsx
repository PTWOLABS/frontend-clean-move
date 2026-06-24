import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgendaAppointmentsToolbar } from "./agenda-appointments-toolbar";
import type { AgendaFiltersState } from "../lib/agenda-filters-storage";

type SelectOptionMock = {
  label: string;
  value: string;
};

type SelectMockProps = {
  onChange: (value: string) => void;
  options: SelectOptionMock[];
  value?: string;
};

vi.mock("@/components/ui/select/select", () => ({
  Select: ({ onChange, options, value }: SelectMockProps) => (
    <select
      aria-label={options[0]?.label ?? "Selecione"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/components/ui/calendar/date-picker-with-range", () => ({
  DatePickerWithRange: ({ disabled }: { disabled?: boolean }) => (
    <button type="button" disabled={disabled}>
      Datas
    </button>
  ),
}));

function renderToolbar({
  appliedFilters = defaultAppliedFilters,
  applyFiltersDisabled = false,
  clearFiltersDisabled = false,
  onApplyFilters = vi.fn(),
  onClearFilters = vi.fn(),
  onClearPeriodFilter = vi.fn(),
  onClearStatusFilter = vi.fn(),
}: {
  appliedFilters?: AgendaFiltersState;
  applyFiltersDisabled?: boolean;
  clearFiltersDisabled?: boolean;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
  onClearPeriodFilter?: () => void;
  onClearStatusFilter?: () => void;
} = {}) {
  render(
    <AgendaAppointmentsToolbar
      statusFilter="ALL"
      searchField="serviceName"
      search=""
      periodMode="from-today"
      onStatusChange={vi.fn()}
      onSearchFieldChange={vi.fn()}
      onSearchChange={vi.fn()}
      onPeriodModeChange={vi.fn()}
      onDateRangeChange={vi.fn()}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      onClearPeriodFilter={onClearPeriodFilter}
      onClearStatusFilter={onClearStatusFilter}
      applyFiltersDisabled={applyFiltersDisabled}
      clearFiltersDisabled={clearFiltersDisabled}
      appliedFilters={appliedFilters}
    />,
  );
}

function openAdvancedFilters() {
  fireEvent.click(screen.getByRole("button", { name: /filtros/i }));
}

const defaultAppliedFilters: AgendaFiltersState = {
  statusFilter: "ALL",
  searchField: "serviceName",
  search: "",
  periodMode: "from-today",
  dateRange: {
    from: new Date("2026-06-01T12:00:00.000Z"),
    to: new Date("2026-06-07T12:00:00.000Z"),
  },
};

describe("AgendaAppointmentsToolbar", () => {
  it("calls the clear filters callback from the shared button", () => {
    const onClearFilters = vi.fn();

    renderToolbar({ onClearFilters });
    openAdvancedFilters();

    fireEvent.click(screen.getByRole("button", { name: /limpar filtros/i }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("disables the clear filters button when filters are already default", () => {
    renderToolbar({ clearFiltersDisabled: true });
    openAdvancedFilters();

    expect(screen.getByRole("button", { name: /limpar filtros/i })).toBeDisabled();
  });

  it("calls the apply filters callback from the apply button", () => {
    const onApplyFilters = vi.fn();

    renderToolbar({ onApplyFilters });
    openAdvancedFilters();

    fireEvent.click(screen.getByRole("button", { name: /aplicar filtros/i }));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /aplicar filtros/i })).not.toBeInTheDocument();
  });

  it("disables the apply filters button when draft filters are already applied", () => {
    renderToolbar({ applyFiltersDisabled: true });
    openAdvancedFilters();

    expect(screen.getByRole("button", { name: /aplicar filtros/i })).toBeDisabled();
  });

  it("does not show badges or clear all for search-only filters", () => {
    renderToolbar({
      appliedFilters: {
        ...defaultAppliedFilters,
        search: "Lavagem",
      },
    });

    expect(screen.queryByText(/Lavagem/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Todos os status/)).not.toBeInTheDocument();
    expect(screen.queryByText(/A partir de hoje/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /limpar todos/i })).not.toBeInTheDocument();
  });

  it("shows and clears the applied status badge without showing clear all for one filter", () => {
    const onClearStatusFilter = vi.fn();

    renderToolbar({
      appliedFilters: {
        ...defaultAppliedFilters,
        statusFilter: "SCHEDULED",
      },
      onClearStatusFilter,
    });

    expect(screen.getByText("Status: Agendado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /limpar todos/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remover filtro status: agendado/i }));

    expect(onClearStatusFilter).toHaveBeenCalledTimes(1);
  });

  it("shows and clears the applied custom period badge without showing clear all for one filter", () => {
    const onClearPeriodFilter = vi.fn();

    renderToolbar({
      appliedFilters: {
        ...defaultAppliedFilters,
        periodMode: "custom",
        dateRange: {
          from: new Date("2026-06-10T12:00:00.000Z"),
          to: new Date("2026-06-12T12:00:00.000Z"),
        },
      },
      onClearPeriodFilter,
    });

    expect(screen.getByText("Período: 10/06/2026 - 12/06/2026")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /limpar todos/i })).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /remover filtro período: 10\/06\/2026 - 12\/06\/2026/i,
      }),
    );

    expect(onClearPeriodFilter).toHaveBeenCalledTimes(1);
  });

  it("calls clear filters from the outside clear all button", () => {
    const onClearFilters = vi.fn();

    renderToolbar({
      appliedFilters: {
        ...defaultAppliedFilters,
        statusFilter: "DONE",
        periodMode: "all",
      },
      onClearFilters,
    });

    fireEvent.click(screen.getByRole("button", { name: /limpar todos/i }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
