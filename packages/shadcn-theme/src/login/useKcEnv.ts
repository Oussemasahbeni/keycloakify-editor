import { type KcEnv, parseKcEnv } from "#/kc-env";

import { useKcContext } from "./KcContext";

/**
 * `kcContext.properties` parsed into typed values (see `parseKcEnv`).
 * Read env vars through this instead of `kcContext.properties` so boolean flags
 * are real booleans and the string form never leaks past the Keycloak boundary.
 */
export function useKcEnv(): KcEnv {
    const { kcContext } = useKcContext();

    return parseKcEnv(kcContext.properties);
}
