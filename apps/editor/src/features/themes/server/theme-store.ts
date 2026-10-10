import { randomBytes } from "node:crypto";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "#/db/index.ts";
import { themes } from "#/db/schema.ts";
import type { EmailThemeConfig, LoginThemeConfig, ThemeConfig } from "#/features/editor/shared/model/theme-config.ts";
import { themeConfigSchema } from "#/features/editor/shared/model/theme-config.ts";
import type { ThemeFileSlot } from "#/features/editor/shared/theme-form-data.ts";
import { getThemeFileMetaError, themeFileSlots } from "#/features/editor/shared/theme-form-data.ts";
import type { SavedThemeRef } from "#/lib/draft-storage";

import type { LoadedTheme, SaveThemeResult, StoredAssets, ThemeFileLink, ThemeSummary } from "../model/saved-theme";
import { MAX_THEME_NAME_LENGTH, storedAssetsSchema } from "../model/saved-theme";
import { copyAsset, describeAsset, discardAssets, isAssetKeyOf, newAssetKey, signDownload } from "./asset-storage";

/**
 * Storage for saved themes. Every function that takes a theme id also takes the
 * caller's `sub` and filters on it — that filter is the access control, so a
 * theme that exists but belongs to someone else behaves exactly like one that
 * doesn't exist. The only read without it is `findSharedTheme`, which is keyed
 * by the share token and never accepts a theme id.
 *
 * A theme is one row. Its images are recorded on it (`assets`) as keys into
 * object storage (`asset-storage`), so they are reachable only through the row
 * and the same filter guards them. Every write is a single statement.
 */

const SCHEMA_VERSION = 1 satisfies ThemeConfig["__version"];
const COPY_SUFFIX = "-copy";

export type ThemeRow = typeof themes.$inferSelect;

export type ThemeContent = {
    themeName: string;
    login: LoginThemeConfig;
    email: EmailThemeConfig;
};

/** An image the browser says it has put in object storage. Nothing here is trusted until checked. */
export type UploadClaim = {
    slot: ThemeFileSlot;
    key: string;
    filename: string;
};

const ownedBy = (themeId: string, ownerSub: string) => and(eq(themes.id, themeId), eq(themes.ownerSub, ownerSub));

const toColumns = ({ themeName, login, email }: ThemeContent) => ({
    name: themeName.trim(),
    schemaVersion: SCHEMA_VERSION,
    login,
    email,
});

const keysOf = (assets: StoredAssets) => Object.values(assets).map(asset => asset.key);

const mismatch = () => new Error("The uploaded images don't match this save. Try saving again.");

export async function listThemes(ownerSub: string): Promise<ThemeSummary[]> {
    const rows = await db
        .select({
            id: themes.id,
            name: themes.name,
            login: themes.login,
            updatedAt: themes.updatedAt,
            shareToken: themes.shareToken,
        })
        .from(themes)
        .where(eq(themes.ownerSub, ownerSub))
        .orderBy(desc(themes.updatedAt));

    return rows.map(row => ({ ...row, updatedAt: row.updatedAt.toISOString() }));
}

export async function findTheme(id: string, ownerSub: string): Promise<ThemeRow> {
    const [theme] = await db.select().from(themes).where(ownedBy(id, ownerSub));
    if (!theme) throw new Error("Theme not found.");
    return theme;
}

export async function findSharedTheme(token: string): Promise<ThemeRow> {
    const [theme] = await db.select().from(themes).where(eq(themes.shareToken, token));
    if (!theme) throw new Error("This shared theme doesn't exist or is no longer shared.");
    return theme;
}

/** The stored row as the editor loads it: its config, and a download link per image. */
export async function loadTheme(theme: ThemeRow): Promise<Omit<LoadedTheme, "saved">> {
    const { themeName, login, email } = themeConfigSchema.parse({
        __version: theme.schemaVersion,
        themeName: theme.name,
        login: theme.login,
        email: theme.email,
    });
    const assets = storedAssetsSchema.parse(theme.assets);

    const files = await Promise.all(
        themeFileSlots.map(async (slot): Promise<ThemeFileLink | null> => {
            const asset = assets[slot];
            if (!asset) return null;
            const { key, filename, mimeType } = asset;
            return { slot, filename, mimeType, url: await signDownload(key) };
        }),
    );

    return { themeName, login, email, files: files.filter(file => file !== null) };
}

/**
 * Checks what the browser claims to have uploaded, then runs `write` with the
 * records for it. A claim is accepted only if its key was issued to this user,
 * none of their themes already uses it, an object really exists there, and
 * that object passes the same type and size rules as any upload.
 *
 * If a later check fails, `write` throws, or `write` reports that it stored
 * nothing, the uploaded objects are removed again.
 */
