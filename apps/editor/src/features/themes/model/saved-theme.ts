import { z } from "zod";

import { assetDefinitions } from "#/features/editor/shared/model/assets.ts";
import type { LoginThemeConfig } from "#/features/editor/shared/model/theme-config.ts";
import { getThemeFileMetaError, themeFileSlots, themeOptionsSchema } from "#/features/editor/shared/theme-form-data.ts";
import { getThemeNameError } from "#/features/editor/shared/validation/theme-name.ts";

export const MAX_THEME_NAME_LENGTH = 64;
/** Also what keeps an inline `data:` image from riding along inside the config. */
export const MAX_URL_LENGTH = 2048;
export const MAX_WELCOME_MESSAGE_LENGTH = 2000;

/**
 * What the server accepts for a stored theme: the editor's config plus the
 * bounds a row needs. Export has no such bounds because it stores nothing.
 */
export const savedThemeOptionsSchema = themeOptionsSchema.superRefine((options, ctx) => {
    const issue = (path: string[], message: string) => ctx.addIssue({ code: "custom", path, message });

    const name = options.themeName.trim();
    const nameError = getThemeNameError(name);
    if (nameError) issue(["themeName"], nameError);
    if (name.length > MAX_THEME_NAME_LENGTH) {
        issue(["themeName"], `Theme name is too long (max ${MAX_THEME_NAME_LENGTH} characters).`);
    }

    for (const { key, label } of assetDefinitions) {
        if (options.login[key].length > MAX_URL_LENGTH) {
            issue(["login", key], `${label}: URL is too long. Upload the image instead.`);
        }
    }
    if ((options.email.logoUrl ?? "").length > MAX_URL_LENGTH) {
        issue(["email", "logoUrl"], "Email logo: URL is too long. Upload the image instead.");
    }
    if (options.login.welcomeMessage.length > MAX_WELCOME_MESSAGE_LENGTH) {
        issue(
            ["login", "welcomeMessage"],
            `Welcome message is too long (max ${MAX_WELCOME_MESSAGE_LENGTH} characters).`,
        );
    }
});

const slotSchema = z.enum(themeFileSlots);
const filenameSchema = z.string().min(1).max(255);

/**
 * Images never pass through the server (its host caps request bodies well
 * below a theme's worth of them). To save, the browser first asks for one
 * upload URL per new or changed image, sends each file straight to object
 * storage, and then saves the theme naming the keys it was given.
 */
export const uploadRequestSchema = z.object({
    files: z
        .array(
            z
                .object({ slot: slotSchema, filename: filenameSchema, mimeType: z.string().max(255), size: z.int() })
                .superRefine((file, ctx) => {
                    const message = getThemeFileMetaError(file.slot, {
                        name: file.filename,
                        type: file.mimeType,
                        size: file.size,
                    });
                    if (message) ctx.addIssue({ code: "custom", message: `${file.filename}: ${message}` });
                }),
        )
        .min(1)
        .max(themeFileSlots.length),
});

export type UploadTicket = {
    slot: z.infer<typeof slotSchema>;
    /** Where the object will live; handed back in the save request. */
    key: string;
    /** Short-lived URL to `PUT` the file to, with exactly this `Content-Type`. */
    url: string;
    mimeType: string;
};

/**
 * `target` is null for a new theme. `uploads` are the images just sent to
 * storage; `keep` lists the stored ones that are unchanged. Any other stored
 * image is removed.
 */
export const saveRequestSchema = z.object({
    options: savedThemeOptionsSchema,
    target: z.object({ id: z.uuid(), revision: z.int().positive() }).nullable(),
    keep: z.array(slotSchema),
    uploads: z
        .array(z.object({ slot: slotSchema, key: z.string().min(1).max(512), filename: filenameSchema }))
        .max(themeFileSlots.length),
});

export type SaveRequest = z.input<typeof saveRequestSchema>;

/** One uploaded image as recorded on its theme: where the object is, and what it is. */
const storedAssetSchema = z.object({
    key: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
});

/** The `themes.assets` column: a theme's uploaded images, by slot. */
export const storedAssetsSchema = z.partialRecord(slotSchema, storedAssetSchema);

export type StoredAsset = z.infer<typeof storedAssetSchema>;
export type StoredAssets = z.infer<typeof storedAssetsSchema>;

export type SaveThemeResult = { status: "saved"; id: string; revision: number } | { status: "conflict" };

/** A stored image as the browser receives it: where to download it and what to call it. */
export type ThemeFileLink = {
    slot: z.infer<typeof slotSchema>;
    filename: string;
    mimeType: string;
    /** Short-lived download URL. */
    url: string;
};

/** A stored theme as sent to the editor. `saved` is absent on a shared theme, which opens as an unsaved copy. */
export type LoadedTheme = z.infer<typeof themeOptionsSchema> & {
    files: ThemeFileLink[];
    saved?: { id: string; revision: number };
};

export type ThemeSummary = {
    id: string;
    name: string;
    login: LoginThemeConfig;
    updatedAt: string;
    shareToken: string | null;
};
