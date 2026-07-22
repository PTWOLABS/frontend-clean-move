import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { QuoteListItemDto } from "../../types/quotes";

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

import { QuoteApprovalScheduleStep } from "./quote-approval-schedule-step";

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

function renderStep(ui: React.ReactNode) {
  return render(
    <Dialog open>
      <DialogContent showCloseButton={false}>{ui}</DialogContent>
    </Dialog>,
  );
}

describe("QuoteApprovalScheduleStep", () => {
  it("presents the schedule step before approval analysis", () => {
    renderStep(<QuoteApprovalScheduleStep quote={quote} onCancel={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Aprovar e agendar" })).toBeInTheDocument();
    expect(screen.getByText("Marina Oliveira")).toBeInTheDocument();
    expect(screen.getByText("Honda Civic")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });

  it("emits the selected schedule when the start date is defined", () => {
    const onContinue = vi.fn();

    renderStep(
      <QuoteApprovalScheduleStep quote={quote} onCancel={vi.fn()} onContinue={onContinue} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Selecione data e horário" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onContinue).toHaveBeenCalledWith({
      startsAt: "2026-08-01T10:00:00.000Z",
      endsAt: null,
    });
  });

  it("allows cancelling the schedule step", () => {
    const onCancel = vi.fn();

    renderStep(<QuoteApprovalScheduleStep quote={quote} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
