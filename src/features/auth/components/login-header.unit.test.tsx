import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

import { LoginHeader } from "./login-header";

describe("LoginHeader", () => {
  it("should render the page title and description", () => {
    render(<LoginHeader />);

    expect(
      screen.getByRole("heading", { name: /bem-vindo de volta/i, level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/acesse sua conta para gerenciar seu negócio com eficiência\./i),
    ).toBeInTheDocument();
  });

  it("should render the cleanmove brand", () => {
    render(<LoginHeader />);

    expect(screen.getByText("Clean")).toBeInTheDocument();
    expect(screen.getByText("Move")).toBeInTheDocument();
  });
});
