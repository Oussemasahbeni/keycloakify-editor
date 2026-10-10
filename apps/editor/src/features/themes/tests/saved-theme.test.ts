import { afterEach, describe, expect, it, vi } from "vitest";

import { emptyAssets } from "#/features/editor/shared/model/assets.ts";
import { defaultLoginThemeConfig } from "#/features/editor/shared/model/theme-config.ts";
import type { ParsedTheme } from "#/features/editor/shared/parse-theme-jar.ts";
import { isSameThemeDocument } from "#/features/editor/shared/theme-document.ts";
import {
    buildThemeFormData,
    parseThemeFormData,
    themeOptionsSchema,
} from "#/features/editor/shared/theme-form-data.ts";

import { MAX_URL_LENGTH, savedThemeOptionsSchema, uploadRequestSchema } from "../model/saved-theme";
import { getPendingUploads, toParsedTheme, uploadThemeFiles } from "../theme-files";

const png = (name: string) => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], name, { type: "image/png" });

function makeTheme(overrides: Partial<ParsedTheme> = {}): ParsedTheme {
    return {
        themeName: "acme-login",
        login: defaultLoginThemeConfig,
        assets: emptyAssets,
        email: {},
        emailLogoFile: null,
        ...overrides,
    };
}

afterEach(() => vi.unstubAllGlobals());

describe("export form data", () => {
    it("carries the config and every file through to the server-side parse", () => {
        const theme = makeTheme({
            login: { ...defaultLoginThemeConfig, primary: "blue" },
            assets: { ...emptyAssets, logoUrl: png("logo.png"), favicon: png("favicon.png") },
            emailLogoFile: png("mail.png"),
        });

        const parsed = parseThemeFormData(buildThemeFormData(theme), themeOptionsSchema);

        expect(parsed.options.login.primary).toBe("blue");
        expect(parsed.assets.logoUrl?.name).toBe("logo.png");
        expect(parsed.favicon?.name).toBe("favicon.png");
        expect(parsed.emailLogoFile?.name).toBe("mail.png");
    });

    it("validates uploads on the way in", () => {
        const formData = buildThemeFormData(makeTheme({ emailLogoFile: new File(["<svg/>"], "mail.svg") }));

        expect(() => parseThemeFormData(formData, themeOptionsSchema)).toThrow();
    });
});

describe("uploadRequestSchema", () => {
    const file = { slot: "logoUrl", filename: "logo.png", mimeType: "image/png", size: 1000 };

    it("accepts a file that fits its slot", () => {
        expect(uploadRequestSchema.safeParse({ files: [file] }).success).toBe(true);
    });

    it("applies each slot's own rules", () => {
        const svg = { filename: "mark.svg", mimeType: "image/svg+xml", size: 1000 };

        expect(uploadRequestSchema.safeParse({ files: [{ ...svg, slot: "logoUrl" }] }).success).toBe(true);
        expect(uploadRequestSchema.safeParse({ files: [{ ...svg, slot: "emailLogoFile" }] }).success).toBe(false);
    });

    it("rejects an oversize file and an unknown slot", () => {
        expect(uploadRequestSchema.safeParse({ files: [{ ...file, size: 1024 * 1024 + 1 }] }).success).toBe(false);
        expect(uploadRequestSchema.safeParse({ files: [{ ...file, slot: "nope" }] }).success).toBe(false);
    });
});

