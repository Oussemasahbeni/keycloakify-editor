import { useState } from "react";

import { BASE_THEME_NAME } from "../shared/constants";
import type { ThemeAssetKey } from "../shared/model/assets";
import { emptyAssets } from "../shared/model/assets";
import type { EmailThemeConfig, LoginThemeConfig } from "../shared/model/theme-config";
import { defaultLoginThemeConfig } from "../shared/model/theme-config";
import type { ParsedTheme } from "../shared/theme-document";

const blankTheme: ParsedTheme = {
    themeName: BASE_THEME_NAME,
    login: defaultLoginThemeConfig,
    assets: emptyAssets,
    email: {},
    emailLogoFile: null,
};

/**
 * The theme being edited: name, login and email config, uploaded images. One
 * value, so importing a JAR, restoring a draft and opening a saved theme are
 * all the same `applyTheme` call.
 */
export function useThemeDocument() {
    const [theme, setTheme] = useState<ParsedTheme>(blankTheme);

    return {
        theme,
        /** Replaces the whole document. */
        applyTheme: setTheme,
        setThemeName: (themeName: string) => setTheme(current => ({ ...current, themeName })),
        updateLoginConfig: (patch: Partial<LoginThemeConfig>) =>
            setTheme(current => ({ ...current, login: { ...current.login, ...patch } })),
        updateEmailConfig: (patch: Partial<EmailThemeConfig>) =>
            setTheme(current => ({ ...current, email: { ...current.email, ...patch } })),
        setAssets: (assets: Record<ThemeAssetKey, File | null>) => setTheme(current => ({ ...current, assets })),
        setEmailLogoFile: (emailLogoFile: File | null) => setTheme(current => ({ ...current, emailLogoFile })),
        /** Back to the stock theme, keeping the name. */
        resetConfig: () => setTheme(current => ({ ...blankTheme, themeName: current.themeName })),
    };
}
