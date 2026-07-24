import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QuoteApprovalVehiclePlateStep } from "./quote-approval-vehicle-plate-step";

function renderStep({
  initialPlate = "abc-1d23",
  onSubmit = vi.fn(),
  onBack = vi.fn(),
}: {
  initialPlate?: string | null;
  onSubmit?: (plate: string) => void;
  onBack?: () => void;
} = {}) {
  render(
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <QuoteApprovalVehiclePlateStep
          initialPlate={initialPlate}
          onSubmit={onSubmit}
          onBack={onBack}
        />
      </DialogContent>
    </Dialog>,
  );

  return { onSubmit, onBack };
}

describe("QuoteApprovalVehiclePlateStep", () => {
  it("renders the initial plate normalized", () => {
    renderStep();

    expect(screen.getByRole("heading", { name: "Editar placa" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Placa do ve.culo/i })).toHaveValue("ABC1D23");
    expect(screen.getByText("7/7")).toBeInTheDocument();
  });

  it("normalizes and submits a valid plate", () => {
    const onSubmit = vi.fn();

    renderStep({ initialPlate: "", onSubmit });

    const input = screen.getByRole("textbox", { name: /Placa do ve.culo/i });
    fireEvent.change(input, { target: { value: "xyz-9876" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar placa" }));

    expect(input).toHaveValue("XYZ9876");
    expect(onSubmit).toHaveBeenCalledWith("XYZ9876");
  });

  it("keeps submit disabled until the plate has seven characters", () => {
    renderStep({ initialPlate: "" });

    expect(screen.getByRole("button", { name: "Salvar placa" })).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox", { name: /Placa do ve.culo/i }), {
      target: { value: "ABC1234" },
    });

    expect(screen.getByRole("button", { name: "Salvar placa" })).toBeEnabled();
  });

  it("returns to the resolution step from the footer action", () => {
    const onBack = vi.fn();

    renderStep({ onBack });

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(onBack).toHaveBeenCalled();
  });
});
