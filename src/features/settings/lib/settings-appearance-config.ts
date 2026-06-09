import { Image, User, type LucideIcon } from "lucide-react";

export type AppearanceUploadVariant = "profile" | "banner";

export type AppearanceUploadConfig = {
  title: string;
  description: string;
  headerIcon: LucideIcon;
  recommendation: string;
  previewHeadline: string;
  previewSubtext: string;
};

export const APPEARANCE_UPLOAD_CONFIG: Record<AppearanceUploadVariant, AppearanceUploadConfig> = {
  profile: {
    title: "Foto de Perfil",
    description: "Imagem exibida na sua conta e em áreas que identificam o estabelecimento.",
    headerIcon: User,
    recommendation: "Recomendado: imagem quadrada, mínimo 512×512 px.",
    previewHeadline: "Assim será exibido",
    previewSubtext: "em sua conta e em áreas de destaque.",
  },
  banner: {
    title: "Banner do Catálogo",
    description: "Imagem de destaque exibida no topo do catálogo.",
    headerIcon: Image,
    recommendation: "Recomendado: imagem 16:9, mínimo 1600×900 px.",
    previewHeadline: "Assim será exibido",
    previewSubtext: "no topo do catálogo.",
  },
};

export const APPEARANCE_PAGE_TIP =
  "Dica: use imagens de alta qualidade para garantir a melhor experiência visual em todos os dispositivos.";
