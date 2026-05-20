"use client";

import type FullCalendar from "@fullcalendar/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select/select";

import type { AppointmentCalendarView } from "../types/appointment-calendar";
import { navigationCalendarClassNames, viewOptions } from "../lib/appointments-page.helpers";

type AppointmentsCalendarToolbarProps = {
  calendarRef: RefObject<FullCalendar | null>;
  calendarTitle: string;
  selectedDate: Date;
  selectedView: AppointmentCalendarView;
  onSelectDate: (date: Date) => void;
};

export function AppointmentsCalendarToolbar({
  calendarRef,
  calendarTitle,
  selectedDate,
  selectedView,
  onSelectDate,
}: AppointmentsCalendarToolbarProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  function getCalendarApi() {
    return calendarRef.current?.getApi() ?? null;
  }

  function handleToday() {
    const calendarApi = getCalendarApi();

    if (!calendarApi) {
      return;
    }

    calendarApi.today();
    onSelectDate(calendarApi.getDate());
  }

  function handleNavigate(direction: "prev" | "next") {
    const calendarApi = getCalendarApi();

    if (!calendarApi) {
      return;
    }

    if (direction === "prev") {
      calendarApi.prev();
    } else {
      calendarApi.next();
    }

    onSelectDate(calendarApi.getDate());
  }

  function handleViewChange(nextView: AppointmentCalendarView) {
    const calendarApi = getCalendarApi();

    if (!calendarApi) {
      return;
    }

    calendarApi.changeView(nextView);
    onSelectDate(calendarApi.getDate());
  }

  function handleMiniCalendarSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    setIsDatePickerOpen(false);
    onSelectDate(date);
    getCalendarApi()?.gotoDate(date);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto]">
      <div className="hidden items-center gap-2 lg:flex">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-border/80 bg-background/70"
            onClick={() => handleNavigate("prev")}
            aria-label="Período anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl border-border/80 bg-background/70 px-3.5"
            onClick={handleToday}
          >
            Hoje
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-border/80 bg-background/70"
            onClick={() => handleNavigate("next")}
            aria-label="Próximo período"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-w-0 flex-none text-left lg:text-center">
        <CardTitle className="truncate font-display text-xl font-semibold capitalize text-card-foreground sm:text-2xl">
          {calendarTitle}
        </CardTitle>
      </div>

      <div className="ml-auto flex flex-wrap items-center justify-end gap-2 lg:ml-0">
        <Select
          value={selectedView}
          onChange={handleViewChange}
          options={viewOptions}
          className="h-9 w-36 rounded-xl border-border/80 bg-background/70 shadow-xs sm:w-40"
        />

        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-40 justify-between rounded-xl border-border/80 bg-background/70 px-3 shadow-xs xl:hidden"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                <span className="truncate text-sm text-card-foreground">
                  {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[18.5rem] rounded-2xl border-border/80 p-0">
            <MiniCalendar
              key={format(selectedDate, "yyyy-MM")}
              mode="single"
              locale={ptBR}
              defaultMonth={selectedDate}
              selected={selectedDate}
              onSelect={handleMiniCalendarSelect}
              className="w-full"
              classNames={navigationCalendarClassNames}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
