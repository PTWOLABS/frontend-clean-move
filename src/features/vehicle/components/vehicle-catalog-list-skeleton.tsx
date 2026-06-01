"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type VehicleCatalogListSkeletonProps = {
  count?: number;
};

export function VehicleCatalogListSkeleton({ count = 10 }: VehicleCatalogListSkeletonProps) {
  const rows = Array.from({ length: count }, (_, i) => i);

  return (
    <div aria-busy="true" aria-live="polite" aria-label="A carregar lista de veículos">
      <div className="hidden rounded-lg border border-border md:block">
        <div className="flex border-b border-border px-4 py-2.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-24 max-w-[50%] sm:ml-8" />
        </div>
        {rows.map((i) => (
          <div
            key={`row-${i}`}
            className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 max-w-xs" />
              <Skeleton className="h-3 w-full max-w-lg" />
            </div>
            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((i) => (
          <Card key={`card-${i}`} className="overflow-hidden shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full max-w-xs" />
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <Skeleton className="size-9 shrink-0 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
