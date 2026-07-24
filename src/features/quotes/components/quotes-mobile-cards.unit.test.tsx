import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { QuoteListItemDto } from "../types/quotes";

const listQuotesMock = vi.fn();
const analyzeQuoteApprovalMock = vi.fn();
const resetAnalyzeQuoteApprovalMock = vi.fn();

vi.mock("../hooks/queries/use-list-quotes", () => ({
  useListQuotes: (...args: unknown[]) => listQuotesMock(...args),
}));

vi.mock("../hooks/mutations/use-analyze-quote-approval", () => ({
  useAnalyzeQuoteApproval: () => ({
    mutate: analyzeQuoteApprovalMock,
    data: null,
    isPending: false,
    reset: resetAnalyzeQuoteApprovalMock,
  }),
}));

vi.mock("@/components/ui/calendar/date-picker-time", () => ({
  DatePickerTime: ({
    onChange,
    placeholder,
  }: {
    onChange?: (value: Date | null) => void;
    placeholder?: string;
  }) => (
    <button type="button" onClick={() => onChange?.(new Date("2026-08-01T10:00:00.000Z"))}>
      {placeholder}
    </button>
  ),
}));

import { QuotesCatalogContent } from "./quotes-mobile-cards";

const quote: QuoteListItemDto = {
  id: "quote-id",
  customerName: "Marina Oliveira",
  customerKind: "CUSTOMER",
  vehicleLabel: "Honda Civic",
  vehiclePlate: "ABC1D23",
  totalInCents: 125000,
  status: "VALID",
  expiresAt: "2026-07-30T12:00:00.000Z",
  createdAt: "2026-07-17T12:00:00.000Z",
  approvedAt: null,
  servicesCount: 2,
};

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderQuotesCatalogContent() {
  const client = createQueryClient();

  return render(
    <QueryClientProvider client={client}>
      <QuotesCatalogContent />
    </QueryClientProvider>,
  );
}

describe("QuotesCatalogContent approval flow", () => {
  beforeEach(() => {
    listQuotesMock.mockReset();
    analyzeQuoteApprovalMock.mockReset();
    resetAnalyzeQuoteApprovalMock.mockReset();
  });

  it("opens the schedule dialog before analyzing and sends the selected date to analysis", async () => {
    listQuotesMock.mockReturnValue({
      data: {
        quotes: [quote],
        totalItems: 1,
        summary: {
          valid: 1,
          expiresToday: 0,
          approved: 0,
          expired: 0,
        },
      },
      error: null,
      isError: false,
      isPending: false,
      isPlaceholderData: false,
    });

    renderQuotesCatalogContent();

    fireEvent.click(screen.getAllByRole("button", { name: "Aprovar orçamento" })[0]);

    expect(screen.getByRole("heading", { name: "Aprovar e agendar" })).toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(analyzeQuoteApprovalMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Selecione data e horário" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() =>
      expect(analyzeQuoteApprovalMock).toHaveBeenCalledWith(
        {
          quoteId: "quote-id",
          startsAt: "2026-08-01T10:00:00.000Z",
          endsAt: null,
        },
        expect.objectContaining({
          onError: expect.any(Function),
        }),
      ),
    );

    expect(
      screen.getByRole("heading", {
        name: "Verificando orçamento",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });
});
