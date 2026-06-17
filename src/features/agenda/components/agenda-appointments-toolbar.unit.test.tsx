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
  clearFiltersDisabled = false,
  onClearFilters = vi.fn(),
}: {
  clearFiltersDisabled?: boolean;
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
      onClearFilters={onClearFilters}
      clearFiltersDisabled={clearFiltersDisabled}
    />,
  );
}

describe("AgendaAppointmentsToolbar", () => {
  it("calls the clear filters callback from the shared button", () => {
    const onClearFilters = vi.fn();

    renderToolbar({ onClearFilters });

    fireEvent.click(screen.getByRole("button", { name: /limpar filtros/i }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("disables the clear filters button when filters are already default", () => {
    renderToolbar({ clearFiltersDisabled: true });

    expect(screen.getByRole("button", { name: /limpar filtros/i })).toBeDisabled();
  });
});
