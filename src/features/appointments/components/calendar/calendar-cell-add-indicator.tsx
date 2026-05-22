import { Plus } from "lucide-react";

export function CalendarCellAddIndicator({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={className}>
      <Plus className="size-3.5" />
    </span>
  );
}
