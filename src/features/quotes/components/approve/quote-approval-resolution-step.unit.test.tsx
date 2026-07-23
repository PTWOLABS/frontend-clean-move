import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { QuoteApprovalAnalysisDto } from "../../types/analyze-quote-approval";
import { QuoteApprovalResolutionStep } from "./quote-approval-resolution-step";

const requiresResolutionAnalysis: QuoteApprovalAnalysisDto = {
  status: "REQUIRES_RESOLUTION",
  automaticResolutions: [],
  customer: {
    status: "CANDIDATES_FOUND",
    requiresResolution: true,
    automaticCustomerId: null,
    candidates: [
      {
        customerId: "candidate-customer-id",
        matchedBy: ["PHONE", "EMAIL"],
        conflictingFields: ["NAME"],
        advisoryOnly: false,
      },
    ],
  },
  vehicle: {
    status: "SNAPSHOT_ONLY",
    requiresResolution: true,
    candidateVehicleId: null,
    candidateCustomerId: null,
    allowedActions: ["CREATE_FROM_SNAPSHOT", "KEEP_SNAPSHOT_ONLY"],
  },
  services: [
    {
      quoteServiceId: "quote-service-id",
      status: "CANDIDATE_FOUND",
      requiresResolution: true,
      serviceId: null,
      candidateServiceId: "candidate-service-id",
      snapshot: {
        name: "Polimento tecnico",
        priceInCents: 6000,
        durationInMinutes: null,
        categoryId: null,
        categoryName: null,
        isCourtesy: false,
      },
      candidate: {
        serviceId: "candidate-service-id",
        name: "Polimento tecnico",
        isActive: true,
        priceSpecification: {
          type: "FIXED",
          fixedPriceInCents: 5000,
        },
        durationInMinutes: null,
        categoryId: null,
        categoryName: null,
      },
      differences: ["PRICE"],
      allowedActions: ["ASSOCIATE_EXISTING", "RENAME_DETACHED"],
    },
  ],
};

function renderStep(ui: React.ReactNode) {
  return render(
    <Dialog open>
      <DialogContent showCloseButton={false}>{ui}</DialogContent>
    </Dialog>,
  );
}

describe("QuoteApprovalResolutionStep", () => {
  it("lists pending approval items with their available actions", () => {
    renderStep(
      <QuoteApprovalResolutionStep analysis={requiresResolutionAnalysis} onBack={vi.fn()} />,
    );

    expect(screen.getByRole("heading", { name: "Resolver pendências" })).toBeInTheDocument();
    expect(screen.getByText("3 pendências precisam de resolução")).toBeInTheDocument();
    expect(screen.getByText("Cliente com correspondências")).toBeInTheDocument();
    expect(screen.getByText("vincular cliente existente")).toBeInTheDocument();
    expect(screen.getByText("criar novo cliente")).toBeInTheDocument();
    expect(screen.getByText("Veículo precisa ser definido")).toBeInTheDocument();
    expect(screen.getByText("criar veículo pelos dados do orçamento")).toBeInTheDocument();
    expect(screen.getByText("manter apenas os dados do orçamento")).toBeInTheDocument();
    expect(screen.getByText("Serviço com correspondência: Polimento tecnico")).toBeInTheDocument();
    expect(screen.getByText("associar serviço existente")).toBeInTheDocument();
    expect(screen.getByText("renomear serviço avulso")).toBeInTheDocument();
  });

  it("returns to the analysis step from the footer action", () => {
    const onBack = vi.fn();

    renderStep(
      <QuoteApprovalResolutionStep analysis={requiresResolutionAnalysis} onBack={onBack} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Voltar à análise" }));

    expect(onBack).toHaveBeenCalled();
  });
});
