/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BrlMoneyInput } from "./brl-money-input";

describe("BrlMoneyInput", () => {
  it("formats valid digit input as BRL in real time", () => {
    const onChange = vi.fn();

    render(<BrlMoneyInput value="" onChange={onChange} aria-label="Preço" />);

    fireEvent.change(screen.getByLabelText("Preço"), { target: { value: "abc500" } });

    expect(onChange).toHaveBeenCalledWith("5,00");
  });

  it("forwards blur events", () => {
    const onBlur = vi.fn();

    render(<BrlMoneyInput value="12,34" onChange={vi.fn()} onBlur={onBlur} aria-label="Preço" />);

    fireEvent.blur(screen.getByLabelText("Preço"));

    expect(onBlur).toHaveBeenCalled();
  });
});
