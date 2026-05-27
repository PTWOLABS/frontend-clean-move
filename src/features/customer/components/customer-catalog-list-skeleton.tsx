"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type CustomerCatalogListSkeletonProps = {
  count?: number;
};

export function CustomerCatalogListSkeleton({ count = 10 }: CustomerCatalogListSkeletonProps) {
  const rows = Array.from({ length: count }, (_, i) => i);

  return (
    <div aria-busy="true" aria-live="polite" aria-label="A carregar lista de clientes">
      <div className="hidden rounded-lg border border-border md:block">
        <div className="flex border-b border-border px-4 py-2.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="ml-auto h-3 w-40 max-w-[50%] sm:ml-8" />
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
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((i) => (
          <Card key={`card-${i}`} className="overflow-hidden border-border shadow-sm">
            <CardContent className="space-y-3 p-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Separator />
              <div className="flex gap-2">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="size-9 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
