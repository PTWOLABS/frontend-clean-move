import { describe, expect, it } from "vitest";

import type { QuoteApprovalAnalysisDto } from "../types/analyze-quote-approval";
import {
  formatQuoteApprovalAnalysisCount,
  formatQuoteApprovalAnalysisList,
  getQuoteApprovalAnalysisIssues,
  getQuoteApprovalVerificationOutcome,
  getQuoteApprovalVerificationSteps,
} from "./quote-approval-analysis-feedback";

const readyAnalysis: QuoteApprovalAnalysisDto = {
  status: "READY",
  automaticResolutions: [],
  customer: {
    status: "RESOLVED",
    requiresResolution: false,
    automaticCustomerId: "customer-id",
    candidates: [],
  },
  vehicle: {
    status: "NONE",
    requiresResolution: false,
    candidateVehicleId: null,
    candidateCustomerId: null,
    allowedActions: [],
  },
  services: [
    {
      quoteServiceId: "quote-service-id",
      status: "RESOLVED",
      requiresResolution: false,
      serviceId: "service-id",
      candidateServiceId: "service-id",
      snapshot: {
        name: "Polimento tecnico",
        priceInCents: 5000,
        durationInMinutes: 60,
        categoryId: null,
        categoryName: null,
        isCourtesy: false,
      },
      candidate: null,
      differences: [],
      allowedActions: [],
    },
  ],
};

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

describe("quote approval analysis feedback", () => {
  it("formats lists and counts for user-facing messages", () => {
    expect(formatQuoteApprovalAnalysisList([])).toBe("");
    expect(formatQuoteApprovalAnalysisList(["nome"])).toBe("nome");
    expect(formatQuoteApprovalAnalysisList(["telefone", "e-mail"])).toBe("telefone e e-mail");
    expect(formatQuoteApprovalAnalysisList(["nome", "telefone", "e-mail"])).toBe(
      "nome, telefone e e-mail",
    );
    expect(formatQuoteApprovalAnalysisCount(1, "pendência", "pendências")).toBe("1 pendência");
    expect(formatQuoteApprovalAnalysisCount(2, "pendência", "pendências")).toBe("2 pendências");
  });

  it("resolves the verification outcome from the mutation state and response", () => {
    expect(getQuoteApprovalVerificationOutcome(true, null)).toBe("checking");
    expect(getQuoteApprovalVerificationOutcome(false, null)).toBe("checking");
    expect(getQuoteApprovalVerificationOutcome(false, readyAnalysis)).toBe("ready");
    expect(getQuoteApprovalVerificationOutcome(false, requiresResolutionAnalysis)).toBe(
      "requires-resolution",
    );
  });

  it("builds pending steps while the analysis is running", () => {
    expect(getQuoteApprovalVerificationSteps(null, true)).toMatchObject([
      { label: "Analisando cliente", status: "running" },
      { label: "Analisando veículo", status: "pending" },
      { label: "Analisando serviços", status: "pending" },
      { label: "Resultado da análise", status: "pending" },
    ]);
  });

  it("marks ready analysis steps as complete", () => {
    expect(getQuoteApprovalVerificationSteps(readyAnalysis, false)).toMatchObject([
      { label: "Cliente analisado", status: "complete" },
      { label: "Veículo analisado", status: "complete" },
      { label: "Serviços analisados", status: "complete" },
      { label: "Resultado da análise", status: "complete" },
    ]);
  });

  it("builds issues from customer, vehicle and service resolution requirements", () => {
    expect(getQuoteApprovalAnalysisIssues(requiresResolutionAnalysis)).toEqual([
      {
        id: "customer",
        area: "Cliente",
        title: "Cliente com correspondências",
        description:
          "Encontramos 1 possível cliente. Correspondências por telefone e e-mail. Campos conflitantes: nome.",
      },
      {
        id: "vehicle",
        area: "Veículo",
        title: "Veículo precisa ser definido",
        description:
          "O orçamento possui apenas dados avulsos do veículo. Ações disponíveis: criar veículo pelos dados do orçamento e manter apenas os dados do orçamento.",
      },
      {
        id: "service-quote-service-id",
        area: "Serviço",
        title: "Serviço com correspondência: Polimento tecnico",
        description:
          "Candidato encontrado: Polimento tecnico. Diferenças: preço. Ações disponíveis: associar serviço existente e renomear serviço avulso.",
      },
    ]);
  });
});
