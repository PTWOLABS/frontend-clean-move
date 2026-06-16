"use client";

import { ImageIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

import type { AppearanceUploadVariant } from "../lib/settings-appearance-config";

type SettingsAppearancePreviewProps = {
  variant: AppearanceUploadVariant;
  imageUrl: string | null;
  headline: string;
  subtext: string;
  className?: string;
  canRemove?: boolean;
  onRemove?: () => void;
  isRemovePending?: boolean;
};

type PreviewHeaderProps = {
  canRemove?: boolean;
  removeLabel: string;
  onRemove?: () => void;
  isRemovePending?: boolean;
};

function PreviewHeader({ canRemove, removeLabel, onRemove, isRemovePending }: PreviewHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-foreground">Prévia</p>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "size-8 shrink-0",
          canRemove &&
            "text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
        )}
        disabled={!canRemove || isRemovePending}
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <Trash2 aria-hidden className="size-4" />
        <span className="sr-only">{isRemovePending ? "Removendo..." : removeLabel}</span>
      </Button>
    </div>
  );
}

function ProfileAppearancePreview({
  imageUrl,
  headline,
  subtext,
  canRemove,
  onRemove,
  isRemovePending,
}: Omit<SettingsAppearancePreviewProps, "variant" | "className">) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-muted/30 p-5 sm:p-6">
      <PreviewHeader
        canRemove={canRemove}
        removeLabel="Remover foto de perfil"
        onRemove={onRemove}
        isRemovePending={isRemovePending}
      />

      <div className="mt-4 flex flex-1 flex-col items-center justify-center text-center">
        <div
          className={cn(
            "size-32 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted/30 shadow-sm ring-1 ring-border/50 sm:size-40",
          )}
        >
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- preview remoto ou blob local */
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : null}
        </div>

        <div className="mt-4 space-y-0.5">
          <p className="text-sm font-medium leading-snug text-foreground">{headline}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{subtext}</p>
        </div>
      </div>
    </div>
  );
}

const BANNER_PREVIEW_FRAME_CLASS =
  "relative w-full min-h-[10rem] overflow-hidden rounded-lg border border-border aspect-video lg:aspect-auto lg:min-h-0 lg:flex-1";

function BannerAppearancePreview({
  imageUrl,
  className,
  canRemove,
  onRemove,
  isRemovePending,
}: Pick<
  SettingsAppearancePreviewProps,
  "imageUrl" | "className" | "canRemove" | "onRemove" | "isRemovePending"
>) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-4 lg:h-full", className)}>
      <PreviewHeader
        canRemove={canRemove}
        removeLabel="Remover banner"
        onRemove={onRemove}
        isRemovePending={isRemovePending}
      />

      <div
        className={cn(
          BANNER_PREVIEW_FRAME_CLASS,
          imageUrl ? "border-solid bg-muted/30" : "border-dashed bg-muted/20",
        )}
      >
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element -- preview remoto ou blob local */
          <img src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <ImageIcon aria-hidden className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma imagem enviada. A prévia aparecerá aqui após selecionar um arquivo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SettingsAppearancePreview({
  variant,
  imageUrl,
  headline,
  subtext,
  className,
  canRemove,
  onRemove,
  isRemovePending,
}: SettingsAppearancePreviewProps) {
  if (variant === "profile") {
    return (
      <ProfileAppearancePreview
        imageUrl={imageUrl}
        headline={headline}
        subtext={subtext}
        canRemove={canRemove}
        onRemove={onRemove}
        isRemovePending={isRemovePending}
      />
    );
  }

  return (
    <BannerAppearancePreview
      imageUrl={imageUrl}
      className={className}
      canRemove={canRemove}
      onRemove={onRemove}
      isRemovePending={isRemovePending}
    />
  );
}
