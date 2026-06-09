"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useEstablishment } from "@/features/establishment/hooks/use-establishment";
import { useQueryFeedbackError } from "@/shared/hooks/use-query-feedback-error";
import type { User } from "@/features/user/types";

import { SettingsBusinessForm } from "./settings-business-form";

type SettingsBusinessTabProps = {
  user: User;
};

export function SettingsBusinessTab({ user }: SettingsBusinessTabProps) {
  const establishmentId = user.establishmentId;
  const { data: establishment, isLoading, error } = useEstablishment(establishmentId);

  const errorFeedback = useQueryFeedbackError({
    resourceKey: "establishment",
    resourceLabel: "os dados comerciais",
    error,
  });

  if (!establishmentId) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Estabelecimento não encontrado. Complete o cadastro comercial para gerenciar os dados do
        negócio.
      </p>
    );
  }

  if (isLoading && !establishment) {
    return (
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
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-40" />
        </CardFooter>
      </Card>
    );
  }

  if (error && !establishment) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {errorFeedback?.description ?? "Não foi possível carregar os dados comerciais."}
      </p>
    );
  }

  if (!establishment) {
    return null;
  }

  return <SettingsBusinessForm establishment={establishment} />;
}
