/** Theme name baked into the base template JAR; the default when no rename is requested. */
export const BASE_THEME_NAME = "shadcn-theme";

/**
 * Fixed path of the config manifest embedded in every exported JAR. Lives outside
 * the (renamable) `theme/<name>/` dir so import can find it without knowing the
 * theme name first, and is inert to Keycloak's theme scanner.
 */
export const MANIFEST_PATH = "META-INF/keycloakify-editor-theme.json";
