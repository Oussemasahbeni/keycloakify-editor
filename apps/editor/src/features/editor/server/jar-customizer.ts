import type { Zippable } from "fflate";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

import { escapeRegExp } from "#/lib/utils";

import { BASE_THEME_NAME, MANIFEST_PATH } from "../shared/constants";
import type { EmailThemeConfig, LoginThemeConfig } from "../shared/model/theme-config";
import { emailConfigToProperties, themeConfigToProperties } from "../shared/model/theme-config";

/**
 * The theme name baked into the base template JAR (`packages/shadcn-theme`
 * `vite.config.ts` → `themeName`). It appears in entry paths
 * (`theme/shadcn-theme/...`), the `keycloak-themes.json` manifest, and as a
 * quoted token in the `.ftl` templates and the `kc.gen-*.js` bundle. A custom
 * download renames all of these to the user's chosen name.
 */
const THEME_DIR_PREFIX = `theme/${BASE_THEME_NAME}/`;

/** Where the login theme serves its static assets (favicons, logos, fonts). */
const LOGIN_DIST_SUBPATH = "login/resources/dist/";

/** Where the email theme serves its static assets (logos, fonts). */
const EMAIL_DIST_SUBPATH = "email/resources/";

/** Asset filenames must be plain names within `dist/` — no path traversal. */
const ASSET_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

/** Keycloak theme names map to directory names, so keep them filesystem/URL-safe. */
const THEME_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/** Quote characters that wrap the theme name as a complete token in code/JSON. */
const QUOTES = ['"', "'", "`"] as const;

/**
 * Extensions whose bytes are already compressed; re-deflating them is slow and
 * gains nothing (fonts alone are most of the JAR's weight). We store these
 * verbatim (`level: 0`) and only deflate the rest.
 */
const PRECOMPRESSED = /\.(woff2?|ttf|otf|eot|png|jpe?g|gif|webp|avif|ico|jar|zip|gz)$/i;

/**
 * Options describing how to turn the base theme JAR into a user's themed JAR.
 */
export type JarCustomization = {
    /** The user's theme choices, baked as `theme.properties` defaults. */
    login: LoginThemeConfig;
    /**
     * Email theme choices, baked as `SHADCN_EMAIL_*` `theme.properties` defaults
     * (in both the login and email property files) and into the embedded manifest
     * (where import requires them). An empty `{}` inherits the login primary with
     * no custom logo, so emails stay correlated with the login theme.
     */
    email: EmailThemeConfig;
    /**
     * Internal Keycloak theme name (what the admin sees and selects). Lowercase
     * letters, digits and dashes. Defaults to the base name (no rename).
     */
    themeName: string | undefined;
    /**
     * Files to write into `login/resources/dist/`, keyed by filename. Overwrites
     * the entry when the name already exists (e.g. a generated favicon set; see
     * `generateFaviconSet`) or adds a new one (e.g. an uploaded logo). The theme
     * dir is resolved after any rename, so callers pass plain filenames.
     */
    assets?: Record<string, Uint8Array>;
    /**
     * Optional email logo upload. If present, the file is written into the email
     * theme's `resources` dir and `SHADCN_EMAIL_LOGO_URL` is pointed at the bare
     * filename (→ the theme's self-hosted branch). If absent, the logo URL is
     * taken from the typed `email.logoUrl` (or undefined, which yields no logo).
     */
    emailAssets?: Record<string, Uint8Array>;
};

/**
 * Produces a customized Keycloak theme JAR from the base template bytes.
 *
 * Pure & in-memory (no filesystem): the caller supplies the template bytes (see
 * `loadTemplateJar`) and gets back the bytes of the new JAR. This keeps the
 * function trivially unit-testable.
 *
 * - Config baking: every `theme.properties` entry has its `SHADCN_THEME_*`
 *   defaults rewritten to the user's config. The `${env.X:...}` form is
 *   preserved, so the result is drop-in (works with no env vars) yet still
 *   overridable at deploy time.
 * - Theme rename (when `themeName` differs from the base): the
 *   `theme/<base>/...` path prefix, the `keycloak-themes.json` manifest, and the
 *   quoted theme-name token in `.ftl`/`.js`/`.json` entries are all renamed.
 */
