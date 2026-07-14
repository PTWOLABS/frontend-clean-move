"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dropzone,
  DropzoneDescription,
  DropzoneGroup,
  DropzoneInput,
  DropzoneTitle,
  DropzoneUploadIcon,
  DropzoneZone,
} from "@/components/ui/dropzone";
import {
  FileList,
  FileListAction,
  FileListActions,
  FileListDescription,
  FileListDescriptionSeparator,
  FileListDescriptionText,
  FileListHeader,
  FileListIcon,
  FileListInfo,
  FileListItem,
  FileListName,
  FileListSize,
} from "@/components/ui/file-list";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils/cn";

import {
  APPEARANCE_UPLOAD_CONFIG,
  type AppearanceUploadVariant,
} from "../lib/settings-appearance-config";
import {
  getImageRejectionMessage,
  IMAGE_ACCEPT,
  IMAGE_MAX_SIZE_BYTES,
} from "../lib/validate-image-file";
import { validateBannerFile } from "../schemas/appearance-settings-schema";
import { SettingsAppearancePreview } from "./settings-appearance-preview";

export type SettingsAppearanceUploadController = {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  save: () => Promise<boolean>;
  discard: () => void;
};

type SettingsAppearanceUploadSectionProps = {
  variant: AppearanceUploadVariant;
  existingImageUrl: string | null;
  disabled?: boolean;
  disabledMessage?: string;
  isPending?: boolean;
  isRemovePending?: boolean;
  onRemoveExisting?: () => void;
  onSaveFile: (file: File, options?: { onSuccess?: () => void; onError?: () => void }) => void;
  onControllerChange?: (controller: SettingsAppearanceUploadController | null) => void;
};

