/**
 * Preview twin of `../KcAccountUi.tsx`: identical provider tree, except that the
 * oidc-spa client is not built here. The editor constructs and initialises it
 * (with `sessionRestorationMethod: "full page redirect"`, the one setting that
 * makes the console work inside an iframe) using its own copy of oidc-spa, and
 * hands it over through `setPreviewKeycloak` before this mounts.
 *
 * `KeycloakProvider` skips its own `init()` when handed a client. Only the editor
 * imports this file (through the `./account-preview` export); it is not part of
 * the Keycloak theme build. Keep it in sync with `KcAccountUi`.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useReducer } from "react";

import "../index.css";

import { ThemeProvider } from "#/components/ThemeProvider";
import { Toaster } from "#/components/ui/toast";
import { getTheme } from "#/lib/getColorScheme";
import { useApplyThemePresetFromProperties } from "#/login/theme/applyThemePreset";

import { KeycloakProvider } from "../../shared/keycloak-ui-shared";
import { SessionExpirationWarningOverlay } from "../../shared/SessionExpirationWarningOverlay";
import { environment } from "../environment";
import { i18n } from "../i18n/i18n";
import { getKcContext } from "../KcContext";
import { Root } from "../root/Root";
import { getPreviewKeycloak } from "./previewKeycloakSlot";

const prI18nInitialized = i18n.init();

const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: false, throwOnError: true } },
});

export default function AccountPreviewUi() {
    const { kcContext } = getKcContext();
    const [isI18nInitialized, setI18nInitialized] = useReducer(() => true, false);

    useEffect(() => {
        void prI18nInitialized.then(() => setI18nInitialized());
    }, []);

    useEffect(() => {
        const apply = (language: string) => {
            document.documentElement.lang = language;
            document.documentElement.dir = i18n.dir(language);
        };

        apply(kcContext.locale);
        i18n.on("languageChanged", apply);

        return () => {
            i18n.off("languageChanged", apply);
        };
    }, [kcContext.locale]);

    useApplyThemePresetFromProperties(kcContext.properties);

    if (!isI18nInitialized) {
        return null;
    }

    return (
        <ThemeProvider defaultTheme={getTheme(kcContext.darkMode)}>
            <QueryClientProvider client={queryClient}>
                <KeycloakProvider environment={environment} keycloak={getPreviewKeycloak()}>
                    <Root />
                    <SessionExpirationWarningOverlay warnUserSecondsBeforeAutoLogout={45} />
                    <Toaster />
                </KeycloakProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
