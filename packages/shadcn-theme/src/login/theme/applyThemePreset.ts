import { useLayoutEffect } from "react";

import type { KcEnvName } from "#/kc.gen.tsx";

import { resolveRadiusPreset, resolveThemeFont, resolveThemeTokens } from "./ThemeUtils";

/**
 * Maps semantic theme tokens to the runtime CSS variables consumed by `index.css`.
 * We write both light and dark values up front so the `.dark` class can switch
 * instantly without recomputing the palette.
 */
const themeCssVars = {
    light: {
        background: "--keycloakify-shadcn-background",
        foreground: "--keycloakify-shadcn-foreground",
        card: "--keycloakify-shadcn-card",
        cardForeground: "--keycloakify-shadcn-card-foreground",
        popover: "--keycloakify-shadcn-popover",
        popoverForeground: "--keycloakify-shadcn-popover-foreground",
        primary: "--keycloakify-shadcn-primary",
        primaryForeground: "--keycloakify-shadcn-primary-foreground",
        secondary: "--keycloakify-shadcn-secondary",
        secondaryForeground: "--keycloakify-shadcn-secondary-foreground",
        muted: "--keycloakify-shadcn-muted",
        mutedForeground: "--keycloakify-shadcn-muted-foreground",
        accent: "--keycloakify-shadcn-accent",
        accentForeground: "--keycloakify-shadcn-accent-foreground",
        border: "--keycloakify-shadcn-border",
        input: "--keycloakify-shadcn-input",
        ring: "--keycloakify-shadcn-ring",
        sidePanel: "--keycloakify-shadcn-side-panel",
        sidePanelForeground: "--keycloakify-shadcn-side-panel-foreground",
    },
    dark: {
        background: "--keycloakify-shadcn-dark-background",
        foreground: "--keycloakify-shadcn-dark-foreground",
        card: "--keycloakify-shadcn-dark-card",
        cardForeground: "--keycloakify-shadcn-dark-card-foreground",
        popover: "--keycloakify-shadcn-dark-popover",
        popoverForeground: "--keycloakify-shadcn-dark-popover-foreground",
        primary: "--keycloakify-shadcn-dark-primary",
        primaryForeground: "--keycloakify-shadcn-dark-primary-foreground",
        secondary: "--keycloakify-shadcn-dark-secondary",
        secondaryForeground: "--keycloakify-shadcn-dark-secondary-foreground",
        muted: "--keycloakify-shadcn-dark-muted",
        mutedForeground: "--keycloakify-shadcn-dark-muted-foreground",
        accent: "--keycloakify-shadcn-dark-accent",
        accentForeground: "--keycloakify-shadcn-dark-accent-foreground",
        border: "--keycloakify-shadcn-dark-border",
        input: "--keycloakify-shadcn-dark-input",
        ring: "--keycloakify-shadcn-dark-ring",
        sidePanel: "--keycloakify-shadcn-dark-side-panel",
        sidePanelForeground: "--keycloakify-shadcn-dark-side-panel-foreground",
    },
} as const;

type ThemeTokenKey = keyof (typeof themeCssVars)["light"];
type ThemeCssVarMap = Record<ThemeTokenKey, string>;

export type ThemePresetProperties = Pick<
    Record<KcEnvName, string>,
    "SHADCN_THEME_PRIMARY" | "SHADCN_THEME_BASE" | "SHADCN_THEME_RADIUS" | "SHADCN_THEME_FONT"
>;

function applyThemeCssVars(params: {
    style: CSSStyleDeclaration;
    theme: Record<ThemeTokenKey, string>;
    cssVars: ThemeCssVarMap;
}) {
    const { style, theme, cssVars } = params;

    for (const token of Object.keys(cssVars) as ThemeTokenKey[]) {
        style.setProperty(cssVars[token], theme[token]);
    }
}

/**
 * Writes the resolved theme preset (colors, radius, font) to `:root`.
 * Shared by the login theme and the account console so both read the same
 * `SHADCN_THEME_*` properties and produce identical tokens.
 */
export function applyThemePreset(properties: ThemePresetProperties) {
    const { SHADCN_THEME_PRIMARY, SHADCN_THEME_BASE, SHADCN_THEME_RADIUS, SHADCN_THEME_FONT } = properties;

    const root = document.documentElement;
    const theme = resolveThemeTokens({
        preset: SHADCN_THEME_PRIMARY,
        base: SHADCN_THEME_BASE,
    });
    const radius = resolveRadiusPreset(SHADCN_THEME_RADIUS);

    applyThemeCssVars({
        style: root.style,
        theme: theme.light,
        cssVars: themeCssVars.light,
    });
    applyThemeCssVars({
        style: root.style,
        theme: theme.dark,
        cssVars: themeCssVars.dark,
    });

    root.style.setProperty("--keycloakify-shadcn-font", resolveThemeFont(SHADCN_THEME_FONT));

    if (radius) {
        root.style.setProperty("--keycloakify-shadcn-radius", radius);
        return;
    }

    root.style.removeProperty("--keycloakify-shadcn-radius");
}

export function useApplyThemePresetFromProperties(properties: ThemePresetProperties) {
    const { SHADCN_THEME_PRIMARY, SHADCN_THEME_BASE, SHADCN_THEME_RADIUS, SHADCN_THEME_FONT } = properties;

    useLayoutEffect(() => {
        applyThemePreset({ SHADCN_THEME_PRIMARY, SHADCN_THEME_BASE, SHADCN_THEME_RADIUS, SHADCN_THEME_FONT });
    }, [SHADCN_THEME_PRIMARY, SHADCN_THEME_BASE, SHADCN_THEME_RADIUS, SHADCN_THEME_FONT]);
}