export function customizeThemeJar(templateBytes: Uint8Array, options: JarCustomization): Uint8Array {
    const entries = unzipSync(templateBytes);
    const properties = {
        ...themeConfigToProperties(options.login),
        ...emailConfigToProperties(options.email, options.login.primary),
    };
    const themeName = resolveThemeName(options.themeName);
    const rename = themeName !== BASE_THEME_NAME;

    const out: Zippable = {};
    for (const path of Object.keys(entries)) {
        let bytes: Uint8Array = entries[path];

        if (path.endsWith("theme.properties")) {
            bytes = rewritePropertyDefaults(bytes, properties);
        } else if (rename && isThemeNameCarrier(path)) {
            bytes = renameThemeNameTokens(bytes, themeName);
        }

        const outPath =
            rename && path.startsWith(THEME_DIR_PREFIX)
                ? `theme/${themeName}/${path.slice(THEME_DIR_PREFIX.length)}`
                : path;

        out[outPath] = [bytes, { level: PRECOMPRESSED.test(outPath) ? 0 : 6 }];
    }

    if (options.assets) {
        writeAssets(out, themeName, LOGIN_DIST_SUBPATH, options.assets);
    }
    if (options.emailAssets) {
        writeAssets(out, themeName, EMAIL_DIST_SUBPATH, options.emailAssets);
    }

    writeManifest(out, options);

    return zipSync(out);
}

function writeManifest(out: Zippable, config: JarCustomization): void {
    out[MANIFEST_PATH] = [
        strToU8(
            JSON.stringify({
                __version: 1,
                login: config.login,
                email: config.email,
                themeName: config.themeName,
            }),
        ),
        { level: 6 },
    ];
}

// Write uploaded/generated assets into the given subpath of the (possibly renamed)
// theme dir. Overwrites an existing entry (favicon) or adds a new one (logo/side/card).
function writeAssets(out: Zippable, themeName: string, distSubpath: string, assets: Record<string, Uint8Array>): void {
    for (const [name, bytes] of Object.entries(assets)) {
        if (!ASSET_NAME_PATTERN.test(name)) {
            throw new Error(`Invalid asset filename "${name}".`);
        }
        const path = `theme/${themeName}/${distSubpath}${name}`;
        out[path] = [bytes, { level: PRECOMPRESSED.test(name) ? 0 : 6 }];
    }
}

/** Validates a requested theme name, falling back to the base name when blank. */
function resolveThemeName(name: string | undefined): string {
    const trimmed = name?.trim();
    if (!trimmed) return BASE_THEME_NAME;
    if (!THEME_NAME_PATTERN.test(trimmed)) {
        throw new Error(
            `Invalid theme name "${trimmed}". Use lowercase letters, digits and ` +
                `dashes, starting with a letter or digit (e.g. "acme-login").`,
        );
    }
    return trimmed;
}

/**
 * Entries that embed the theme name as a quoted token: the `.ftl` templates
 * (`"themeName": "shadcn-theme"`), the `kc.gen-*.js` bundle (`` [`shadcn-theme`] ``)
 * and the `keycloak-themes.json` manifest (`"name": "shadcn-theme"`). Notably
 * excludes the Maven `pom.xml`/`pom.properties`, whose `shadcn-theme-keycloak-theme`
 * artifact id must stay intact (and is Keycloak-irrelevant anyway).
 */
function isThemeNameCarrier(path: string): boolean {
    return path.endsWith(".ftl") || path.endsWith(".js") || path.endsWith(".json");
}

/**
 * Replaces the theme name only where it appears as a complete quoted token
 * (`"shadcn-theme"`, `'shadcn-theme'`, `` `shadcn-theme` ``). Because both quotes
 * must be present, longer tokens like `shadcn-theme-keycloak-theme` never match.
 */
function renameThemeNameTokens(bytes: Uint8Array, themeName: string): Uint8Array {
    let text = strFromU8(bytes);
    for (const q of QUOTES) {
        text = text.split(`${q}${BASE_THEME_NAME}${q}`).join(`${q}${themeName}${q}`);
    }
    return strToU8(text);
}

/**
 * Rewrites the `KEY=${env.KEY:default}` default value for each managed key found
 * in a `theme.properties` file. Keys absent from the file, and every other line,
 * are left byte-for-byte unchanged. An empty value yields `KEY=${env.KEY:}`,
 * identical to the stock template.
 */
function rewritePropertyDefaults(bytes: Uint8Array, properties: Record<string, string>): Uint8Array {
    let text = strFromU8(bytes);

    for (const [key, value] of Object.entries(properties)) {
        // Match `KEY=${env.KEY:<anything but '}'>}` and swap only the default.
        const pattern = new RegExp(`(${escapeRegExp(key)}=\\$\\{env\\.${escapeRegExp(key)}:)[^}]*\\}`);
        // Use a replacer function so `$` / special chars in the value are literal.
        text = text.replace(pattern, (_match, prefix: string) => `${prefix}${value}}`);
    }

    return strToU8(text);
}
