import type { ThemeAssetKey } from "./model/assets";
import type { EmailThemeConfig, LoginThemeConfig } from "./model/theme-config";
import { getThemeFile, themeFileSlots } from "./theme-form-data";

/** The editor document: what gets saved, exported and compared. */
export type ParsedTheme = {
    themeName: string;
    login: LoginThemeConfig;
    assets: Record<ThemeAssetKey, File | null>;
    email: EmailThemeConfig;
    emailLogoFile: File | null;
};

function sameFields(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].every(key => a[key] === b[key]);
}

/**
 * Whether two editor documents would save identically: is the open theme
 * still what was last loaded or saved? Configs are compared by value, so
 * changing a setting and changing it back counts as unchanged, and a field
 * set to `undefined` equals a missing one. Files are compared by identity,
 * since an untouched upload keeps its `File`.
 */
export function isSameThemeDocument(a: ParsedTheme, b: ParsedTheme): boolean {
    return (
        a.themeName === b.themeName &&
        sameFields(a.login, b.login) &&
        sameFields(a.email, b.email) &&
        themeFileSlots.every(slot => getThemeFile(a, slot) === getThemeFile(b, slot))
    );
}
