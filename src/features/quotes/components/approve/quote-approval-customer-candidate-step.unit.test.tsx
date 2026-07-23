import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { QuoteCustomerCandidateDto } from "../../types/analyze-quote-approval";
import { QuoteApprovalCustomerCandidateStep } from "./quote-approval-customer-candidate-step";

const candidates: QuoteCustomerCandidateDto[] = [
  {
    customerId: "first-candidate-customer-id",
    matchedBy: ["PHONE", "EMAIL"],
    conflictingFields: ["NAME"],
    advisoryOnly: false,
  },
  {
    customerId: "second-candidate-customer-id",
    matchedBy: ["CPF_CNPJ"],
    conflictingFields: [],
    advisoryOnly: true,
  },
];

function renderStep({
  selectedCustomerId,
  onSelect = vi.fn(),
  onBack = vi.fn(),
}: {
  selectedCustomerId?: string;
  onSelect?: (customerId: string) => void;
  onBack?: () => void;
} = {}) {
  render(
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <QuoteApprovalCustomerCandidateStep
          candidates={candidates}
          selectedCustomerId={selectedCustomerId}
          onSelect={onSelect}
          onBack={onBack}
        />
      </DialogContent>
    </Dialog>,
  );
}

describe("QuoteApprovalCustomerCandidateStep", () => {
  it("lists customer candidates with match and conflict details", () => {
    renderStep();

    expect(screen.getByRole("heading", { name: "Escolher cliente" })).toBeInTheDocument();
    expect(screen.getByText("2 clientes candidatos encontrados")).toBeInTheDocument();
    expect(screen.getByText("first-candidate-customer-id")).toBeInTheDocument();
    expect(screen.getByText("Correspondências por telefone e e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Campos conflitantes: nome.")).toBeInTheDocument();
    expect(screen.getByText("second-candidate-customer-id")).toBeInTheDocument();
    expect(screen.getByText("Apenas alerta")).toBeInTheDocument();
  });

  it("marks the selected customer candidate", () => {
    renderStep({ selectedCustomerId: "first-candidate-customer-id" });

    expect(screen.getByRole("button", { name: "Selecionar cliente candidato 1" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Selecionar cliente candidato 2" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("emits the selected customer id", () => {
    const onSelect = vi.fn();

    renderStep({ onSelect });

    fireEvent.click(screen.getByRole("button", { name: "Selecionar cliente candidato 2" }));

    expect(onSelect).toHaveBeenCalledWith("second-candidate-customer-id");
  });

  it("returns to the resolution step", () => {
    const onBack = vi.fn();

    renderStep({ onBack });

    fireEvent.click(screen.getByRole("button", { name: "Voltar às pendências" }));

    expect(onBack).toHaveBeenCalled();
  });
});
