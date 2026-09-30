import { useEffect } from "react";

import { useKcContext } from "#/login/KcContext.ts";

// see https://github.com/keycloak/keycloak/blob/main/themes/src/main/resources/theme/base/login/resources/js/authChecker.js

const SESSION_POLLING_INTERVAL_MS = 2000;
const AUTH_SESSION_TIMEOUT_MS = 1000;

function getCookieByName(name: string) {
    for (const cookie of document.cookie.split(";")) {
        const [key, value] = cookie.split("=").map(part => part.trim());
        if (key === name) {
            return value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
        }
    }
    return null;
}

export function useAuthChecker() {
    const { kcContext } = useKcContext();

    /**
     * Checks if the current tab's authentication session ID matches the one stored in the browser cookie.
     *
     * If the user opens the login page in Tab A, then opens it again in Tab B, the server might generate
     * a new session ID. Tab A is now "stale". If the user tries to log in on Tab A, it would fail.
     * This hook detects that mismatch and refreshes the page to get the new ID.
     */
    useEffect(() => {
        if (kcContext.authenticationSession === undefined) {
            return;
        }

        const { authSessionIdHash } = kcContext.authenticationSession;

        const timer = setTimeout(() => {
            const authSessionIdHashCookie = getCookieByName("KC_AUTH_SESSION_HASH");
            // If the cookie exists, but doesn't match the ID in our current HTML/Context
            if (authSessionIdHashCookie && authSessionIdHashCookie !== authSessionIdHash) {
                location.reload();
            }
        }, AUTH_SESSION_TIMEOUT_MS);

        return () => clearTimeout(timer);
    }, []);

    /**
     * Polls for a valid KEYCLOAK_SESSION cookie every few seconds.
     *
     * If the user leaves this tab open and logs into the app via a different tab (SSO),
     * this hook detects the new session and automatically redirects this tab to the success URL.
     */
    useEffect(() => {
        const keycloakSessionCookie = () => getCookieByName("KEYCLOAK_SESSION");

        // If we already have a session upon loading, do nothing
        if (keycloakSessionCookie() !== null) {
            return;
        }

        let timer: ReturnType<typeof setTimeout>;

        const poll = () => {
            if (keycloakSessionCookie() === null) {
                // No session yet, check again in 2 seconds
                timer = setTimeout(poll, SESSION_POLLING_INTERVAL_MS);
                return;
            }

            location.href = kcContext.url.ssoLoginInOtherTabsUrl;
        };

        const handleFormSubmit = () => {
            clearTimeout(timer);
        };

        const handleBeforeUnload = () => {
            clearTimeout(timer);
        };

        const forms = Array.from(document.forms);
        forms.forEach(form => {
            form.addEventListener("submit", handleFormSubmit);
        });

        globalThis.addEventListener("beforeunload", handleBeforeUnload);

        poll();

        return () => {
            clearTimeout(timer);
            forms.forEach(form => {
                form.removeEventListener("submit", handleFormSubmit);
            });
            globalThis.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);
}
