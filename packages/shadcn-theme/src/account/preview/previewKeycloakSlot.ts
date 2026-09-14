import type { Keycloak } from "oidc-spa/keycloak-js";

/**
 * What the console actually touches on the client. Structural on purpose: the
 * editor builds the client with *its* copy of oidc-spa, and TypeScript treats the
 * two installs' `Keycloak` classes as unrelated (private fields), so accepting the
 * class itself would force a cast at every call site.
 */
export type PreviewKeycloak = Pick<
    Keycloak,
    "authenticated" | "token" | "tokenParsed" | "idTokenParsed" | "updateToken" | "login" | "logout"
>;

let previewKeycloak: Keycloak | undefined;

/**
 * The editor constructs and initialises the oidc-spa client with its own copy of
 * oidc-spa (the one whose early init ran in the document) and hands it over here
 * before the preview UI mounts. `KcAccountUiLoader` renders the UI with no props,
 * hence a module-level slot rather than a prop.
 */
export function setPreviewKeycloak(keycloak: PreviewKeycloak) {
    // Same class, different install; `KeycloakProvider` wants the nominal type.
    previewKeycloak = keycloak as Keycloak;
}

export function getPreviewKeycloak(): Keycloak {
    if (!previewKeycloak) {
        throw new Error("setPreviewKeycloak must be called before the account preview UI mounts");
    }
    return previewKeycloak;
}
