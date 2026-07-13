"use client";

import { useCallback, useRef, useState } from "react";

import { useEstablishment } from "@/features/establishment/hooks/use-establishment";
import type { User } from "@/features/user/types";

import { useRegisterSettingsUnsavedChanges } from "../context/settings-unsaved-changes-context";
import { useDeleteEstablishmentBanner } from "../hooks/use-delete-establishment-banner";
import { useDeleteUserProfileImage } from "../hooks/use-delete-user-profile-image";
import { useUploadEstablishmentBanner } from "../hooks/use-upload-establishment-banner";
import { useUploadUserProfileImage } from "../hooks/use-upload-user-profile-image";
import { SettingsAppearanceTip } from "./settings-appearance-tip";
import {
  SettingsAppearanceUploadSection,
  type SettingsAppearanceUploadController,
} from "./settings-appearance-upload-section";

type SettingsAppearanceTabProps = {
  user: User;
  showBannerUpload: boolean;
};

export function SettingsAppearanceTab({ user, showBannerUpload }: SettingsAppearanceTabProps) {
  const { mutate: uploadProfile, isPending: isProfilePending } = useUploadUserProfileImage();
  const { mutate: uploadBanner, isPending: isBannerPending } = useUploadEstablishmentBanner();
  const { mutate: removeProfile, isPending: isProfileRemovePending } = useDeleteUserProfileImage();
  const { mutate: removeBanner, isPending: isBannerRemovePending } = useDeleteEstablishmentBanner();

  const establishmentId = user.establishmentId;
  const { data: establishment } = useEstablishment(showBannerUpload ? establishmentId : null);

  const profileControllerRef = useRef<SettingsAppearanceUploadController | null>(null);
  const bannerControllerRef = useRef<SettingsAppearanceUploadController | null>(null);

  const [profileDirty, setProfileDirty] = useState(false);
  const [bannerDirty, setBannerDirty] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);

  const handleProfileControllerChange = useCallback(
    (controller: SettingsAppearanceUploadController | null) => {
      profileControllerRef.current = controller;
      setProfileDirty(controller?.hasUnsavedChanges ?? false);
      setProfileSaving(controller?.isSaving ?? false);
    },
    [],
  );

  const handleBannerControllerChange = useCallback(
    (controller: SettingsAppearanceUploadController | null) => {
      bannerControllerRef.current = controller;
      setBannerDirty(controller?.hasUnsavedChanges ?? false);
      setBannerSaving(controller?.isSaving ?? false);
    },
    [],
  );

  const saveProfileFile = useCallback(
    (file: File, options?: { onSuccess?: () => void; onError?: () => void }) => {
      uploadProfile(file, {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      });
    },
    [uploadProfile],
  );

  const saveBannerFile = useCallback(
    (file: File, options?: { onSuccess?: () => void; onError?: () => void }) => {
      if (!establishmentId) {
        options?.onError?.();
        return;
      }

      uploadBanner(
        { establishmentId, file },
        {
          onSuccess: options?.onSuccess,
          onError: options?.onError,
        },
      );
    },
    [establishmentId, uploadBanner],
  );

  const saveAppearance = useCallback(async () => {
    const controllers = [profileControllerRef.current, bannerControllerRef.current].filter(
      (controller): controller is SettingsAppearanceUploadController =>
        controller !== null && controller.hasUnsavedChanges,
    );

    for (const controller of controllers) {
      const saved = await controller.save();
      if (!saved) {
        return false;
      }
    }

    return true;
  }, []);

  const discardAppearance = useCallback(() => {
    profileControllerRef.current?.discard();
    bannerControllerRef.current?.discard();
  }, []);

  useRegisterSettingsUnsavedChanges("appearance", {
    hasUnsavedChanges: profileDirty || bannerDirty,
    isSaving: profileSaving || bannerSaving,
    save: saveAppearance,
    discard: discardAppearance,
  });

  return (
    <div className="space-y-6">
      <SettingsAppearanceUploadSection
        variant="profile"
        existingImageUrl={user.profileImageUrl}
        isPending={isProfilePending}
        isRemovePending={isProfileRemovePending}
        onControllerChange={handleProfileControllerChange}
        onRemoveExisting={() => removeProfile()}
        onSaveFile={saveProfileFile}
      />

      {showBannerUpload ? (
        <SettingsAppearanceUploadSection
          variant="banner"
          existingImageUrl={establishment?.bannerImageUrl ?? null}
          disabled={!establishmentId}
          disabledMessage="Estabelecimento não encontrado. Complete o cadastro comercial para enviar o banner."
          isPending={isBannerPending}
          isRemovePending={isBannerRemovePending}
          onControllerChange={handleBannerControllerChange}
          onRemoveExisting={() => {
            if (!establishmentId) return;

            removeBanner({ establishmentId });
          }}
          onSaveFile={saveBannerFile}
        />
      ) : null}

      <SettingsAppearanceTip />
    </div>
  );
}
