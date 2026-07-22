import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { QuoteListItemDto } from "../../types/quotes";

const analyzeQuoteApprovalMock = vi.fn();
const resetAnalyzeQuoteApprovalMock = vi.fn();

let isAnalyzing = false;

vi.mock("../../hooks/mutations/use-analyze-quote-approval", () => ({
  useAnalyzeQuoteApproval: () => ({
    mutate: analyzeQuoteApprovalMock,
    data: null,
    isPending: isAnalyzing,
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

import { QuoteApprovalFlowDialog } from "./quote-approval-flow-dialog";

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

describe("QuoteApprovalFlowDialog", () => {
  beforeEach(() => {
    isAnalyzing = false;
    analyzeQuoteApprovalMock.mockReset();
    resetAnalyzeQuoteApprovalMock.mockReset();
  });

  it("keeps the same dialog while moving from schedule to analysis", () => {
    analyzeQuoteApprovalMock.mockImplementationOnce(() => {
      isAnalyzing = true;
    });

    render(<QuoteApprovalFlowDialog quote={quote} open onOpenChange={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Aprovar e agendar" })).toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Selecione data e horário" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByRole("heading", { name: "Verificando orçamento" })).toBeInTheDocument();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it("blocks closing while the analysis is pending", () => {
    const onOpenChange = vi.fn();
    analyzeQuoteApprovalMock.mockImplementationOnce(() => {
      isAnalyzing = true;
    });

    render(<QuoteApprovalFlowDialog quote={quote} open onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Selecione data e horário" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("resets the analysis mutation when cancelling the flow", () => {
    const onOpenChange = vi.fn();

    render(<QuoteApprovalFlowDialog quote={quote} open onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(resetAnalyzeQuoteApprovalMock).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
