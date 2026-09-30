import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";

import type { LoginThemeConfig } from "#/features/editor/shared/model/theme-config.ts";
import {
    defaultLoginThemeConfig,
    emailConfigToProperties,
    themeConfigToProperties,
} from "#/features/editor/shared/model/theme-config.ts";

import { MANIFEST_PATH } from "../../shared/constants";
import { customizeThemeJar } from "../jar-customizer";

const LOGIN_PROPS = "theme/shadcn-theme/login/theme.properties";

const template = new Uint8Array(readFileSync(fileURLToPath(new URL("../templates/base-theme.jar", import.meta.url))));

/** A config that differs from the template defaults on every baked key. */
const customConfig: LoginThemeConfig = {
    ...defaultLoginThemeConfig,
    layout: "centered-card",
    base: "stone",
    primary: "blue",
    radius: "large",
    font: "inter",
    showPlaceholder: false,
    showRealmName: false,
    logoUrl: "https://cdn.example.com/logo-light.svg",
    asideImageUrl: "", // stays empty → `${env.X:}`
};

function readEntry(jar: Uint8Array, path: string): string {
    return strFromU8(unzipSync(jar)[path]);
}

// Re-zipping a 6 MB JAR isn't free, so customize once and share across assertions.
const result = customizeThemeJar(template, { login: customConfig, email: {}, themeName: undefined });

describe("customizeThemeJar (Tier A: config baking)", () => {
    it("bakes the config as theme.properties defaults, preserving the ${env:...} form", () => {
        const props = readEntry(result, LOGIN_PROPS);

        expect(props).toContain("SHADCN_THEME_LAYOUT=${env.SHADCN_THEME_LAYOUT:centered-card}");
        expect(props).toContain("SHADCN_THEME_BASE=${env.SHADCN_THEME_BASE:stone}");
        expect(props).toContain("SHADCN_THEME_PRIMARY=${env.SHADCN_THEME_PRIMARY:blue}");
        expect(props).toContain("SHADCN_THEME_RADIUS=${env.SHADCN_THEME_RADIUS:large}");
        expect(props).toContain("SHADCN_THEME_FONT=${env.SHADCN_THEME_FONT:inter}");
        expect(props).toContain("SHADCN_THEME_SHOW_PLACEHOLDER=${env.SHADCN_THEME_SHOW_PLACEHOLDER:false}");
        expect(props).toContain("SHADCN_THEME_SHOW_REALM_NAME=${env.SHADCN_THEME_SHOW_REALM_NAME:false}");
        expect(props).toContain(
            "SHADCN_THEME_LOGO_URL=${env.SHADCN_THEME_LOGO_URL:https://cdn.example.com/logo-light.svg}",
        );
    });

    it("keeps empty values as `${env.X:}` (drop-in identical to stock)", () => {
        const props = readEntry(result, LOGIN_PROPS);

        expect(props).toContain("SHADCN_THEME_ASIDE_IMAGE_URL=${env.SHADCN_THEME_ASIDE_IMAGE_URL:}");
    });

    it("leaves non-managed lines untouched", () => {
        const before = readEntry(template, LOGIN_PROPS);
        const after = readEntry(result, LOGIN_PROPS);

        for (const line of ["parent=keycloak", "darkMode=true"]) {
            expect(before).toContain(line);
            expect(after).toContain(line);
        }
        // The locales list is long and unmanaged — it must survive verbatim.
        const localesLine = (s: string) => s.split(/\r?\n/).find(l => l.startsWith("locales="));
        expect(after && localesLine(after)).toBe(before && localesLine(before));
    });

    // Drift guard: `rewritePropertyDefaults` silently no-ops on keys absent from
    // the template, so a renamed/removed key would export a JAR that ignores the
    // setting. Assert every property the editor emits still exists in the template.
    it("emits only property keys the template declares", () => {
        const props = readEntry(template, LOGIN_PROPS);
        const emitted = {
            ...themeConfigToProperties(defaultLoginThemeConfig),
            ...emailConfigToProperties({}, defaultLoginThemeConfig.primary),
        };
        for (const key of Object.keys(emitted)) {
            expect(props, `template theme.properties is missing "${key}"`).toContain(`${key}=`);
        }
    });

    it("changes nothing but the theme.properties entries", () => {
        const original = unzipSync(template);
        const rezipped = unzipSync(result);

        // Same set of entries, plus the embedded config manifest export adds.
        expect(Object.keys(rezipped).sort()).toEqual([...Object.keys(original), MANIFEST_PATH].sort());

        // Every non-properties entry is byte-identical. Use native Buffer.equals
        // rather than vitest's deep `toEqual`, which is pathologically slow over
        // ~1400 large byte arrays.
        const changed = Object.keys(original).filter(
            path =>
                !path.endsWith("theme.properties") && !Buffer.from(rezipped[path]).equals(Buffer.from(original[path])),
        );
        expect(changed).toEqual([]);
    }, 30_000);
});

