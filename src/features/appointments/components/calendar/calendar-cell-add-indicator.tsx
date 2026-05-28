import { Plus } from "lucide-react";

type CalendarCellAddIndicatorProps = {
  className: string;
  onClick: (open: boolean) => void;
  stopClickPropagation?: boolean;
};
export function CalendarCellAddIndicator({
  className,
  onClick,
  stopClickPropagation = false,
}: CalendarCellAddIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      onClick={(event) => {
        if (stopClickPropagation) {
          event.preventDefault();
          event.stopPropagation();
        }

        onClick(true);
      }}
    >
      <Plus className="size-3.5" />
    </span>
  );
}
