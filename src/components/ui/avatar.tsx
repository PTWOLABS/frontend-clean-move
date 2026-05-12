"use client";

import * as React from "react";

import { cn } from "@/shared/utils/cn";

const Avatar = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  ),
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, src, alt = "", ...props }, ref) => {
    if (!src) {
      return null;
    }

    return React.createElement("img", {
      ref,
      src,
      alt,
      className: cn("aspect-square size-full object-cover", className),
      ...props,
    });
  },
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarFallback, AvatarImage };
