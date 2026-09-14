import type { KcContextLike } from "@keycloakify/keycloak-account-ui";

import { KC_ENV_DEFAULTS } from "../../kc-env";
import { themeNames } from "../../kc.gen";
import type { KcContext } from "../KcContext";

/** The Keycloak ≥ 25 variant, so `serverBaseUrl` and friends are known to exist. */
export type AccountPreviewKcContext = KcContext & KcContextLike.Keycloak25AndUp;

export type AccountFeatureFlags = {
    identityFederationEnabled: boolean;
    userManagedAccessAllowed: boolean;
    isAuthorizationEnabled: boolean;
    deleteAccountAllowed: boolean;
    updateEmailFeatureEnabled: boolean;
    updateEmailActionEnabled: boolean;
    isViewApplicationsEnabled: boolean;
    isViewGroupsEnabled: boolean;
    isViewOrganizationsEnabled: boolean;
    isOid4VciEnabled: boolean;
    isInternationalizationEnabled: boolean;
    registrationEmailAsUsername: boolean;
    editUsernameAllowed: boolean;
};

/**
 * Keycloak does not expose a realm's feature flags to a regular user, so the
 * preview cannot fetch them. They only decide which pages the console lists in
 * its side navigation; everything on shows every page.
 */
export const defaultAccountFeatureFlags: AccountFeatureFlags = {
    identityFederationEnabled: true,
    userManagedAccessAllowed: true,
    isAuthorizationEnabled: true,
    deleteAccountAllowed: true,
    updateEmailFeatureEnabled: true,
    updateEmailActionEnabled: true,
    isViewApplicationsEnabled: true,
    isViewGroupsEnabled: true,
    isViewOrganizationsEnabled: true,
    isOid4VciEnabled: true,
    isInternationalizationEnabled: true,
    registrationEmailAsUsername: true,
    editUsernameAllowed: true,
};

export type AccountKcContextParams = {
    serverBaseUrl: string;
    realm: string;
    clientId: string;
    /** Root-relative path this document is mounted at, e.g. `/preview/account/`. */
    consolePath: string;
    locale: string;
    properties?: Partial<KcContext["properties"]>;
    features?: Partial<AccountFeatureFlags>;
};

/**
 * The configuration Keycloak would have embedded in the account console page
 * (Keycloak ≥ 25 shape). The console is served by the editor here, so the
 * editor writes it instead: the server, realm and client come from its own
 * login; the mount point is this document's own URL.
 *
 * `KcAccountUiLoader` fingerprints this object and reloads the page if a later
 * render passes a different one, so callers must build it once per document.
 */
export function createAccountKcContext(params: AccountKcContextParams): AccountPreviewKcContext {
    const { serverBaseUrl, realm, clientId, consolePath, locale, properties, features } = params;

    const path = consolePath.endsWith("/") ? consolePath : `${consolePath}/`;
    const scheme = window.location.protocol.replace(/:$/, "");
    const authority = window.location.host;
    const flags = { ...defaultAccountFeatureFlags, ...features };

    return {
        themeType: "account",
        themeName: themeNames[0],
        realm: {
            name: realm,
            registrationEmailAsUsername: flags.registrationEmailAsUsername,
            editUsernameAllowed: flags.editUsernameAllowed,
            isInternationalizationEnabled: flags.isInternationalizationEnabled,
            identityFederationEnabled: flags.identityFederationEnabled,
            userManagedAccessAllowed: flags.userManagedAccessAllowed,
        },
        serverBaseUrl,
        authUrl: `${serverBaseUrl}/`,
        authServerUrl: `${serverBaseUrl}/`,
        clientId,
        // Static console assets (passkey icons). Nothing serves them here; they fall back silently.
        resourceUrl: `${path}resources`,
        // Keycloak's split form of the console URL; the loader rebuilds `environment.baseUrl`
        // from `scheme` + `rawSchemeSpecificPart`, and the router takes its base path from it.
        baseUrl: {
            scheme,
            authority,
            path,
            rawSchemeSpecificPart: `//${authority}${path}`,
        },
        locale,
        isAuthorizationEnabled: flags.isAuthorizationEnabled,
        deleteAccountAllowed: flags.deleteAccountAllowed,
        updateEmailFeatureEnabled: flags.updateEmailFeatureEnabled,
        updateEmailActionEnabled: flags.updateEmailActionEnabled,
        isViewApplicationsEnabled: flags.isViewApplicationsEnabled,
        isViewGroupsEnabled: flags.isViewGroupsEnabled,
        isViewOrganizationsEnabled: flags.isViewOrganizationsEnabled,
        isOid4VciEnabled: flags.isOid4VciEnabled,
        darkMode: true,
        referrerName: "",
        scope: "",
        properties: { ...KC_ENV_DEFAULTS, ...properties } as KcContext["properties"],
    };
}
