"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ServiceCategoryDto } from "../types";

type ServiceCategoryListItemProps = {
  category: ServiceCategoryDto;
  onRename: (category: ServiceCategoryDto) => void;
  onDelete: (category: ServiceCategoryDto) => void;
  isDeleting?: boolean;
};

export function ServiceCategoryListItem({
  category,
  onRename,
  onDelete,
  isDeleting = false,
}: ServiceCategoryListItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {category.name}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label={`Renomear categoria ${category.name}`}
          onClick={() => onRename(category)}
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          aria-label={`Apagar categoria ${category.name}`}
          disabled={isDeleting}
          onClick={() => onDelete(category)}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
