import { KC_ENV_DEFAULTS, type KcEnvName } from "#/kc-env";

import { resolveColors } from "./resolve-email-theme";

export type EmailTheme = {
    primaryColor: string;
    foregroundColor: string;
    logoUrl: string | undefined;
    /**
     * True only when rendering the real FreeMarker template (`getTemplate`).
     * The preview renders the same components with resolved values, so it must
     * *not* emit FreeMarker directives (`<#if>`); this flag lets shared
     * components (e.g. the logo gate in `EmailLayout`) branch on the target.
     */
    ftl?: boolean;
};

const colors = resolveColors(KC_ENV_DEFAULTS.SHADCN_THEME_PRIMARY);

// Used by emails:preview and the editor default.
export const defaultEmailTheme: EmailTheme = {
    primaryColor: colors.primaryColor,
    foregroundColor: colors.foregroundColor,
    logoUrl: undefined,
};

/**
 * `properties.X!'<default>'` for one `SHADCN_EMAIL_*` env var, with the default
 * taken from `#/kc-env` (the fallback for a raw install).
 *
 * Email values are always **resolved hex colors** (or a URL), never preset names:
 * Keycloak renders emails through FreeMarker, which only substitutes `${...}` as
 * text and cannot run the preset→hex resolution the login theme does in the
 * browser. So the hex must be baked in ahead of time — the editor writes the
 * resolved value into `theme.properties`.
 */
function ftlProperty<TName extends Extract<KcEnvName, `SHADCN_EMAIL_${string}`>>(name: TName) {
    return `properties.${name}!'${KC_ENV_DEFAULTS[name]}'` as const;
}

/**
 * FreeMarker TOKENS, used only by `getTemplate`. Each color is emitted directly
 * as a `${properties.X!'#default'}` expression — verified to survive jsx-email's
 * inline-style rendering verbatim (including the MSO `fillcolor` VML attribute),
 * so no sentinel/post-render replacement is needed. The foreground reads its own
 * property so it can contrast the primary. Produces e.g.
 * `${properties.SHADCN_EMAIL_PRIMARY_COLOR!'#171717'}`.
 */
export const ftlEmailTheme = (exp: (name: `properties.${string}`) => string): EmailTheme => ({
    primaryColor: exp(ftlProperty("SHADCN_EMAIL_PRIMARY_COLOR")),
    foregroundColor: exp(ftlProperty("SHADCN_EMAIL_FOREGROUND_COLOR")),
    logoUrl: exp(ftlProperty("SHADCN_EMAIL_LOGO_URL")),
    ftl: true,
});
