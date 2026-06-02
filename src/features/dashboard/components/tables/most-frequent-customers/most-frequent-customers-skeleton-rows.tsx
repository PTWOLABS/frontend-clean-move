import { Skeleton } from "@/components/ui/skeleton";

const mostFrequentCustomerSkeletonRows = ["first", "second", "third", "fourth", "fifth"];

export function MostFrequentCustomersSkeletonRows() {
  return (
    <ul className="divide-y divide-border" aria-label="Carregando clientes que mais frequentam">
      {mostFrequentCustomerSkeletonRows.map((row) => (
        <li key={`most-frequent-customers-${row}`} className="flex items-center gap-3 py-3">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="shrink-0 space-y-2">
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="ml-auto h-3 w-24" />
          </div>
        </li>
      ))}
    </ul>
  );
}