describe("customizeThemeJar (Tier B: theme rename)", () => {
    const renamed = customizeThemeJar(template, {
        login: defaultLoginThemeConfig,
        email: {},
        themeName: "acme-login",
    });
    const paths = Object.keys(unzipSync(renamed));

    it("renames the theme directory prefix on every entry", () => {
        expect(paths.some(p => p.startsWith("theme/acme-login/login/"))).toBe(true);
        expect(paths.some(p => p.startsWith("theme/acme-login/email/"))).toBe(true);
        expect(paths.some(p => p.startsWith("theme/shadcn-theme/"))).toBe(false);
    });

    it("renames the name in keycloak-themes.json", () => {
        const manifest = JSON.parse(readEntry(renamed, "META-INF/keycloak-themes.json"));
        expect(manifest.themes[0].name).toBe("acme-login");
    });

    it("renames the quoted theme-name token in .ftl and the kc.gen bundle", () => {
        const ftl = readEntry(renamed, "theme/acme-login/login/login.ftl");
        expect(ftl).toContain('"themeName": "acme-login"');
        expect(ftl).not.toContain('"shadcn-theme"');

        const kcGenPath = paths.find(p => /kc\.gen-.*\.js$/.test(p))!;
        expect(readEntry(renamed, kcGenPath)).toContain("`acme-login`");
    });

    it("leaves the Maven artifact id (shadcn-theme-keycloak-theme) untouched", () => {
        const pomPath = paths.find(p => p.endsWith("pom.properties"))!;
        expect(readEntry(renamed, pomPath)).toContain("shadcn-theme-keycloak-theme");
    });

    it("does not rename when themeName is omitted or blank", () => {
        const untouched = customizeThemeJar(template, {
            login: defaultLoginThemeConfig,
            email: {},
            themeName: "  ",
        });
        expect(Object.keys(unzipSync(untouched)).some(p => p.startsWith("theme/shadcn-theme/"))).toBe(true);
    });

    it("rejects an invalid theme name", () => {
        expect(() =>
            customizeThemeJar(template, {
                login: defaultLoginThemeConfig,
                email: {},
                themeName: "Bad Name!",
            }),
        ).toThrow(/invalid theme name/i);
    });
});

describe("customizeThemeJar (Tier C: asset injection)", () => {
    const DIST = "theme/shadcn-theme/login/resources/dist/";
    const newBytes = (n: number) => new Uint8Array(n).fill(7);

    it("overwrites an existing dist file (e.g. favicon.ico) with the uploaded bytes", () => {
        const favicon = newBytes(64);
        const jar = customizeThemeJar(template, {
            themeName: undefined,
            login: defaultLoginThemeConfig,
            email: {},
            assets: { "favicon.ico": favicon },
        });
        const entry = unzipSync(jar)[`${DIST}favicon.ico`];
        expect(Buffer.from(entry).equals(Buffer.from(favicon))).toBe(true);
    });

    it("adds a new dist file when the filename does not exist (e.g. a logo)", () => {
        const logo = newBytes(32);
        const jar = customizeThemeJar(template, {
            themeName: undefined,
            login: defaultLoginThemeConfig,
            email: {},
            assets: { "logo-white.svg": logo },
        });
        const entry = unzipSync(jar)[`${DIST}logo-white.svg`];
        expect(Buffer.from(entry).equals(Buffer.from(logo))).toBe(true);
    });

    it("writes assets into the renamed theme dir", () => {
        const jar = customizeThemeJar(template, {
            login: defaultLoginThemeConfig,
            email: {},
            themeName: "acme-login",
            assets: { "favicon.ico": newBytes(16) },
        });
        const paths = Object.keys(unzipSync(jar));
        expect(paths).toContain("theme/acme-login/login/resources/dist/favicon.ico");
        expect(paths).not.toContain(`${DIST}favicon.ico`);
    });

    it("rejects asset filenames that try to escape the dist folder", () => {
        expect(() =>
            customizeThemeJar(template, {
                themeName: "acme-login",
                login: defaultLoginThemeConfig,
                email: {},
                assets: { "../../evil.sh": newBytes(4) },
            }),
        ).toThrow(/invalid asset filename/i);
    });
});

describe("customizeThemeJar (Tier D: email asset injection)", () => {
    const EMAIL_RESOURCES = "theme/acme-login/email/resources/";
    const newBytes = (n: number) => new Uint8Array(n).fill(9);

    it("writes an uploaded email logo into the email resources dir of the renamed theme", () => {
        const logo = newBytes(48);
        const jar = customizeThemeJar(template, {
            login: defaultLoginThemeConfig,
            email: {},
            themeName: "acme-login",
            emailAssets: { "logo.png": logo },
        });
        const entry = unzipSync(jar)[`${EMAIL_RESOURCES}logo.png`];
        expect(Buffer.from(entry).equals(Buffer.from(logo))).toBe(true);
    });

    it("rejects an email asset filename that tries to escape the resources folder", () => {
        expect(() =>
            customizeThemeJar(template, {
                login: defaultLoginThemeConfig,
                email: {},
                themeName: "acme-login",
                emailAssets: { "../../evil.sh": newBytes(4) },
            }),
        ).toThrow(/invalid asset filename/i);
    });
});
