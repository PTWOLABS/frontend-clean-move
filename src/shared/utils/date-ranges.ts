import { isSameDay } from "date-fns";
import type { DateRange } from "react-day-picker";

export function areSameDateRanges(first?: DateRange, second?: DateRange) {
  const firstFrom = first?.from;
  const secondFrom = second?.from;
  const firstTo = first?.to;
  const secondTo = second?.to;

  const hasSameFrom =
    (!firstFrom && !secondFrom) ||
    Boolean(firstFrom && secondFrom && isSameDay(firstFrom, secondFrom));
  const hasSameTo =
    (!firstTo && !secondTo) || Boolean(firstTo && secondTo && isSameDay(firstTo, secondTo));

  return hasSameFrom && hasSameTo;
}
