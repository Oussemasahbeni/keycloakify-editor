import { createServerFn } from "@tanstack/react-start";

import type { AssetKey } from "#/features/editor/shared/model/assets.ts";
import { assetDefinitions } from "#/features/editor/shared/model/assets.ts";
import { faviconFileSchema } from "#/features/editor/shared/validation/favicon.ts";
import { oidcFnMiddleware } from "#/oidc.ts";

import { getImageExtension } from "../shared/files";
import { themeConfigSchema } from "../shared/model/theme-config";
import { emailLogoSchema } from "../shared/validation/email-logo";
import { assetSchema } from "../shared/validation/image";
import { generateFaviconSet } from "./favicon";
import { customizeThemeJar } from "./jar-customizer";
import { loadTemplateJar } from "./template-jar";

/**
 * Builds a themed Keycloak JAR from the editor's current config and streams it
 * back as a download.
 *
 * Transport is `multipart/form-data` (a POST server function whose validator
 * resolves to `FormData`): a JSON `options` field plus an optional `favicon`
 * file (PNG/SVG/ICO). The handler returns a raw `Response` — server functions
 * pass a `Response` through untouched — with the `application/java-archive`
 * content type so the browser saves it.
 */
export const generateJar = createServerFn({ method: "POST" })
    .middleware([oidcFnMiddleware({ assert: "user logged in" })])
    .validator(data => {
        if (!(data instanceof FormData)) {
            throw new Error("Expected multipart/form-data.");
        }

        const rawOptions = data.get("options");
        if (typeof rawOptions !== "string") {
            throw new Error("Missing `options` field.");
        }
        const { login, email, themeName } = themeConfigSchema.omit({ __version: true }).parse(JSON.parse(rawOptions));

        const rawFavicon = data.get("favicon");
        const favicon = rawFavicon === null ? null : faviconFileSchema.parse(rawFavicon);

        const assets: Partial<Record<AssetKey, File>> = {};
        for (const { key } of assetDefinitions) {
            const raw = data.get(key);
            if (raw !== null) assets[key] = assetSchema.parse(raw);
        }

        const rawEmailLogo = data.get("emailLogoFile");
        const emailLogoFile = rawEmailLogo === null ? null : emailLogoSchema.parse(rawEmailLogo);

        return { login, email, themeName, favicon, assets, emailLogoFile };
    })
    .handler(async ({ data }) => {
        const { email, themeName, favicon, assets, emailLogoFile } = data;
        let login = data.login;

        const assetsRecord: Record<string, Uint8Array> = {};
        if (favicon) {
            const bytes = new Uint8Array(await favicon.arrayBuffer());
            Object.assign(assetsRecord, await generateFaviconSet(bytes));
        }

        // Uploaded images: bake the bytes into `dist/` and repoint the matching
        // SHADCN_THEME_*_URL at the bundled file (an upload overrides any URL).
        for (const { key, baseName } of assetDefinitions) {
            const file = assets[key];
            if (!file) continue;
            const filename = `${baseName}.${getImageExtension(file)}`;
            assetsRecord[filename] = new Uint8Array(await file.arrayBuffer());
            login = { ...login, [key]: `%BASE_URL%/${filename}` };
        }

        const emailAssets: Record<string, Uint8Array> = {};
        let emailLogoUrl = email.logoUrl;
        if (emailLogoFile) {
            const filename = `logo.${getImageExtension(emailLogoFile)}`;
            emailAssets[filename] = new Uint8Array(await emailLogoFile.arrayBuffer());
            emailLogoUrl = filename;
        }

        const templateJar = await loadTemplateJar();
        const options = {
            login,
            email: {
                ...email,
                logoUrl: emailLogoUrl,
            },
            themeName,
            assets: Object.keys(assetsRecord).length > 0 ? assetsRecord : undefined,
            emailAssets: Object.keys(emailAssets).length > 0 ? emailAssets : undefined,
        };

        const jar = customizeThemeJar(templateJar, options);

        const filename = `${themeName.trim()}.jar`;
        return new Response(Buffer.from(jar), {
            headers: {
                "Content-Type": "application/java-archive",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    });
