import { createGetKcContextMock } from "@keycloakify/login-ui/KcContext/getKcContextMock";

import { kcEnvDefaults, themeNames } from "../../kc.gen";
import type { KcContextExtension, KcContextExtensionPerPage } from "../KcContext";

const kcContextExtension: KcContextExtension = {
    themeName: themeNames[0],
    client: {
        baseUrl: "https://my-theme.keycloakify.dev",
    },
    darkMode: true,
    properties: {
        ...kcEnvDefaults,
    },
};
const kcContextExtensionPerPage: KcContextExtensionPerPage = {
    "otp-form.ftl": {
        auth: {
            attemptedUsername: "john.doe@gmail.com",
        },
        url: {
            loginRestartFlowUrl: "#",
            loginAction: "#",
        },
    },
    "email-confirmation.ftl": {
        magicLinkContinuation: {
            sameBrowser: true,
            url: "#",
        },
    },
    "email-confirmation-error.ftl": {},
    "view-email.ftl": {
        auth: {
            attemptedUsername: "john.doe@gmail.com",
        },
    },
    "view-email-continuation.ftl": {
        auth: {
            attemptedUsername: "john.doe@gmail.com",
        },
        tabId: "mock-tab-id",
        pollingUrl: "#",
    },
    "view-activation-sent.ftl": {
        auth: {
            attemptedUsername: "john.doe@gmail.com",
        },
    },
    "login-token-form.ftl": {},
    "login-token-user-switch.ftl": {
        currentUsername: "jane.doe@gmail.com",
        targetUsername: "john.doe@gmail.com",
    },
    "cf-captcha.ftl": {
        auth: {},
        // Cloudflare's "always passes" test key; the widget itself only loads on a real Keycloak render.
        captchaSiteKey: "1x00000000000000000000AA",
        captchaAction: "login",
        captchaLanguage: "en",
    },
};

export const { getKcContextMock } = createGetKcContextMock({
    kcContextExtension,
    kcContextExtensionPerPage,
    overrides: {},
    overridesPerPage: {
        // Show the "logging in as … / restart" header the Template renders for these flows.
        "otp-form.ftl": { auth: { showUsername: true } },
        "view-email.ftl": { auth: { showUsername: true } },
        "view-activation-sent.ftl": { auth: { showUsername: true } },
    },
});
