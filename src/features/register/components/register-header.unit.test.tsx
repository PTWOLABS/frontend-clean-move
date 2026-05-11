import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

import { RegisterHeader } from "./register-header";

describe("RegisterHeader", () => {
  it("should render the title and description from props", () => {
    render(<RegisterHeader title="Crie sua conta" description="Comece agora" />);

    expect(screen.getByRole("heading", { name: "Crie sua conta", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Comece agora")).toBeInTheDocument();
  });

  it("should update the title when props change", () => {
    const { rerender } = render(
      <RegisterHeader title="Crie sua conta" description="Comece agora" />,
    );

    rerender(<RegisterHeader title="Endereço da empresa" description="Quase lá" />);

    expect(
      screen.getByRole("heading", { name: "Endereço da empresa", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Quase lá")).toBeInTheDocument();
  });
});
