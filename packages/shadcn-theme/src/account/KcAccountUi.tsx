/**
 * Owned entry point of the account console (see `src/.gitignore`).
 *
 * Unlike the upstream version, this does NOT load PatternFly at all: every page is
 * owned and written with shadcn/ui, and the console shares the login theme's Tailwind
 * entry (`login/index.css`), its `ThemeProvider` (`.dark` class) and its
 * `SHADCN_THEME_*` presets.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useReducer } from "react";

import "./index.css";

import { ThemeProvider } from "#/components/ThemeProvider";
import { Toaster } from "#/components/ui/toast";
import { getTheme } from "#/lib/getColorScheme";
import { useApplyThemePresetFromProperties } from "#/login/theme/applyThemePreset.ts";

import { KeycloakProvider } from "../shared/keycloak-ui-shared";
import { SessionExpirationWarningOverlay } from "../shared/SessionExpirationWarningOverlay";
import { environment } from "./environment";
import { i18n } from "./i18n/i18n";
import { getKcContext } from "./KcContext";
import { Root } from "./root/Root";

document.title = "Account Management";

const prI18nInitialized = i18n.init();

/**
 * Reads stay fresh for 30s (instant back-navigation, background revalidation), never retry
 * (Keycloak errors are not transient), and throw into the router's ErrorPage like before.
 */
const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: false, throwOnError: true } },
});

export default function KcAccountUi() {
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
                <KeycloakProvider environment={environment}>
                    <Root />
                    <SessionExpirationWarningOverlay warnUserSecondsBeforeAutoLogout={45} />
                    <Toaster />
                </KeycloakProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
