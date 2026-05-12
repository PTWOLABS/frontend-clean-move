"use client";

import { useRouter } from "next/navigation";
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
    return (
      <div
        className="flex min-h-[50vh] w-full flex-col gap-4 p-6"
        aria-busy="true"
        aria-label="A carregar sessão"
      >
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full max-w-xl" />
        <Skeleton className="h-8 w-3/4 max-w-md" />
      </div>
    );
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
