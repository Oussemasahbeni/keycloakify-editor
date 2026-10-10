import { z } from "zod";

import type { FileMeta } from "../files";
import { LOGIN_IMAGE_EXTENSIONS, LOGIN_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "../files";

/** The rules for an uploaded image, on the facts alone so the server can apply them to a file it never receives. */
export function getImageMetaError(file: FileMeta): string | null {
    const isAccepted =
        LOGIN_IMAGE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext)) ||
        LOGIN_IMAGE_MIME_TYPES.includes(file.type);
    if (!isAccepted) return "Use a PNG, SVG, or JPEG file.";
    if (file.size > MAX_IMAGE_SIZE_BYTES) return "File is too large (max 1 MB).";
    return null;
}

/**
 * Validates an uploaded image (client form + server `generateJar` validator both
 * use this — keep it pure, no React). Mirrors `favicon-upload.ts`'s schema.
 */
export const assetSchema = z.instanceof(File, { error: "Image must be a file." }).superRefine((file, ctx) => {
    const message = getImageMetaError(file);
    if (message) ctx.addIssue({ code: "custom", message });
});

export function getImageError(file: File): string | null {
    const result = assetSchema.safeParse(file);
    return result.success ? null : (result.error.issues[0]?.message ?? "Invalid file.");
}
