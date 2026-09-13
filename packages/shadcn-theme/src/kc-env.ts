import type {
    BasePalette,
    FontFamily,
    Layout,
    PrimaryPreset,
    RadiusPreset,
    SidePanelPosition,
} from "./login/theme/ThemeTypes";

export type KcEnv = {
    SHADCN_THEME_LOGO_URL: string;
    SHADCN_THEME_LOGO_DARK_URL: string;
    SHADCN_THEME_LAYOUT: Layout;
    SHADCN_THEME_ASIDE_IMAGE_URL: string;
    SHADCN_THEME_CARD_IMAGE_URL: string;
    SHADCN_THEME_SIDE_PANEL_IMAGE_URL: string;
    SHADCN_THEME_SIDE_PANEL_IMAGE_DARK_URL: string;
    SHADCN_THEME_PRIMARY: PrimaryPreset;
    SHADCN_THEME_BASE: BasePalette;
    SHADCN_THEME_RADIUS: RadiusPreset;
    SHADCN_THEME_FONT: FontFamily;
    SHADCN_THEME_SHOW_PLACEHOLDER: boolean;
    SHADCN_THEME_SHOW_REALM_NAME: boolean;
    SHADCN_THEME_SIDE_PANEL_POSITION: SidePanelPosition;
    SHADCN_THEME_WELCOME_MESSAGE: string;
    SHADCN_EMAIL_PRIMARY_COLOR: string;
    SHADCN_EMAIL_FOREGROUND_COLOR: string;
    SHADCN_EMAIL_LOGO_URL: string;
};

export const KC_ENV_DEFAULTS = {
    SHADCN_THEME_LOGO_URL: "",
    SHADCN_THEME_LOGO_DARK_URL: "",
    SHADCN_THEME_LAYOUT: "two-column",
    SHADCN_THEME_ASIDE_IMAGE_URL: "",
    SHADCN_THEME_CARD_IMAGE_URL: "",
    SHADCN_THEME_SIDE_PANEL_IMAGE_URL: "",
    SHADCN_THEME_SIDE_PANEL_IMAGE_DARK_URL: "",
    SHADCN_THEME_PRIMARY: "neutral",
    SHADCN_THEME_BASE: "neutral",
    SHADCN_THEME_RADIUS: "default",
    SHADCN_THEME_FONT: "geist",
    SHADCN_THEME_SHOW_PLACEHOLDER: true,
    SHADCN_THEME_SHOW_REALM_NAME: true,
    SHADCN_THEME_SIDE_PANEL_POSITION: "right",
    SHADCN_THEME_WELCOME_MESSAGE: "",
    SHADCN_EMAIL_PRIMARY_COLOR: "#171717",
    SHADCN_EMAIL_FOREGROUND_COLOR: "#fafafa",
    SHADCN_EMAIL_LOGO_URL: "",
} as const satisfies KcEnv;

export type KcEnvName = keyof KcEnv;

/**
 * Typed value → the string Keycloak stores in `theme.properties` / env vars.
 * The single write-side conversion: used for Keycloakify's `environmentVariables`
 * defaults and by the editor when it bakes a config into properties.
 */
export function serializeKcEnvValue(value: KcEnv[KcEnvName]): string {
    return typeof value === "boolean" ? String(value) : value;
}

function parseBoolean(raw: string, fallback: boolean): boolean {
    if (raw === "true") return true;
    if (raw === "false") return false;
    return fallback;
}

/**
 * Keycloak's raw string properties → typed {@link KcEnv}. The single read-side
 * conversion. Booleans accept exactly `"true"` / `"false"`; anything else
 * (missing, empty, typo) falls back to the default in {@link KC_ENV_DEFAULTS}.
 * Enum-like keys are passed through as-is; their validation lives in
 * `login/theme/ThemeUtils.ts`.
 */
export function parseKcEnv(properties: Record<KcEnvName, string>): KcEnv {
    return {
        ...properties,
        SHADCN_THEME_SHOW_PLACEHOLDER: parseBoolean(
            properties.SHADCN_THEME_SHOW_PLACEHOLDER,
            KC_ENV_DEFAULTS.SHADCN_THEME_SHOW_PLACEHOLDER,
        ),
        SHADCN_THEME_SHOW_REALM_NAME: parseBoolean(
            properties.SHADCN_THEME_SHOW_REALM_NAME,
            KC_ENV_DEFAULTS.SHADCN_THEME_SHOW_REALM_NAME,
        ),
    } as KcEnv;
}

/** The shape Keycloakify's `environmentVariables` option expects. */
export const kcEnvironmentVariables = (Object.keys(KC_ENV_DEFAULTS) as KcEnvName[]).map(name => ({
    name,
    default: serializeKcEnvValue(KC_ENV_DEFAULTS[name]),
}));
