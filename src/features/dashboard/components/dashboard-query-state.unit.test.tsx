import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DashboardPanelSkeleton, DashboardQueryErrorState } from "./dashboard-query-state";

describe("DashboardQueryErrorState", () => {
  it("renders the retry action only when a retry handler is provided", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <DashboardQueryErrorState
        title="Falha ao carregar a visão geral."
        description="Tente novamente em alguns instantes."
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Falha ao carregar a visão geral.")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente em alguns instantes.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render the retry action when retry is unavailable", () => {
    render(
      <DashboardQueryErrorState
        title="Estabelecimento não encontrado."
        description="Não encontramos um perfil de estabelecimento vinculado à sua conta."
      />,
    );

    expect(screen.queryByRole("button", { name: /tentar novamente/i })).not.toBeInTheDocument();
  });
});

describe("DashboardPanelSkeleton", () => {
  it("preserves the panel heading, action and loading content", () => {
    render(
      <DashboardPanelSkeleton
        title="Receita e agendamentos ao longo do tempo"
        action={<button type="button">Período atual</button>}
      >
        <div>Conteúdo de loading</div>
      </DashboardPanelSkeleton>,
    );

    expect(
      screen.getByRole("heading", {
        name: /receita e agendamentos ao longo do tempo/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /período atual/i })).toBeInTheDocument();
    expect(screen.getByText("Conteúdo de loading")).toBeInTheDocument();
  });
});
