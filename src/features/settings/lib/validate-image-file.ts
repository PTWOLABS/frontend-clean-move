const ACCEPTED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const IMAGE_ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
} as const;

export const IMAGE_MAX_SIZE_BYTES = MAX_FILE_SIZE_BYTES;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    return "Formato inválido. Use PNG, JPG, JPEG ou WEBP.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "O arquivo deve ter no máximo 5 MB.";
  }

  return null;
}

export function getImageRejectionMessage(code: string): string {
  switch (code) {
    case "file-too-large":
      return "O arquivo deve ter no máximo 5 MB.";
    case "file-invalid-type":
      return "Formato inválido. Use PNG, JPG, JPEG ou WEBP.";
    default:
      return "Não foi possível carregar o arquivo. Tente novamente.";
  }
}
