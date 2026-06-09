import { Skeleton } from "@/components/ui/skeleton";

const mostFrequentCustomerSkeletonRows = ["first", "second", "third", "fourth", "fifth"];

export function MostFrequentCustomersSkeletonRows() {
  return (
    <ul className="divide-y divide-border" aria-label="Carregando clientes que mais frequentam">
      {mostFrequentCustomerSkeletonRows.map((row) => (
        <li
          key={`most-frequent-customers-${row}`}
          className="flex items-start gap-3 py-3 sm:items-center"
        >
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-32 max-w-full" />
              </div>
              <div className="shrink-0 space-y-2">
                <Skeleton className="h-4 w-16 sm:ml-auto" />
                <Skeleton className="h-3 w-24 sm:ml-auto" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
