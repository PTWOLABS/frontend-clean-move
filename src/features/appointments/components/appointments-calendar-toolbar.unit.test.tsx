import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type FullCalendar from "@fullcalendar/react";
import type { RefObject } from "react";
import { describe, expect, it, vi } from "vitest";

import { AppointmentsCalendarToolbar } from "./appointments-calendar-toolbar";

describe("AppointmentsCalendarToolbar", () => {
  it("uses the calendar api when the user clicks Hoje", async () => {
    const user = userEvent.setup();
    const today = vi.fn();
    const getDate = vi.fn(() => new Date("2026-05-20T10:00:00.000Z"));
    const onSelectDate = vi.fn();
    const onSelectView = vi.fn();
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
        selectedView="dayGridMonth"
        onSelectDate={onSelectDate}
        onSelectView={onSelectView}
      />,
    );

    await user.click(screen.getByRole("button", { name: /hoje/i }));

    expect(today).toHaveBeenCalledTimes(1);
    expect(onSelectDate).toHaveBeenCalledWith(new Date("2026-05-20T10:00:00.000Z"));
  });

  it("requests a calendar view change from the segmented control", async () => {
    const user = userEvent.setup();
    const onSelectView = vi.fn();
    const calendarRef = {
      current: {
        getApi: () => ({
          today: vi.fn(),
          getDate: vi.fn(),
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
        selectedView="dayGridMonth"
        onSelectDate={vi.fn()}
        onSelectView={onSelectView}
      />,
    );

    await user.click(screen.getByRole("button", { name: /semana/i }));

    expect(onSelectView).toHaveBeenCalledWith("timeGridWeek");
  });

  it("hides the weekly view when compact options are provided", () => {
    const calendarRef = {
      current: null,
    } as unknown as RefObject<FullCalendar | null>;

    render(
      <AppointmentsCalendarToolbar
        calendarRef={calendarRef}
        calendarTitle="maio de 2026"
        selectedView="dayGridMonth"
        viewOptions={[
          { label: "Mês", value: "dayGridMonth" },
          { label: "Dia", value: "timeGridDay" },
        ]}
        onSelectDate={vi.fn()}
        onSelectView={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /mês/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /semana/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dia/i })).toBeInTheDocument();
  });
});
