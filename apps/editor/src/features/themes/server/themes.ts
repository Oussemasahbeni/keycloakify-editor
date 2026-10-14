import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { oidcFnMiddleware } from "#/oidc.ts";

import type { LoadedTheme, SaveThemeResult, ThemeSummary, UploadTicket } from "../model/saved-theme";
import { saveRequestSchema, uploadRequestSchema } from "../model/saved-theme";
import { newAssetKey, signUpload } from "./asset-storage";
import * as store from "./theme-store";

/**
 * The saved-themes API. Each function takes the caller's identity, the `sub`
 * of the validated access token, and hands it to the store, which scopes every
 * query to it. `getSharedTheme` is the one function open to anyone.
 *
 * Image bytes never appear in these requests or responses: the browser moves
 * them to and from object storage itself, over the URLs handed out here.
 */

const loggedIn = oidcFnMiddleware();
const themeIdSchema = z.object({ id: z.uuid() });

export const listThemes = createServerFn({ method: "GET" })
    .middleware([loggedIn])
    .handler(async ({ context }): Promise<ThemeSummary[]> => {
        const ownerSub = context.oidc.accessTokenClaims.sub;
        return store.listThemes(ownerSub);
    });

export const getTheme = createServerFn({ method: "POST" })
    .middleware([loggedIn])
    .validator(themeIdSchema)
    .handler(async ({ data, context }): Promise<LoadedTheme> => {
        const ownerSub = context.oidc.accessTokenClaims.sub;
        const theme = await store.findTheme(data.id, ownerSub);
        return { ...(await store.loadTheme(theme)), saved: { id: theme.id, revision: theme.revision } };
    });

/** No sign-in: the token is the credential. Returns the theme without its id or revision. */
export const getSharedTheme = createServerFn({ method: "POST" })
    .validator(z.object({ token: z.string().min(32).max(128) }))
    .handler(async ({ data }): Promise<LoadedTheme> => store.loadTheme(await store.findSharedTheme(data.token)));

/** Step one of a save that has new images: where to send each of them. */
export const createThemeUploads = createServerFn({ method: "POST" })
    .middleware([loggedIn])
    .validator(uploadRequestSchema)
    .handler(async ({ data, context }): Promise<UploadTicket[]> => {
        const ownerSub = context.oidc.accessTokenClaims.sub;

        return Promise.all(
            data.files.map(async ({ slot, mimeType }) => {
                const key = newAssetKey(ownerSub);
                return { slot, key, mimeType, url: await signUpload(key, mimeType) };
            }),
        );
    });

export const saveTheme = createServerFn({ method: "POST" })
    .middleware([loggedIn])
    .validator(saveRequestSchema)
    .handler(async ({ data, context }): Promise<SaveThemeResult> => {
        const ownerSub = context.oidc.accessTokenClaims.sub;
        const { options, target, keep, uploads } = data;

        if (target === null) {
            return { status: "saved", ...(await store.createTheme(ownerSub, options, uploads)) };
        }
        return store.updateTheme(ownerSub, target, options, uploads, keep);
    });

export const deleteTheme = createServerFn({ method: "POST" })
    .middleware([loggedIn])
    .validator(themeIdSchema)
    .handler(async ({ data, context }) => {
        const ownerSub = context.oidc.accessTokenClaims.sub;
        await store.deleteTheme(data.id, ownerSub);
    });

export const duplicateTheme = createServerFn({ method: "POST" })
    .middleware([loggedIn])
    .validator(themeIdSchema)
    .handler(async ({ data, context }) => {
        const ownerSub = context.oidc.accessTokenClaims.sub;
        return store.duplicateTheme(data.id, ownerSub);
    });

export const setThemeSharing = createServerFn({ method: "POST" })
    .middleware([loggedIn])
    .validator(themeIdSchema.extend({ enabled: z.boolean() }))
    .handler(async ({ data, context }) => {
        const ownerSub = context.oidc.accessTokenClaims.sub;
        return { shareToken: await store.setThemeSharing(data.id, ownerSub, data.enabled) };
    });