export function SettingsAppearanceUploadSection({
  variant,
  existingImageUrl,
  disabled = false,
  disabledMessage = "Não foi possível enviar a imagem no momento.",
  isPending = false,
  isRemovePending = false,
  onRemoveExisting,
  onSaveFile,
  onControllerChange,
}: SettingsAppearanceUploadSectionProps) {
  const config = APPEARANCE_UPLOAD_CONFIG[variant];
  const HeaderIcon = config.headerIcon;

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const hasPendingUpload = pendingFile !== null;

  const previewImageUrl = useMemo(
    () => localPreviewUrl ?? existingImageUrl,
    [existingImageUrl, localPreviewUrl],
  );

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleDropAccepted = useCallback((files: readonly File[]) => {
    const file = files[0];
    if (!file) return;

    const error = validateBannerFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setPendingFile(file);
    setLocalPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
  }, []);

  const clearPendingFile = useCallback(() => {
    setPendingFile(null);
    setLocalPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
  }, []);

  const savePendingFile = useCallback(() => {
    if (!pendingFile) {
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      onSaveFile(pendingFile, {
        onSuccess: () => {
          clearPendingFile();
          resolve(true);
        },
        onError: () => resolve(false),
      });
    });
  }, [clearPendingFile, onSaveFile, pendingFile]);

  const savePendingFileRef = useRef(savePendingFile);
  savePendingFileRef.current = savePendingFile;
  const clearPendingFileRef = useRef(clearPendingFile);
  clearPendingFileRef.current = clearPendingFile;

  useEffect(() => {
    if (!onControllerChange) {
      return;
    }

    if (disabled) {
      onControllerChange(null);
      return;
    }

    onControllerChange({
      hasUnsavedChanges: hasPendingUpload,
      isSaving: isPending,
      save: () => savePendingFileRef.current(),
      discard: () => clearPendingFileRef.current(),
    });
  }, [disabled, hasPendingUpload, isPending, onControllerChange]);

  useEffect(() => {
    return () => onControllerChange?.(null);
  }, [onControllerChange]);

  const handleSave = () => {
    if (!pendingFile) {
      toast.info("Nenhuma alteração para salvar.");
      return;
    }

    void savePendingFile();
  };

  if (disabled) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <HeaderIcon aria-hidden className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold leading-none tracking-tight text-foreground">
                {config.title}
              </h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <p className="mt-6 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {disabledMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <HeaderIcon aria-hidden className="size-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold leading-none tracking-tight text-foreground">
                  {config.title}
                </h3>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            </div>

            <Dropzone
              accept={IMAGE_ACCEPT}
              maxSize={IMAGE_MAX_SIZE_BYTES}
              maxFiles={1}
              disabled={isPending || isRemovePending}
              onDropAccepted={handleDropAccepted}
              onDropRejected={(rejections) => {
                const code = rejections[0]?.errors[0]?.code ?? "unknown";
                setValidationError(getImageRejectionMessage(code));
              }}
            >
              <DropzoneZone className="min-h-40 w-full">
                <DropzoneInput />
                <DropzoneGroup className="w-full gap-3 px-3 py-6">
                  <DropzoneUploadIcon className="size-8 shrink-0 text-primary" />
                  <DropzoneGroup className="w-full min-w-0 gap-1">
                    <DropzoneTitle className="text-center text-sm text-balance">
                      {pendingFile
                        ? "Arraste ou clique para substituir a imagem"
                        : "Arraste uma imagem ou clique para selecionar"}
                    </DropzoneTitle>
                    <DropzoneDescription className="text-center text-balance">
                      PNG, JPG, JPEG ou WEBP — máximo 5 MB.
                    </DropzoneDescription>
                  </DropzoneGroup>
                </DropzoneGroup>
              </DropzoneZone>
            </Dropzone>

            {validationError ? (
              <p className="text-sm text-destructive" role="alert">
                {validationError}
              </p>
            ) : null}

            <FileList className="gap-0">
              <FileListItem className="gap-0 rounded-lg p-2.5 shadow-none">
                <FileListHeader className="gap-2.5">
                  <FileListIcon className="size-8 rounded-md [&>svg:not([class*='size-'])]:size-4" />
                  <FileListInfo className="min-w-0 gap-0.5">
                    {pendingFile ? (
                      <>
                        <FileListName className="truncate text-xs">{pendingFile.name}</FileListName>
                        <FileListDescription>
                          <FileListSize>{pendingFile.size}</FileListSize>
                          {isPending ? (
                            <>
                              <FileListDescriptionSeparator />
                              <FileListDescriptionText>Enviando...</FileListDescriptionText>
                            </>
                          ) : null}
                        </FileListDescription>
                      </>
                    ) : (
                      <>
                        <FileListName className="text-xs text-muted-foreground">
                          Nenhum arquivo selecionado
                        </FileListName>
                        <FileListDescription>
                          <FileListDescriptionText>{config.recommendation}</FileListDescriptionText>
                        </FileListDescription>
                      </>
                    )}
                  </FileListInfo>
                  {pendingFile ? (
                    <FileListActions>
                      <FileListAction
                        type="button"
                        onClick={clearPendingFile}
                        disabled={isPending || isRemovePending}
                        className="size-6 shrink-0 [&_svg:not([class*='size-'])]:size-3"
                        aria-label="Remover arquivo"
                      >
                        <X aria-hidden className="size-3" />
                        <span className="sr-only">Remover</span>
                      </FileListAction>
                    </FileListActions>
                  ) : null}
                </FileListHeader>
              </FileListItem>
            </FileList>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={!hasPendingUpload || isPending || isRemovePending}
                className="w-full sm:w-auto"
                onClick={clearPendingFile}
              >
                Descartar alterações
              </Button>
              <Button
                type="button"
                disabled={!hasPendingUpload || isPending || isRemovePending}
                className="w-full gap-2 sm:w-auto"
                onClick={handleSave}
              >
                <Save aria-hidden className="size-4" />
                {isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>

          <div
            className={cn("flex min-h-0 flex-col", variant === "banner" && "lg:h-full lg:flex-1")}
          >
            <Separator className="mb-6 lg:hidden" />
            <SettingsAppearancePreview
              variant={variant}
              imageUrl={previewImageUrl}
              headline={config.previewHeadline}
              subtext={config.previewSubtext}
              className={variant === "banner" ? "flex flex-1 flex-col min-h-0" : undefined}
              canRemove={existingImageUrl !== null}
              onRemove={onRemoveExisting}
              isRemovePending={isRemovePending}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
