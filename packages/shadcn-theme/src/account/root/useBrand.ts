import { useHref } from "react-router-dom";

import { resolveAssetUrl } from "#/lib/resolveAssetUrl";

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import logoSvgUrl from "../assets/logo.svg";
import { getKcContext } from "../KcContext";
import { useBrandOverrides } from "./brandOverrides";

/**
 * Brand link + logos for the account console. Same configuration as the login
 * theme (`SHADCN_THEME_LOGO_URL` / `SHADCN_THEME_LOGO_DARK_URL`), with the stock
 * Keycloak logo as fallback.
 */
export function useBrand() {
    const { environment } = useEnvironment();
    const { kcContext } = getKcContext();

    const logoUrl = environment.logoUrl ? environment.logoUrl : "/";
    const internalHref = useHref(logoUrl);

    // A URL starting with "/" is internal to the console; anything else is external.
    const href = logoUrl.startsWith("/") ? internalHref : logoUrl;

    // Runtime overrides win over the (mount-time) properties; see `brandOverrides.ts`.
    const overrides = useBrandOverrides();
    const logoProperty = overrides.logoUrl ?? kcContext.properties.SHADCN_THEME_LOGO_URL;
    const logoDarkProperty = overrides.logoDarkUrl ?? kcContext.properties.SHADCN_THEME_LOGO_DARK_URL;

    const logo = resolveAssetUrl(logoProperty) || logoSvgUrl;
    const logoDark = resolveAssetUrl(logoDarkProperty) || logo;

    return { href, logo, logoDark };
}
