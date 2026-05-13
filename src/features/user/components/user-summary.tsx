"use client";

import { ApiError } from "@/shared/api/httpClient";

import { useCurrentUser } from "../hooks/use-current-user";

export function UserSummary() {
  const { data, isLoading, isError, error } = useCurrentUser();

  if (isLoading) {
    return <p>Carregando usuário...</p>;
  }

  if (isError || !data) {
    const isNotFound = error instanceof ApiError && error.statusCode === 404;
    return (
      <p>
        {isNotFound
          ? "Esta conta já não existe para a sessão atual. A redirecionar para o login…"
          : "Não foi possível carregar os dados do usuário."}
      </p>
    );
  }

  return (
    <div className="space-y-1 rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Bem-vindo, {data.name}</h2>
      <p className="text-sm text-muted-foreground">{data.email}</p>
    </div>
  );
}
