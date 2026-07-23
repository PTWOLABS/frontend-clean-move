import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  createEmptyQuoteApprovalResolutionValues,
  type QuoteApprovalResolutionValues,
} from "../../lib/quote-approval-resolution-helpers";
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

function renderStep({
  values = createEmptyQuoteApprovalResolutionValues(),
  onChange = vi.fn(),
  isApproving = false,
  onApprove = vi.fn(),
  onBack = vi.fn(),
}: {
  values?: QuoteApprovalResolutionValues;
  onChange?: (values: QuoteApprovalResolutionValues) => void;
  isApproving?: boolean;
  onApprove?: () => void;
  onBack?: () => void;
} = {}) {
  return render(
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <QuoteApprovalResolutionStep
          analysis={requiresResolutionAnalysis}
          values={values}
          isApproving={isApproving}
          onChange={onChange}
          onApprove={onApprove}
          onBack={onBack}
        />
      </DialogContent>
    </Dialog>,
  );
}

describe("QuoteApprovalResolutionStep", () => {
  it("lists pending approval items with selectable actions", () => {
    renderStep();

    expect(screen.getByRole("heading", { name: "Resolver pendências" })).toBeInTheDocument();
    expect(screen.getByText("0 de 3 pendências com resolução selecionada")).toBeInTheDocument();
    expect(screen.getByText("Cliente com correspondências")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "vincular cliente existente" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "criar novo cliente" })).toBeEnabled();
    expect(screen.getByText("Veículo precisa ser definido")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "criar veículo pelos dados do orçamento" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "manter apenas os dados do orçamento" }),
    ).toBeEnabled();
    expect(screen.getByText("Serviço com correspondência: Polimento tecnico")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "associar serviço existente" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "renomear serviço avulso" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Confirmar aprovação" })).toBeDisabled();
  });

  it("emits typed resolution values when selecting an action", () => {
    const onChange = vi.fn();

    renderStep({ onChange });

    fireEvent.click(screen.getByRole("button", { name: "criar novo cliente" }));

    expect(onChange).toHaveBeenCalledWith({
      serviceResolutions: [],
      customerResolution: {
        action: "CREATE_NEW",
      },
    });
  });

  it("marks already selected resolution actions", () => {
    renderStep({
      values: {
        serviceResolutions: [],
        customerResolution: {
          action: "CREATE_NEW",
        },
      },
    });

    expect(screen.getByRole("button", { name: "criar novo cliente" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("enables final approval when all pending items have selected resolutions", () => {
    const onApprove = vi.fn();

    renderStep({
      values: {
        customerResolution: {
          action: "CREATE_NEW",
        },
        vehicleResolution: {
          action: "CREATE_FROM_SNAPSHOT",
        },
        serviceResolutions: [
          {
            quoteServiceId: "quote-service-id",
            action: "ASSOCIATE_EXISTING",
            serviceId: "candidate-service-id",
          },
        ],
      },
      onApprove,
    });

    fireEvent.click(screen.getByRole("button", { name: "Confirmar aprovação" }));

    expect(onApprove).toHaveBeenCalled();
  });

  it("disables final approval while approval is pending", () => {
    renderStep({
      values: {
        customerResolution: {
          action: "CREATE_NEW",
        },
        vehicleResolution: {
          action: "CREATE_FROM_SNAPSHOT",
        },
        serviceResolutions: [
          {
            quoteServiceId: "quote-service-id",
            action: "ASSOCIATE_EXISTING",
            serviceId: "candidate-service-id",
          },
        ],
      },
      isApproving: true,
    });

    expect(screen.getByRole("button", { name: "Aprovando" })).toBeDisabled();
  });

  it("returns to the analysis step from the footer action", () => {
    const onBack = vi.fn();

    renderStep({ onBack });

    fireEvent.click(screen.getByRole("button", { name: "Voltar à análise" }));

    expect(onBack).toHaveBeenCalled();
  });
});
