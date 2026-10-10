import { z } from "zod";

import type { FileMeta } from "#/features/editor/shared/files.ts";
import {
    EMAIL_IMAGE_EXTENSIONS,
    EMAIL_IMAGE_MIME_TYPES,
    MAX_IMAGE_SIZE_BYTES,
} from "#/features/editor/shared/files.ts";

export function getEmailLogoMetaError(file: FileMeta): string | null {
    const isAccepted =
        EMAIL_IMAGE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext)) ||
        EMAIL_IMAGE_MIME_TYPES.includes(file.type);
    if (!isAccepted) return "Use a PNG or JPEG file.";
    if (file.size > MAX_IMAGE_SIZE_BYTES) return "File is too large (max 1 MB).";
    return null;
}

/**
 * Validates an uploaded email logo, SVG renders unreliably across mail clients.
 */
export const emailLogoSchema = z.instanceof(File, { error: "Email Logo must be a file." }).superRefine((file, ctx) => {
    const message = getEmailLogoMetaError(file);
    if (message) ctx.addIssue({ code: "custom", message });
});

export function getEmailLogoError(file: File): string | null {
    const result = emailLogoSchema.safeParse(file);
    return result.success ? null : (result.error.issues[0]?.message ?? "Invalid file.");
}
