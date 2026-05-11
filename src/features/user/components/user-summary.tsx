"use client";

import { useCurrentUser } from "../hooks/use-current-user";

export function UserSummary() {
  const { data, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return <p>Carregando usuário...</p>;
  }

  if (isError || !data) {
    return <p>Não foi possível carregar os dados do usuário.</p>;
  }

  return (
    <div className="space-y-1 rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Bem-vindo, {data.name}</h2>
      <p className="text-sm text-muted-foreground">{data.email}</p>
    </div>
  );
}
