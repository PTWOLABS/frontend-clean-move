"use client";

import { useServicos } from "../hooks/use-servicos";

export function ServicosList() {
  const { data, isLoading, isError } = useServicos();
  const services = Array.isArray(data) ? data : [];

  if (isLoading) {
    return <p>Carregando serviços...</p>;
  }

  if (isError || !services.length) {
    return <p>Nenhum serviço encontrado.</p>;
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {services.map((servico) => (
        <li key={servico.id} className="space-y-1 rounded-lg border p-4">
          <h3 className="font-semibold">{servico.titulo}</h3>
          {servico.descricao ? (
            <p className="text-sm text-muted-foreground">{servico.descricao}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
