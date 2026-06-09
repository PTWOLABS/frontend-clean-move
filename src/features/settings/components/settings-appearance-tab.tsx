"use client";

import { useEstablishment } from "@/features/establishment/hooks/use-establishment";
import type { User } from "@/features/user/types";

import { useUploadEstablishmentBanner } from "../hooks/use-upload-establishment-banner";
import { useUploadUserProfileImage } from "../hooks/use-upload-user-profile-image";
import { SettingsAppearanceTip } from "./settings-appearance-tip";
import { SettingsAppearanceUploadSection } from "./settings-appearance-upload-section";

type SettingsAppearanceTabProps = {
  user: User;
  showBannerUpload: boolean;
};

export function SettingsAppearanceTab({ user, showBannerUpload }: SettingsAppearanceTabProps) {
  const { mutate: uploadProfile, isPending: isProfilePending } = useUploadUserProfileImage();
  const { mutate: uploadBanner, isPending: isBannerPending } = useUploadEstablishmentBanner();

  const establishmentId = user.establishmentId;
  const { data: establishment } = useEstablishment(showBannerUpload ? establishmentId : null);

  return (
    <div className="space-y-6">
      <SettingsAppearanceUploadSection
        variant="profile"
        existingImageUrl={user.profileImageUrl}
        isPending={isProfilePending}
        onSaveFile={(file, options) => {
          uploadProfile(file, { onSuccess: options?.onSuccess });
        }}
      />

      {showBannerUpload ? (
        <SettingsAppearanceUploadSection
          variant="banner"
          existingImageUrl={establishment?.bannerImageUrl ?? null}
          disabled={!establishmentId}
          disabledMessage="Estabelecimento não encontrado. Complete o cadastro comercial para enviar o banner."
          isPending={isBannerPending}
          onSaveFile={(file, options) => {
            if (!establishmentId) return;

            uploadBanner({ establishmentId, file }, { onSuccess: options?.onSuccess });
          }}
        />
      ) : null}

      <SettingsAppearanceTip />
    </div>
  );
}
