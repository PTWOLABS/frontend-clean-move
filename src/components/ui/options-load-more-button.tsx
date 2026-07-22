"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

type OptionsLoadMoreButtonProps = {
  onLoadMore: () => void;
  isLoadingMore?: boolean;
  className?: string;
};

export function OptionsLoadMoreButton({
  onLoadMore,
  isLoadingMore = false,
  className,
}: OptionsLoadMoreButtonProps) {
  return (
    <div className={cn("border-t border-border/60 p-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-full text-muted-foreground"
        disabled={isLoadingMore}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onLoadMore();
        }}
      >
        {isLoadingMore ? "A carregar…" : "Carregar mais"}
      </Button>
    </div>
  );
}
