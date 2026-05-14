"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type ServiceCatalogListSkeletonProps = {
  /** Número de linhas / cards (alinhado ao `size` da API). */
  count?: number;
};

export function ServiceCatalogListSkeleton({ count = 5 }: ServiceCatalogListSkeletonProps) {
  const rows = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      className="space-y-0"
      aria-busy="true"
      aria-live="polite"
      aria-label="A carregar lista de serviços"
    >
      {/* Desktop: linhas estilo tabela */}
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
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 max-w-xs" />
              <Skeleton className="h-3 w-full max-w-lg" />
            </div>
            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((i) => (
          <Card key={`card-${i}`} className="overflow-hidden border-border shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex gap-3">
                <Skeleton className="size-12 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
