import type { KcEnvName } from "@keycloakify-editor/shadcn-theme/theme";

/**
 * Config field → `SHADCN_THEME_*` env-var name. it lets `themeConfigToProperties`,
 * `assetDefinitions` and the JAR import translate `LoginThemeConfig` fields into
 * the theme's properties. `satisfies …KcEnvName` ties every value to the theme's
 * env-var contract (`KC_ENV_DEFAULTS`),
 */
export const THEME_PROPERTY_KEYS = {
    layout: "SHADCN_THEME_LAYOUT",
    base: "SHADCN_THEME_BASE",
    primary: "SHADCN_THEME_PRIMARY",
    radius: "SHADCN_THEME_RADIUS",
    font: "SHADCN_THEME_FONT",
    showPlaceholder: "SHADCN_THEME_SHOW_PLACEHOLDER",
    showRealmName: "SHADCN_THEME_SHOW_REALM_NAME",
    logoUrl: "SHADCN_THEME_LOGO_URL",
    logoDarkUrl: "SHADCN_THEME_LOGO_DARK_URL",
    asideImageUrl: "SHADCN_THEME_ASIDE_IMAGE_URL",
    cardImageUrl: "SHADCN_THEME_CARD_IMAGE_URL",
    sidePanelImageUrl: "SHADCN_THEME_SIDE_PANEL_IMAGE_URL",
    sidePanelImageDarkUrl: "SHADCN_THEME_SIDE_PANEL_IMAGE_DARK_URL",
    sidePanelPosition: "SHADCN_THEME_SIDE_PANEL_POSITION",
    welcomeMessage: "SHADCN_THEME_WELCOME_MESSAGE",
} as const satisfies Record<string, KcEnvName>;

export const EMAIL_PROPERTY_KEYS = {
    primaryColor: "SHADCN_EMAIL_PRIMARY_COLOR",
    foregroundColor: "SHADCN_EMAIL_FOREGROUND_COLOR",
    logoUrl: "SHADCN_EMAIL_LOGO_URL",
} as const satisfies Record<string, KcEnvName>;

export type ThemePropertyKey = (typeof THEME_PROPERTY_KEYS)[keyof typeof THEME_PROPERTY_KEYS];
export type EmailPropertyKey = (typeof EMAIL_PROPERTY_KEYS)[keyof typeof EMAIL_PROPERTY_KEYS];
