"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar as MiniCalendar } from "@/components/ui/calendar";
import { CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select/select";

import { useAppointmentsPage } from "../contexts/appointments-page-context";
import { navigationCalendarClassNames, viewOptions } from "../lib/appointments-page.helpers";

export function AppointmentsCalendarToolbar() {
  const {
    calendarTitle,
    selectedDate,
    selectedView,
    miniCalendarMonth,
    isDatePickerOpen,
    handleNavigate,
    handleToday,
    handleViewChange,
    handleMiniCalendarSelect,
    setMiniCalendarMonth,
    setIsDatePickerOpen,
  } = useAppointmentsPage();

  return (
    <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
      <div className="flex items-center gap-2">
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

      <div className="min-w-0 text-left lg:text-center">
        <CardTitle className="truncate font-display text-xl font-semibold capitalize text-card-foreground sm:text-2xl">
          {calendarTitle}
        </CardTitle>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <Select
          value={selectedView}
          onChange={handleViewChange}
          options={viewOptions}
          className="h-9 min-w-40 rounded-xl border-border/80 bg-background/70 shadow-xs"
        />

        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 min-w-40 justify-between rounded-xl border-border/80 bg-background/70 px-3 shadow-xs xl:hidden"
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
              mode="single"
              locale={ptBR}
              month={miniCalendarMonth}
              onMonthChange={setMiniCalendarMonth}
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
