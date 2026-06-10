"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function AppearanceSectionSkeleton({ previewVariant }: { previewVariant: "profile" | "banner" }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-full max-w-sm" />
              </div>
            </div>
            <Skeleton className="min-h-[10rem] w-full rounded-lg" />
            <Skeleton className="h-4 w-full max-w-xs" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div
            className={
              previewVariant === "banner" ? "flex min-h-0 flex-col lg:h-full lg:flex-1" : undefined
            }
          >
            <Separator className="mb-6 lg:hidden" />
            {previewVariant === "profile" ? (
              <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-5 sm:p-6">
                <Skeleton className="h-4 w-16" />
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="size-32 shrink-0 rounded-full sm:size-40" />
                  <div className="space-y-2 text-center">
                    <Skeleton className="mx-auto h-4 w-36" />
                    <Skeleton className="mx-auto h-4 w-full max-w-[12rem]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-4 lg:h-full">
                <Skeleton className="h-4 w-16 shrink-0" />
                <Skeleton className="aspect-video w-full min-h-[10rem] rounded-lg lg:aspect-auto lg:min-h-0 lg:flex-1" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" aria-label="Carregando configurações">
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>

        <div className="inline-flex max-w-full gap-2 overflow-x-auto rounded-lg bg-muted p-1">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-40" />
          </CardFooter>
        </Card>

        <AppearanceSectionSkeleton previewVariant="profile" />
        <AppearanceSectionSkeleton previewVariant="banner" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  );
}
