import { z } from "zod";

import {
    EMAIL_IMAGE_EXTENSIONS,
    EMAIL_IMAGE_MIME_TYPES,
    MAX_IMAGE_SIZE_BYTES,
} from "#/features/editor/shared/files.ts";

/**
 * Validates an uploaded email logo, SVG renders unreliably across mail clients.
 */
export const emailLogoSchema = z
    .instanceof(File, { error: "Email Logo must be a file." })
    .refine(
        file =>
            EMAIL_IMAGE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext)) ||
            EMAIL_IMAGE_MIME_TYPES.includes(file.type),
        "Use a PNG or JPEG file.",
    )
    .refine(file => file.size <= MAX_IMAGE_SIZE_BYTES, "File is too large (max 1 MB).");

export function getEmailLogoError(file: File): string | null {
    const result = emailLogoSchema.safeParse(file);
    return result.success ? null : (result.error.issues[0]?.message ?? "Invalid file.");
}
