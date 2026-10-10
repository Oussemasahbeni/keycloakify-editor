import { mimeFromFilename } from "#/features/editor/shared/files.ts";
import type { ThemeAssetKey } from "#/features/editor/shared/model/assets.ts";
import { emptyAssets } from "#/features/editor/shared/model/assets.ts";
import type { ParsedTheme } from "#/features/editor/shared/parse-theme-jar.ts";
import type { ThemeFileSlot } from "#/features/editor/shared/theme-form-data.ts";
import { getThemeFile, themeFileSlots } from "#/features/editor/shared/theme-form-data.ts";

import type { LoadedTheme, UploadTicket } from "./model/saved-theme";

/**
 * The browser's half of moving theme images: straight to and from object
 * storage, over the short-lived URLs the server hands out.
 */

export type PendingUpload = { slot: ThemeFileSlot; file: File; filename: string; mimeType: string; size: number };

/** The images a save has to send: every one the theme has, minus the stored ones that are unchanged. */
export function getPendingUploads(theme: ParsedTheme, unchanged: readonly ThemeFileSlot[]): PendingUpload[] {
    return themeFileSlots.flatMap(slot => {
        const file = getThemeFile(theme, slot);
        if (!file || unchanged.includes(slot)) return [];
        return [
            { slot, file, filename: file.name, mimeType: file.type || mimeFromFilename(file.name), size: file.size },
        ];
    });
}

export async function uploadThemeFiles(pending: PendingUpload[], tickets: UploadTicket[]): Promise<void> {
    await Promise.all(
        tickets.map(async ({ slot, url, mimeType }) => {
            const upload = pending.find(candidate => candidate.slot === slot);
            if (!upload) return;
            // The content type is part of what the URL was signed for.
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": mimeType },
                body: upload.file,
            });
            if (!response.ok) throw new Error(`Couldn't upload ${upload.filename} (${response.status}).`);
        }),
    );
}

/** Downloads a loaded theme's images and assembles the editor document. */
export async function toParsedTheme({ themeName, login, email, files }: LoadedTheme): Promise<ParsedTheme> {
    const downloaded = await Promise.all(
        files.map(async ({ slot, filename, mimeType, url }) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Couldn't download ${filename} (${response.status}).`);
            return { slot, file: new File([await response.blob()], filename, { type: mimeType }) };
        }),
    );

    const assets: Record<ThemeAssetKey, File | null> = { ...emptyAssets };
    let emailLogoFile: File | null = null;
    for (const { slot, file } of downloaded) {
        if (slot === "emailLogoFile") emailLogoFile = file;
        else assets[slot] = file;
    }

    return { themeName, login, assets, email, emailLogoFile };
}
