import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../hooks/use-fetch-popular-services", () => ({
  useFetchPopularServices: vi.fn(),
}));

vi.mock("../hooks/use-dashboard-query-error-feedback", () => ({
  useDashboardQueryErrorFeedback: vi.fn(),
}));

import { useDashboardQueryErrorFeedback } from "../hooks/use-dashboard-query-error-feedback";
import { useFetchPopularServices } from "../hooks/use-fetch-popular-services";
import { PopularServicesCard } from "./popular-services-card";

function mockPopularServicesQuery(
  overrides: Partial<ReturnType<typeof useFetchPopularServices>> = {},
) {
  const refetch = vi.fn();

  vi.mocked(useFetchPopularServices).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    refetch,
    ...overrides,
  } as ReturnType<typeof useFetchPopularServices>);

  return refetch;
}

function mockErrorFeedback(feedback: ReturnType<typeof useDashboardQueryErrorFeedback> = null) {
  vi.mocked(useDashboardQueryErrorFeedback).mockReturnValue(feedback);
}

describe("PopularServicesCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPopularServicesQuery();
    mockErrorFeedback();
  });

  it("renders the fetched services, their percentages, and the total", () => {
    mockPopularServicesQuery({
      data: {
        totalServices: 315,
        popularServices: [
          {
            id: "full-wash",
            name: "Lavagem Completa",
            completedCount: 128,
            percent: 41,
          },
          {
            id: "interior-cleaning",
            name: "Higienização Interna",
            completedCount: 86,
            percent: 27,
          },
        ],
      },
    });

    render(<PopularServicesCard showMetrics />);

    expect(screen.getByRole("heading", { name: /serviços populares/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mais informações sobre serviços populares/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Lavagem Completa")).toBeInTheDocument();
    expect(screen.getByText("Higienização Interna")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/lavagem completa: 128 serviços, 41% do total/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Total de serviços")).toBeInTheDocument();
    expect(screen.getByText("315")).toBeInTheDocument();
  });

  it("renders an empty state and zero total when there are no services", () => {
    mockPopularServicesQuery({
      data: {
        totalServices: 0,
        popularServices: [],
      },
    });

    render(<PopularServicesCard showMetrics />);

    expect(screen.getByText("Nenhum serviço realizado no período.")).toBeInTheDocument();
    expect(screen.getByText("Total de serviços")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders loading skeletons while the first request is pending", () => {
    mockPopularServicesQuery({
      isLoading: true,
    });

    render(<PopularServicesCard showMetrics />);

    expect(screen.getByRole("heading", { name: /serviços populares/i })).toBeInTheDocument();
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(screen.queryByText("Nenhum serviço realizado no período.")).not.toBeInTheDocument();
  });

  it("renders an inline error state and retries when the first request fails", async () => {
    const user = userEvent.setup();
    const refetch = mockPopularServicesQuery({
      error: new Error("boom"),
    });

    mockErrorFeedback({
      title: "Falha ao carregar serviços populares.",
      description: "Tente novamente em alguns instantes.",
      statusCode: 500,
    });

    render(<PopularServicesCard showMetrics />);

    expect(screen.getByText("Falha ao carregar serviços populares.")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente em alguns instantes.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
