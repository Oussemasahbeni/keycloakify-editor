import { createServerFn } from "@tanstack/react-start";

import { hasLifetimeAccess } from "#/features/billing/server/purchase-store.ts";
import { assetDefinitions } from "#/features/editor/shared/model/assets.ts";
import { oidcFnMiddleware } from "#/oidc.ts";

import { getImageExtension } from "../shared/files";
import { parseThemeFormData, themeOptionsSchema } from "../shared/theme-form-data";
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

        const { options, favicon, assets, emailLogoFile } = parseThemeFormData(data, themeOptionsSchema);

        return { ...options, favicon, assets, emailLogoFile };
    })
    .handler(async ({ data, context }) => {
        // The paywall itself: the editor's own check is only there to show the dialog.
        if (!(await hasLifetimeAccess(context.oidc.accessTokenClaims.sub))) {
            throw new Error("Exporting requires lifetime access.");
        }

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
