import { Img, Section } from "jsx-email";
import { Else, exp, If, Then } from "keycloakify-emails/jsx-email";

import type { KcEnvName } from "#/kc-env.ts";

import type { EmailTheme } from "./theme/theme";

const logo = { display: "flex", justifyContent: "center", alignItems: "center", padding: 30 };
const logoImage = {
    display: "block",
    border: "0",
    outline: "none",
    textDecoration: "none",
    width: "auto",
    maxWidth: "100%",
};
function LogoImg({ src }: { src: string }) {
    return (
        <Section style={logo}>
            <Img src={src} height={40} alt={exp("realmName")} style={logoImage} />
        </Section>
    );
}

/**
 * The email header logo, driven by the overloaded `SHADCN_EMAIL_LOGO_URL`:
 * an absolute URL (`http`/`//`) is used as-is; a bare filename (e.g. `logo.png`,
 * an uploaded file baked into the email `resources/` dir) is resolved against
 * `${url.resourcesUrl}`. Empty → no logo (no default ships).
 */
export function EmailLogo({ theme }: { theme: EmailTheme }) {
    const LOGO = "SHADCN_EMAIL_LOGO_URL" satisfies KcEnvName;
    const resourcesUrl = "${url.resourcesUrl}";
    const hasLogo = `(properties.${LOGO}!'')?has_content`;
    const isAbsolute = `(properties.${LOGO}!'')?starts_with('http') || (properties.${LOGO}!'')?starts_with('//')`;

    // preview: already-resolved value, no FreeMarker.
    if (!theme.ftl) {
        return theme.logoUrl ? <LogoImg src={theme.logoUrl} /> : null;
    }

    // build: FreeMarker chooses at send time.
    return (
        <If condition={hasLogo}>
            <If condition={isAbsolute}>
                {/* typed URL → use it directly */}
                <Then>
                    <LogoImg src={exp(`properties.${LOGO}`)} />
                </Then>
                {/* baked upload → ${url.resourcesUrl}/<filename> */}
                <Else>
                    <LogoImg src={`${resourcesUrl}/${exp(`properties.${LOGO}`)}`} />
                </Else>
            </If>
        </If>
    );
}
