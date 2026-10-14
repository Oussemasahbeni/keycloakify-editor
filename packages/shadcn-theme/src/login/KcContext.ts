import { type ExtendKcContext, createUseKcContext } from "@keycloakify/login-ui/KcContext";

import type { KcEnvName, ThemeName } from "../kc.gen";

export type KcContextExtension = {
    themeName: ThemeName;
    properties: Record<KcEnvName, string> & {};
    // NOTE: Here you can declare more properties to extend the KcContext
    // See: https://docs.keycloakify.dev/faq-and-help/some-values-you-need-are-missing-from-in-kccontext
    client: {
        baseUrl?: string;
    };
    darkMode?: boolean;
};

/**
 * Pages that base Keycloak doesn't ship, contributed by server extensions.
 * See: https://docs.keycloakify.dev/features/styling-a-custom-page-not-included-in-base-keycloak
 */
export type KcContextExtensionPerPage = {
    // Phase Two magic link extension: https://github.com/p2-inc/keycloak-magic-link
    "otp-form.ftl": {
        auth: {
            attemptedUsername: string;
        };
        url: {
            loginRestartFlowUrl: string;
            loginAction: string;
        };
    };
    "email-confirmation.ftl": {
        magicLinkContinuation: {
            sameBrowser: boolean;
            url: string;
        };
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    "email-confirmation-error.ftl": {};
    "view-email.ftl": {
        auth: {
            attemptedUsername: string;
        };
    };
    "view-email-continuation.ftl": {
        auth: {
            attemptedUsername: string;
        };
        tabId: string;
        /** Returns `{ state: "pending" | "confirmed" | "expired", expires_in: number }`. */
        pollingUrl: string;
    };
    "view-activation-sent.ftl": {
        auth: {
            attemptedUsername: string;
        };
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    "login-token-form.ftl": {};
    "login-token-user-switch.ftl": {
        currentUsername: string;
        targetUsername: string;
    };
    "cf-captcha.ftl": {
        auth: {
            selectedCredential?: string;
        };
        captchaSiteKey: string;
        captchaAction: string;
        captchaLanguage: string;
    };
};

export type KcContext = ExtendKcContext<KcContextExtension, KcContextExtensionPerPage>;

export const { useKcContext, KcContextProvider } = createUseKcContext<KcContext>();