async function withUploads<Result>(
    ownerSub: string,
    claims: UploadClaim[],
    write: (uploaded: StoredAssets) => Promise<{ result: Result; stored: boolean }>,
): Promise<Result> {
    const keys = claims.map(claim => claim.key);

    // These two failures must not clean anything up: the keys aren't this
    // save's to delete (someone else's, or already part of a saved theme).
    if (new Set(claims.map(claim => claim.slot)).size !== claims.length) throw mismatch();
    if (!keys.every(key => isAssetKeyOf(ownerSub, key))) throw mismatch();
    if (keys.length > 0) {
        // Keys carry their owner's id, so only this user's themes can hold one.
        const owned = await db.select({ assets: themes.assets }).from(themes).where(eq(themes.ownerSub, ownerSub));
        const inUse = new Set(owned.flatMap(theme => keysOf(theme.assets)));
        if (keys.some(key => inUse.has(key))) throw mismatch();
    }

    try {
        const uploaded: StoredAssets = {};
        await Promise.all(
            claims.map(async ({ slot, key, filename }) => {
                const object = await describeAsset(key);
                if (!object) throw new Error(`${filename} didn't finish uploading. Try saving again.`);

                const { mimeType, size } = object;
                const error = getThemeFileMetaError(slot, { name: filename, type: mimeType, size });
                if (error) throw new Error(`${filename}: ${error}`);

                uploaded[slot] = { key, filename, mimeType, size };
            }),
        );

        const { result, stored } = await write(uploaded);
        if (!stored) await discardAssets(keys);
        return result;
    } catch (error) {
        await discardAssets(keys);
        throw error;
    }
}

async function insertTheme(ownerSub: string, content: ThemeContent, assets: StoredAssets): Promise<SavedThemeRef> {
    const [theme] = await db
        .insert(themes)
        .values({ ownerSub, ...toColumns(content), assets })
        .returning({ id: themes.id, revision: themes.revision });
    if (!theme) throw new Error("Couldn't create the theme.");
    return theme;
}

export async function createTheme(
    ownerSub: string,
    content: ThemeContent,
    uploads: UploadClaim[],
): Promise<SavedThemeRef> {
    return withUploads(ownerSub, uploads, async uploaded => ({
        result: await insertTheme(ownerSub, content, uploaded),
        stored: true,
    }));
}

/**
 * Replaces a theme's content if it is still at `target.revision`.
 *
 * `uploads` are the new or changed images and `keep` the stored ones to leave
 * alone; any other stored image is removed.
 *
 * The new image record is built from the row as it was read, and the update
 * only matches if the row is still the caller's and still at that revision.
 * So either this save replaces exactly the version it read, or it changes
 * nothing and the uploads are thrown away. Two saves from the same revision
 * can't both match: the first one moves the revision on.
 */
export async function updateTheme(
    ownerSub: string,
    target: SavedThemeRef,
    content: ThemeContent,
    uploads: UploadClaim[],
    keep: readonly ThemeFileSlot[],
): Promise<SaveThemeResult> {
    const { id, revision } = target;

    let replacedKeys: string[] = [];
    const result = await withUploads(
        ownerSub,
        uploads,
        async (uploaded): Promise<{ result: SaveThemeResult; stored: boolean }> => {
            const current = await findTheme(id, ownerSub);
            if (current.revision !== revision) return { result: { status: "conflict" }, stored: false };

            const assets: StoredAssets = { ...uploaded };
            for (const slot of keep) {
                const kept = current.assets[slot];
                // An upload for the same slot wins over keeping the old image.
                if (kept && !assets[slot]) assets[slot] = kept;
            }

            const [updated] = await db
                .update(themes)
                .set({ ...toColumns(content), assets, revision: revision + 1, updatedAt: sql`now()` })
                .where(and(ownedBy(id, ownerSub), eq(themes.revision, revision)))
                .returning({ revision: themes.revision });
            if (!updated) return { result: { status: "conflict" }, stored: false };

            const stillUsed = new Set(keysOf(assets));
            replacedKeys = keysOf(current.assets).filter(key => !stillUsed.has(key));
            return { result: { status: "saved", id, revision: updated.revision }, stored: true };
        },
    );

    await discardAssets(replacedKeys);
    return result;
}

export async function deleteTheme(id: string, ownerSub: string): Promise<void> {
    const [deleted] = await db.delete(themes).where(ownedBy(id, ownerSub)).returning({ assets: themes.assets });
    if (!deleted) throw new Error("Theme not found.");

    await discardAssets(keysOf(deleted.assets));
}

export async function duplicateTheme(id: string, ownerSub: string): Promise<{ id: string }> {
    const source = await findTheme(id, ownerSub);

    // Each copy gets objects of its own, so deleting or editing one theme can
    // never take an image away from the other.
    const assets: StoredAssets = {};
    const copies = themeFileSlots.flatMap(slot => {
        const original = source.assets[slot];
        if (!original) return [];
        const copy = { ...original, key: newAssetKey(ownerSub) };
        assets[slot] = copy;
        return [{ from: original.key, to: copy.key, mimeType: copy.mimeType }];
    });

    try {
        await Promise.all(copies.map(({ from, to, mimeType }) => copyAsset(from, to, mimeType)));
        const themeName = `${source.name.slice(0, MAX_THEME_NAME_LENGTH - COPY_SUFFIX.length)}${COPY_SUFFIX}`;
        return await insertTheme(ownerSub, { themeName, login: source.login, email: source.email }, assets);
    } catch (error) {
        await discardAssets(keysOf(assets));
        throw error;
    }
}

/** Turning sharing on keeps an existing link; turning it off invalidates it for good. */
export async function setThemeSharing(id: string, ownerSub: string, enabled: boolean): Promise<string | null> {
    const [theme] = await db
        .update(themes)
        .set({
            shareToken: enabled ? sql`coalesce(${themes.shareToken}, ${randomBytes(32).toString("base64url")})` : null,
        })
        .where(ownedBy(id, ownerSub))
        .returning({ shareToken: themes.shareToken });

    if (!theme) throw new Error("Theme not found.");
    return theme.shareToken;
}
