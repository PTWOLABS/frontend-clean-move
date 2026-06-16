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
        selectedDate={new Date("2026-05-20T10:00:00.000Z")}
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
        selectedDate={new Date("2026-05-20T10:00:00.000Z")}
        selectedView="dayGridMonth"
        onSelectDate={vi.fn()}
        onSelectView={onSelectView}
      />,
    );

    await user.click(screen.getByRole("button", { name: /semana/i }));

    expect(onSelectView).toHaveBeenCalledWith("timeGridWeek");
  });

  it("navigates to the previous and next periods using the calendar api", async () => {
    const user = userEvent.setup();
    const previousDate = new Date("2026-04-20T10:00:00.000Z");
    const nextDate = new Date("2026-06-20T10:00:00.000Z");
    const prev = vi.fn();
    const next = vi.fn();
    const getDate = vi.fn().mockReturnValueOnce(previousDate).mockReturnValueOnce(nextDate);
    const onSelectDate = vi.fn();
    const calendarRef = {
      current: {
        getApi: () => ({
          today: vi.fn(),
          getDate,
          prev,
          next,
          changeView: vi.fn(),
          gotoDate: vi.fn(),
        }),
      },
    } as unknown as RefObject<FullCalendar | null>;

    render(
      <AppointmentsCalendarToolbar
        calendarRef={calendarRef}
        calendarTitle="maio de 2026"
        selectedDate={new Date("2026-05-20T10:00:00.000Z")}
        selectedView="dayGridMonth"
        onSelectDate={onSelectDate}
        onSelectView={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /período anterior/i }));
    await user.click(screen.getByRole("button", { name: /próximo período/i }));

    expect(prev).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(onSelectDate).toHaveBeenNthCalledWith(1, previousDate);
    expect(onSelectDate).toHaveBeenNthCalledWith(2, nextDate);
  });

  it("hides the weekly view when compact options are provided", () => {
    const calendarRef = {
      current: null,
    } as unknown as RefObject<FullCalendar | null>;

    render(
      <AppointmentsCalendarToolbar
        calendarRef={calendarRef}
        calendarTitle="maio de 2026"
        selectedDate={new Date("2026-05-20T10:00:00.000Z")}
        selectedView="dayGridMonth"
        viewOptions={[
          { label: "Mês", value: "dayGridMonth" },
          { label: "Dia", value: "timeGridDay" },
          { label: "Lista", value: "listWeek" },
        ]}
        onSelectDate={vi.fn()}
        onSelectView={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /mês/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /semana/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dia/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lista/i })).toBeInTheDocument();
  });

  it("navigates by week when the list view is selected", async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    const calendarRef = {
      current: null,
    } as unknown as RefObject<FullCalendar | null>;

    render(
      <AppointmentsCalendarToolbar
        calendarRef={calendarRef}
        calendarTitle="17 - 23 de mai de 2026"
        selectedDate={new Date("2026-05-20T10:00:00.000Z")}
        selectedView="listWeek"
        onSelectDate={onSelectDate}
        onSelectView={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /período anterior/i }));
    await user.click(screen.getByRole("button", { name: /próximo período/i }));

    expect(onSelectDate).toHaveBeenNthCalledWith(1, new Date("2026-05-13T10:00:00.000Z"));
    expect(onSelectDate).toHaveBeenNthCalledWith(2, new Date("2026-05-27T10:00:00.000Z"));
  });
});
