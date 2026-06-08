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
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 sm:items-center">
      <MostFrequentCustomersRank position={customer.position} />

      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted font-semibold text-foreground shadow-sm">
          {getCustomerInitials(customerName)}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="min-w-0 sm:flex-1">
            <HintTooltip label={customerName} className="max-w-72 break-words leading-5">
              <span className="block truncate font-medium text-foreground max-w-[144px]">
                {customerName}
              </span>
            </HintTooltip>
          </div>

          <div className="shrink-0 text-left leading-tight sm:text-right">
            <p className="font-semibold tabular-nums text-success">
              {getVisitsLabel(customer.completedAppointmentsCount)}
            </p>
            <p className="text-sm text-muted-foreground sm:whitespace-nowrap">
              Total gasto: {formatBrlFromCents(customer.totalSpentInCents)}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
