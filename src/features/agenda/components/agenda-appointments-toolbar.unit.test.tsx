import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AgendaAppointmentsToolbar } from "./agenda-appointments-toolbar";

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
  applyFiltersDisabled = false,
  clearFiltersDisabled = false,
  onApplyFilters = vi.fn(),
  onClearFilters = vi.fn(),
}: {
  applyFiltersDisabled?: boolean;
  clearFiltersDisabled?: boolean;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
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
      applyFiltersDisabled={applyFiltersDisabled}
      clearFiltersDisabled={clearFiltersDisabled}
    />,
  );
}

function openAdvancedFilters() {
  fireEvent.click(screen.getByRole("button", { name: /filtros/i }));
}

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
});
