import Link, { type LinkProps } from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type BackButtonProps = Omit<ButtonProps, "asChild" | "children"> & {
  href: LinkProps["href"];
  children?: ReactNode;
};

export function BackButton({
  href,
  children = "Voltar",
  variant = "outline",
  ...props
}: BackButtonProps) {
  return (
    <Button asChild variant={variant} {...props}>
      <Link href={href}>
        <ArrowLeft aria-hidden className="size-4" />
        {children}
      </Link>
    </Button>
  );
}
