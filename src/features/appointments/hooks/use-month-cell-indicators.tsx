import type { DayCellContentArg, DayCellMountArg } from "@fullcalendar/core/index.js";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import styles from "../components/appointments-page.module.css";
import { formatDayKey } from "../lib/appointments-page.helpers";
import { CalendarCellAddIndicator } from "../components/calendar/calendar-cell-add-indicator";

type MonthCellIndicatorTarget = {
  date: Date;
  key: string;
  frameElement: HTMLElement;
};

type UseMonthCellIndicatorsOptions = {
  onMonthCellPress: (date: Date) => void;
  onCellAddIndicatorPress: (open: boolean) => void;
};

export function useMonthCellIndicators({
  onMonthCellPress,
  onCellAddIndicatorPress,
}: UseMonthCellIndicatorsOptions) {
  const [targets, setTargets] = useState<MonthCellIndicatorTarget[]>([]);

  const handleMonthCellDidMount = useCallback((arg: DayCellMountArg) => {
    if (arg.view.type !== "dayGridMonth") {
      return;
    }

    const frameElement = arg.el.querySelector<HTMLElement>(".fc-daygrid-day-frame");

    if (!frameElement) {
      return;
    }

    const key = formatDayKey(arg.date);

    setTargets((currentTargets) => {
      const nextTarget = {
        date: arg.date,
        key,
        frameElement,
      };
      const existingIndex = currentTargets.findIndex((target) => target.key === key);

      if (existingIndex === -1) {
        return [...currentTargets, nextTarget];
      }

      return currentTargets.map((target, index) => (index === existingIndex ? nextTarget : target));
    });
  }, []);

  const handleMonthCellWillUnmount = useCallback((arg: DayCellMountArg) => {
    const key = formatDayKey(arg.date);

    setTargets((currentTargets) => currentTargets.filter((target) => target.key !== key));
  }, []);

  const monthCellIndicatorPortals = useMemo(
    () =>
      targets
        .filter((target) => target.frameElement.isConnected)
        .map((target) =>
          createPortal(
            <button
              key={target.key}
              type="button"
              className={styles.monthCellIndicatorButton}
              aria-label={`Selecionar dia ${format(target.date, "dd/MM/yyyy", { locale: ptBR })}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onMonthCellPress(target.date);
              }}
            >
              <CalendarCellAddIndicator
                className={styles.monthCellIndicatorIcon}
                onClick={onCellAddIndicatorPress}
              />
            </button>,
            target.frameElement,
            target.key,
          ),
        ),
    [onMonthCellPress, targets],
  );

  const renderMonthDayCellContent = useCallback((arg: DayCellContentArg) => arg.dayNumberText, []);

  return {
    monthCellIndicatorPortals,
    handleMonthCellDidMount,
    handleMonthCellWillUnmount,
    renderMonthDayCellContent,
  };
}
