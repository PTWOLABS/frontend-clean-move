import { validateImageFile } from "../lib/validate-image-file";

export function validateBannerFile(file: File): string | null {
  return validateImageFile(file);
}
