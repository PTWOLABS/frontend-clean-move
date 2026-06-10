"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, setAccessToken } from "@/shared/api/httpClient";

import { useAuthSession } from "../hooks/use-auth-session";
import { UnauthenticatedError } from "../lib/unauthenticated-error";

type Props = Readonly<{
  children: ReactNode;
}>;

export function PrivateAuthGate({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const authSession = useAuthSession();
  const { isPending, isError, error, isSuccess } = authSession;

  useEffect(() => {
    if (!isError || !error) return;
    if (error instanceof UnauthenticatedError) {
      setAccessToken(null);
      router.replace("/login");
    }
  }, [isError, error, router]);
  if (isPending) {
    return <PrivateShellSkeleton isOnboarding={pathname === "/onboarding"} />;
  }

  if (isError && error instanceof UnauthenticatedError) {
    return null;
  }

  if (isError) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Não foi possível validar a sessão. Tente novamente.";
    return (
      <div className="flex min-h-[40vh] flex-col items-start gap-4 p-6">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button type="button" variant="secondary" onClick={() => void authSession.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!isSuccess) {
    return null;
  }

  return children;
}

function PrivateShellSkeleton({ isOnboarding }: { isOnboarding: boolean }) {
  return (
    <div
      className="flex min-h-screen w-full bg-background"
      aria-busy="true"
      aria-label="Carregando sessão"
    >
      <aside className="hidden w-[16rem] shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-xl bg-sidebar-primary/20" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-28 bg-sidebar-primary/20" />
              <Skeleton className="h-3 w-24 bg-sidebar-primary/10" />
            </div>
            <Skeleton className="size-8 rounded-lg bg-sidebar-primary/10" />
          </div>
        </div>

        <div className="flex-1 space-y-7 px-3 py-4">
          <SidebarSkeletonGroup items={3} />
          <SidebarSkeletonGroup items={3} />
          <SidebarSkeletonGroup items={2} />
        </div>

        <div className="mt-auto border-t border-sidebar-border p-2">
          <div className="flex h-10 items-center justify-center gap-2 rounded-md px-2">
            <Skeleton className="size-4 rounded bg-sidebar-primary/20" />
            <Skeleton className="h-4 w-10 bg-sidebar-primary/15" />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-border bg-background/95">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:px-8">
            <div className="flex w-full min-w-0 items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-lg md:hidden" />

              <div className="hidden h-10 max-w-2xl flex-1 items-center gap-3 rounded-md border border-border bg-card px-3 shadow-xs md:flex">
                <Skeleton className="size-4 shrink-0 rounded bg-muted-foreground/20" />
                <Skeleton className="h-4 w-40 max-w-[60%]" />
                <Skeleton className="ml-auto h-5 w-12 rounded-md" />
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex h-10 min-w-0 items-center gap-2 rounded-xl px-2">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <div className="hidden min-w-0 space-y-1.5 lg:block">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="hidden size-4 rounded lg:block" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full px-4 py-6 md:px-8 md:py-8">
          {isOnboarding ? <OnboardingPageSkeleton /> : <PrivatePageSkeleton />}
        </main>
      </div>
    </div>
  );
}

function SidebarSkeletonGroup({ items }: { items: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="mx-2 h-3 w-20 bg-sidebar-primary/10" />
      {Array.from({ length: items }, (_, index) => (
        <div
          key={`sidebar-skeleton-group-${index}`}
          className="flex items-center gap-3 rounded-md px-2 py-2"
        >
          <Skeleton className="size-4 rounded bg-sidebar-primary/15" />
          <Skeleton className="h-4 w-full max-w-32 bg-sidebar-primary/15" />
        </div>
      ))}
    </div>
  );
}

function OnboardingPageSkeleton() {
  return (
    <div className="space-y-8">
      <header className="flex items-start gap-4">
        <Skeleton className="mt-1 size-9 shrink-0 rounded-lg" />
        <div className="w-full max-w-3xl space-y-3">
          <Skeleton className="h-9 w-4/5 max-w-xl" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
      </header>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-20 shrink-0" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-5 w-10 shrink-0" />
        </div>

        <div className="rounded-xl border border-border/70 bg-card/60 shadow-sm backdrop-blur-xl">
          <div className="space-y-3 border-b border-border/70 px-6 py-5">
            <Skeleton className="h-7 w-3/5 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>

          <div className="space-y-5 p-6">
            <OnboardingFieldSkeleton />
            <OnboardingFieldSkeleton />
            <OnboardingFieldSkeleton />

            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-full max-w-xl" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function OnboardingFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

function PrivatePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={`private-page-skeleton-${index}`} className="h-28 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
