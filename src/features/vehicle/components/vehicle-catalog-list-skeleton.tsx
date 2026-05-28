import { Skeleton } from "@/components/ui/skeleton";

export function VehicleCatalogListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="A carregar veículos">
      <Skeleton className="hidden h-48 w-full rounded-lg md:block" />
      <Skeleton className="h-32 w-full rounded-lg md:hidden" />
      <Skeleton className="h-32 w-full rounded-lg md:hidden" />
    </div>
  );
}
