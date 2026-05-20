"use client";

import type { DatesSetArg, EventClickArg } from "@fullcalendar/core/index.js";
import type { DateClickArg } from "@fullcalendar/interaction/index.js";
import FullCalendar from "@fullcalendar/react";
import * as React from "react";

import type {
  AppointmentCalendarEvent,
  AppointmentCalendarView,
} from "../types/appointment-calendar";

export type AppointmentsPageContextValue = {
  calendarRef: React.RefObject<FullCalendar | null>;
  initialSelectedDate: Date;
  events: AppointmentCalendarEvent[];
  selectedDate: Date;
  selectedEventId: string | null;
  selectedView: AppointmentCalendarView;
  calendarTitle: string;
  miniCalendarMonth: Date;
  selectedSlotKey: string | null;
  isDatePickerOpen: boolean;
  selectedDayAppointments: AppointmentCalendarEvent[];
  selectedEvent: AppointmentCalendarEvent | null;
  busyDaysInMiniCalendarMonth: number;
  setMiniCalendarMonth: (month: Date) => void;
  setIsDatePickerOpen: (open: boolean) => void;
  handleSlotPress: (date: Date) => void;
  handleMonthCellPress: (date: Date) => void;
  handleDatesSet: (arg: DatesSetArg) => void;
  handleDateClick: (info: DateClickArg) => void;
  handleEventClick: (info: EventClickArg) => void;
  handleToday: () => void;
  handleNavigate: (direction: "prev" | "next") => void;
  handleViewChange: (nextView: AppointmentCalendarView) => void;
  handleMiniCalendarSelect: (date: Date | undefined) => void;
  handleAddMockAppointment: () => void;
  handleAgendaItemClick: (event: AppointmentCalendarEvent) => void;
};

const AppointmentsPageContext = React.createContext<AppointmentsPageContextValue | null>(null);

type AppointmentsPageProviderProps = {
  value: AppointmentsPageContextValue;
  children: React.ReactNode;
};

export function AppointmentsPageProvider({ value, children }: AppointmentsPageProviderProps) {
  return (
    <AppointmentsPageContext.Provider value={value}>{children}</AppointmentsPageContext.Provider>
  );
}

export function useAppointmentsPage() {
  const context = React.useContext(AppointmentsPageContext);

  if (!context) {
    throw new Error("useAppointmentsPage must be used within AppointmentsPageProvider.");
  }

  return context;
}
