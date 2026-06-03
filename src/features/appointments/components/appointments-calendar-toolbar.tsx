"use client";

import type FullCalendar from "@fullcalendar/react";
import { addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

import type { AppointmentCalendarView } from "../types/appointment-calendar";
import { viewToggleOptions } from "../lib/appointments-page.helpers";

type ViewToggleOption = {
  label: string;
  value: AppointmentCalendarView;
};

type AppointmentsCalendarToolbarProps = {
  calendarRef: RefObject<FullCalendar | null>;
  calendarTitle: string;
  selectedDate: Date;
  selectedView: AppointmentCalendarView;
  viewOptions?: ViewToggleOption[];
  onSelectDate: (date: Date) => void;
  onSelectView: (view: AppointmentCalendarView) => void;
};

export function AppointmentsCalendarToolbar({
  calendarRef,
  calendarTitle,
  selectedDate,
  selectedView,
  viewOptions: availableViewOptions = viewToggleOptions,
  onSelectDate,
  onSelectView,
}: AppointmentsCalendarToolbarProps) {
  function getCalendarApi() {
    return calendarRef.current?.getApi() ?? null;
  }

  function handleToday() {
    if (selectedView === "listWeek") {
      onSelectDate(new Date());

      return;
    }

    const calendarApi = getCalendarApi();

    if (!calendarApi) {
      return;
    }

    calendarApi.today();
    onSelectDate(calendarApi.getDate());
  }

  function handleNavigate(direction: "prev" | "next") {
    if (selectedView === "listWeek") {
      onSelectDate(addDays(selectedDate, direction === "prev" ? -7 : 7));

      return;
    }

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

  return (
    <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-4">
      <div className="flex min-w-0 items-center gap-3 min-[420px]:flex-1">
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-lg border-border/80 bg-background/70 text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
            onClick={() => handleNavigate("prev")}
            aria-label="Período anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-lg border-border/80 bg-background/70 text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
            onClick={() => handleNavigate("next")}
            aria-label="Próximo período"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <CardTitle className="min-w-0 truncate font-display text-lg font-semibold leading-tight tracking-tight text-card-foreground min-[520px]:text-xl">
          {calendarTitle}
        </CardTitle>
      </div>

      <div className="flex min-w-0 flex-col gap-2 min-[420px]:shrink-0 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-end">
        <div
          className={cn(
            "grid h-9 min-w-0 rounded-lg border border-border/70 bg-background/60 p-1 shadow-xs",
            availableViewOptions.length === 2 && "grid-cols-2 min-[420px]:w-36",
            availableViewOptions.length === 3 && "grid-cols-3 min-[420px]:w-48",
            availableViewOptions.length >= 4 &&
              "grid-cols-3 min-[420px]:w-52 md:w-[16rem] md:grid-cols-4",
          )}
          role="group"
          aria-label="Visualização do calendário"
        >
          {availableViewOptions.map((option) => {
            const isActive = selectedView === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "h-7 min-w-0 rounded-md px-2 text-xs font-semibold shadow-none sm:px-3",
                  isActive ? "" : "text-muted-foreground hover:text-foreground",
                  option.value === "timeGridWeek" && "hidden md:inline-flex",
                )}
                onClick={() => onSelectView(option.value)}
              >
                {option.label}
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-9 w-full rounded-lg border-border/80 bg-background/70 px-4 text-xs font-semibold shadow-none hover:bg-muted/50 min-[420px]:w-auto"
          onClick={handleToday}
        >
          Hoje
        </Button>
      </div>
    </div>
  );
}
