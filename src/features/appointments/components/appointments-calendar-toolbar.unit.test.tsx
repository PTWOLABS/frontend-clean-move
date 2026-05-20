import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type FullCalendar from "@fullcalendar/react";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/select/select", () => ({
  Select: ({
    value,
    onChange,
    options,
  }: {
    value?: string;
    onChange: (value: string) => void;
    options: Array<{ label: string; value: string }>;
  }) => (
    <select
      aria-label="Visão do calendário"
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

import { AppointmentsCalendarToolbar } from "./appointments-calendar-toolbar";

describe("AppointmentsCalendarToolbar", () => {
  it("uses the calendar api when the user clicks Hoje", async () => {
    const user = userEvent.setup();
    const today = vi.fn();
    const getDate = vi.fn(() => new Date("2026-05-20T10:00:00.000Z"));
    const onSelectDate = vi.fn();
    const calendarRef = {
      current: {
        getApi: () => ({
          today,
          getDate,
          prev: vi.fn(),
          next: vi.fn(),
          changeView: vi.fn(),
          gotoDate: vi.fn(),
        }),
      },
    } as unknown as RefObject<FullCalendar | null>;

    render(
      <AppointmentsCalendarToolbar
        calendarRef={calendarRef}
        calendarTitle="maio de 2026"
        selectedDate={new Date("2026-05-19T10:00:00.000Z")}
        selectedView="dayGridMonth"
        onSelectDate={onSelectDate}
      />,
    );

    await user.click(screen.getByRole("button", { name: /hoje/i }));

    expect(today).toHaveBeenCalledTimes(1);
    expect(onSelectDate).toHaveBeenCalledWith(new Date("2026-05-20T10:00:00.000Z"));
  });
});
