import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AnalyzeQuoteApprovalResponseDto } from "../../types/analyze-quote-approval";
import type { QuoteListItemDto } from "../../types/quotes";

const analyzeQuoteApprovalMock = vi.fn();
const resetAnalyzeQuoteApprovalMock = vi.fn();
const approveQuoteMock = vi.fn();
const resetApproveQuoteMock = vi.fn();

let isAnalyzing = false;
let isApproving = false;
let analyzeQuoteApprovalData: AnalyzeQuoteApprovalResponseDto | null = null;

vi.mock("../../hooks/mutations/use-analyze-quote-approval", () => ({
  useAnalyzeQuoteApproval: () => ({
    mutate: analyzeQuoteApprovalMock,
    data: analyzeQuoteApprovalData,
    isPending: isAnalyzing,
    reset: resetAnalyzeQuoteApprovalMock,
  }),
}));

vi.mock("../../hooks/mutations/use-approve-quote", () => ({
  useApproveQuote: () => ({
    mutate: approveQuoteMock,
    isPending: isApproving,
    reset: resetApproveQuoteMock,
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

const readyAnalyzeQuoteApprovalData: AnalyzeQuoteApprovalResponseDto = {
  analysis: {
    status: "READY",
    automaticResolutions: [],
    customer: {
      status: "RESOLVED",
      requiresResolution: false,
      automaticCustomerId: null,
      candidates: [],
    },
    vehicle: {
      status: "NONE",
      requiresResolution: false,
      candidateVehicleId: null,
      candidateCustomerId: null,
      allowedActions: [],
    },
    services: [],
  },
};

const requiresResolutionAnalyzeQuoteApprovalData: AnalyzeQuoteApprovalResponseDto = {
  analysis: {
    status: "REQUIRES_RESOLUTION",
    automaticResolutions: [],
    customer: {
      status: "CREATE_REQUIRED",
      requiresResolution: true,
      automaticCustomerId: null,
      candidates: [],
    },
    vehicle: {
      status: "NONE",
      requiresResolution: false,
      candidateVehicleId: null,
      candidateCustomerId: null,
      allowedActions: [],
    },
    services: [],
  },
};

describe("QuoteApprovalFlowDialog", () => {
  beforeEach(() => {
    isAnalyzing = false;
    isApproving = false;
    analyzeQuoteApprovalData = null;
    analyzeQuoteApprovalMock.mockReset();
    resetAnalyzeQuoteApprovalMock.mockReset();
    approveQuoteMock.mockReset();
    resetApproveQuoteMock.mockReset();
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

  it("approves the quote with the schedule selected before the analysis", () => {
    analyzeQuoteApprovalData = readyAnalyzeQuoteApprovalData;

    render(<QuoteApprovalFlowDialog quote={quote} open onOpenChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Selecione data e horário" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar aprovação" }));

    expect(approveQuoteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        quoteId: "quote-id",
        startsAt: "2026-08-01T10:00:00.000Z",
        endsAt: null,
        serviceResolutions: [],
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("moves to the resolution step when approval issues need action", () => {
    const onOpenChange = vi.fn();
    analyzeQuoteApprovalData = requiresResolutionAnalyzeQuoteApprovalData;

    render(<QuoteApprovalFlowDialog quote={quote} open onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Selecione data e horário" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "Resolver pendências" }));

    expect(screen.getByRole("heading", { name: "Resolver pendências" })).toBeInTheDocument();
    expect(screen.getByText("0 de 1 pendência com resolução selecionada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "criar novo cliente" }));
    expect(screen.getByText("1 de 1 pendência com resolução selecionada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar aprovação" }));
    expect(approveQuoteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        quoteId: "quote-id",
        startsAt: "2026-08-01T10:00:00.000Z",
        endsAt: null,
        customerResolution: {
          action: "CREATE_NEW",
        },
        serviceResolutions: [],
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Voltar à análise" }));

    expect(
      screen.getByRole("heading", { name: "Pendências antes da aprovação" }),
    ).toBeInTheDocument();
  });
});