describe("moving files to and from storage", () => {
    const logo = png("logo.png");
    const theme = makeTheme({
        assets: { ...emptyAssets, logoUrl: logo, favicon: png("favicon") },
        emailLogoFile: png("m.png"),
    });

    it("uploads every file except the unchanged stored ones", () => {
        const pending = getPendingUploads(theme, ["favicon"]);

        expect(pending.map(upload => upload.slot)).toEqual(["logoUrl", "emailLogoFile"]);
        expect(pending[0]).toMatchObject({ file: logo, filename: "logo.png", mimeType: "image/png", size: 4 });
    });

    it("puts each file at its ticket's URL with the signed content type", async () => {
        const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
        const pending = getPendingUploads(theme, ["favicon", "emailLogoFile"]);

        await uploadThemeFiles(pending, [
            { slot: "logoUrl", key: "k", url: "https://bucket/k", mimeType: "image/png" },
        ]);

        expect(fetchMock).toHaveBeenCalledExactlyOnceWith("https://bucket/k", {
            method: "PUT",
            headers: { "Content-Type": "image/png" },
            body: logo,
        });
    });

    it("fails the save when storage refuses an upload", async () => {
        vi.stubGlobal("fetch", async () => new Response(null, { status: 403 }));
        const pending = getPendingUploads(theme, ["favicon", "emailLogoFile"]);

        await expect(
            uploadThemeFiles(pending, [{ slot: "logoUrl", key: "k", url: "https://bucket/k", mimeType: "image/png" }]),
        ).rejects.toThrow(/logo\.png/);
    });

    it("rebuilds the editor document from a loaded theme's links", async () => {
        vi.stubGlobal("fetch", async (url: string) => new Response(new TextEncoder().encode(url)));

        const parsed = await toParsedTheme({
            themeName: "acme-login",
            login: defaultLoginThemeConfig,
            email: { primary: "rose" },
            files: [
                { slot: "favicon", filename: "favicon.ico", mimeType: "image/x-icon", url: "https://bucket/a" },
                { slot: "emailLogoFile", filename: "mail.png", mimeType: "image/png", url: "https://bucket/b" },
            ],
        });

        expect(parsed.email).toEqual({ primary: "rose" });
        expect(parsed.assets.favicon?.name).toBe("favicon.ico");
        expect(parsed.assets.favicon?.type).toBe("image/x-icon");
        expect(await parsed.assets.favicon?.text()).toBe("https://bucket/a");
        expect(await parsed.emailLogoFile?.text()).toBe("https://bucket/b");
        expect(parsed.assets.logoUrl).toBeNull();
    });
});

describe("savedThemeOptionsSchema", () => {
    const options = { themeName: "acme-login", login: defaultLoginThemeConfig, email: {} };

    it("accepts an ordinary theme", () => {
        expect(savedThemeOptionsSchema.safeParse(options).success).toBe(true);
    });

    it("rejects a name that can't be exported", () => {
        expect(savedThemeOptionsSchema.safeParse({ ...options, themeName: "My Theme" }).success).toBe(false);
    });

    it("rejects an inline image hidden in a URL field", () => {
        const logoUrl = `data:image/png;base64,${"A".repeat(MAX_URL_LENGTH)}`;

        expect(
            savedThemeOptionsSchema.safeParse({ ...options, login: { ...defaultLoginThemeConfig, logoUrl } }).success,
        ).toBe(false);
        expect(savedThemeOptionsSchema.safeParse({ ...options, email: { logoUrl } }).success).toBe(false);
    });
});

describe("isSameThemeDocument", () => {
    const logo = png("logo.png");
    const saved = makeTheme({ assets: { ...emptyAssets, logoUrl: logo }, email: { primary: "rose" } });

    it("ignores key order and absent optional fields", () => {
        const reordered = makeTheme({
            login: Object.fromEntries(Object.entries(saved.login).toReversed()) as ParsedTheme["login"],
            assets: { ...emptyAssets, logoUrl: logo },
            email: { logoUrl: undefined, primary: "rose" },
        });

        expect(isSameThemeDocument(saved, reordered)).toBe(true);
    });

    it("sees a changed value", () => {
        expect(isSameThemeDocument(saved, { ...saved, login: { ...saved.login, radius: "large" } })).toBe(false);
        expect(isSameThemeDocument(saved, { ...saved, themeName: "other" })).toBe(false);
    });

    it("sees a replaced or removed file", () => {
        expect(isSameThemeDocument(saved, { ...saved, assets: { ...emptyAssets, logoUrl: png("logo.png") } })).toBe(
            false,
        );
        expect(isSameThemeDocument(saved, { ...saved, assets: emptyAssets })).toBe(false);
    });
});
