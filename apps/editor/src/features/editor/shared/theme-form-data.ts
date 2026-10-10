import type { z } from "zod";

import type { FileMeta } from "./files";
import type { AssetKey, ThemeAssetKey } from "./model/assets";
import { assetDefinitions } from "./model/assets";
import { themeConfigSchema } from "./model/theme-config";
import type { ParsedTheme } from "./parse-theme-jar";
import { emailLogoSchema, getEmailLogoMetaError } from "./validation/email-logo";
import { faviconFileSchema, getFaviconMetaError } from "./validation/favicon";
import { assetSchema, getImageMetaError } from "./validation/image";

/**
 * The multipart layout a theme is exported in: a JSON `options` field plus one
 * file field per uploaded image.
 */
const OPTIONS_FIELD = "options";
const FAVICON_FIELD = "favicon";
const EMAIL_LOGO_FIELD = "emailLogoFile";

/** Every file a theme can carry, keyed the way it is in the form data and in storage. */
export const themeFileSlots = [
    ...assetDefinitions.map(({ key }) => key),
    FAVICON_FIELD,
    EMAIL_LOGO_FIELD,
] as const satisfies readonly (ThemeAssetKey | typeof EMAIL_LOGO_FIELD)[];

export type ThemeFileSlot = (typeof themeFileSlots)[number];

export const themeOptionsSchema = themeConfigSchema.omit({ __version: true });

export function getThemeFile(theme: ParsedTheme, slot: ThemeFileSlot): File | null {
    return slot === EMAIL_LOGO_FIELD ? theme.emailLogoFile : theme.assets[slot];
}

/** Why a file isn't acceptable in a slot (type or size), or null if it is. */
export function getThemeFileMetaError(slot: ThemeFileSlot, file: FileMeta): string | null {
    if (slot === FAVICON_FIELD) return getFaviconMetaError(file);
    if (slot === EMAIL_LOGO_FIELD) return getEmailLogoMetaError(file);
    return getImageMetaError(file);
}

export function buildThemeFormData(theme: ParsedTheme) {
    const formData = new FormData();

    formData.append(
        OPTIONS_FIELD,
        JSON.stringify({ login: theme.login, email: theme.email, themeName: theme.themeName.trim() }),
    );

    for (const slot of themeFileSlots) {
        const file = getThemeFile(theme, slot);
        if (file) formData.append(slot, file);
    }

    return formData;
}

/** Server side: validates the options and every uploaded file. */
export function parseThemeFormData<Schema extends z.ZodType>(formData: FormData, optionsSchema: Schema) {
    const rawOptions = formData.get(OPTIONS_FIELD);
    if (typeof rawOptions !== "string") {
        throw new Error("Missing `options` field.");
    }
    const options = optionsSchema.parse(JSON.parse(rawOptions));

    const rawFavicon = formData.get(FAVICON_FIELD);
    const favicon = rawFavicon === null ? null : faviconFileSchema.parse(rawFavicon);

    const assets: Partial<Record<AssetKey, File>> = {};
    for (const { key } of assetDefinitions) {
        const raw = formData.get(key);
        if (raw !== null) assets[key] = assetSchema.parse(raw);
    }

    const rawEmailLogo = formData.get(EMAIL_LOGO_FIELD);
    const emailLogoFile = rawEmailLogo === null ? null : emailLogoSchema.parse(rawEmailLogo);

    return { options, favicon, assets, emailLogoFile };
}
