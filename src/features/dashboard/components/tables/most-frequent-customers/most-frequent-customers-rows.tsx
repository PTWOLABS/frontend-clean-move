import { TopCustomer } from "@/features/dashboard/types/dashboard-sections";
import { HintTooltip } from "@/shared/components/hint-tooltip";
import { formatBrlFromCents } from "@/shared/money/format-brl-money";
import { formatNumber } from "@/shared/utils/lib";
import { MostFrequentCustomersRank } from "./most-frequent-customers-rank";

function getCustomerInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (!words.length) {
    return "--";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getVisitsLabel(count: number) {
  return `${formatNumber(count)} ${count === 1 ? "visita" : "visitas"}`;
}

export function MostFrequentCustomerRow({ customer }: { customer: TopCustomer }) {
  const customerName = customer.customerName.trim() || "Cliente não informado";

  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <MostFrequentCustomersRank position={customer.position} />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted font-semibold text-foreground shadow-sm">
          {getCustomerInitials(customerName)}
        </span>

        <div className="min-w-0">
          <HintTooltip label={customerName} className="max-w-72 break-words leading-5">
            <span className="block truncate font-medium text-foreground">{customerName}</span>
          </HintTooltip>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-semibold tabular-nums text-success">
          {getVisitsLabel(customer.completedAppointmentsCount)}
        </p>
        <p className="whitespace-nowrap text-sm text-muted-foreground">
          Total gasto: {formatBrlFromCents(customer.totalSpentInCents)}
        </p>
      </div>
    </li>
  );
}
