import { Plus } from "lucide-react";

type CalendarCellAddIndicatorProps = {
  className: string;
  onClick: (open: boolean) => void;
};
export function CalendarCellAddIndicator({ className, onClick }: CalendarCellAddIndicatorProps) {
  return (
    <span aria-hidden="true" className={className} onClick={() => onClick(true)}>
      <Plus className="size-3.5" />
    </span>
  );
}
