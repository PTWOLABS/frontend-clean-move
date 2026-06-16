import styles from "../appointments-page.module.css";
import { cn } from "@/shared/utils/cn";

type CalendarMoreLinkContentProps = {
  count: number;
};

export function CalendarMoreLinkContent({ count }: CalendarMoreLinkContentProps) {
  const fullLabel = `mais ${count} agendamento${count === 1 ? "" : "s"}...`;
  const visibleLabel = `+${count} ag.`;
  const compactLabel = `+${count}`;

  return (
    <>
      <span className="sr-only">{fullLabel}</span>
      <span aria-hidden="true" className={cn(styles.moreLinkLabel, styles.moreLinkFullLabel)}>
        {visibleLabel}
      </span>
      <span aria-hidden="true" className={cn(styles.moreLinkLabel, styles.moreLinkCompactLabel)}>
        {compactLabel}
      </span>
    </>
  );
}
