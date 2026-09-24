import type { TFunction } from "i18next";
import { render } from "jsx-email";
import type { ComponentType } from "react";

import type { PrimaryPreset } from "#/login/theme";

import i18n from "./i18n";
import type { EmailTemplateId } from "./templates-meta";
import { Template as emailTest } from "./templates/email-test";
import { Template as emailUpdateConfirmation } from "./templates/email-update-confirmation";
import { Template as emailVerification } from "./templates/email-verification";
import { Template as eventLoginError } from "./templates/event-login_error";
import { Template as eventRemoveCredential } from "./templates/event-remove_credential";
import { Template as eventRemoveTotp } from "./templates/event-remove_totp";
import { Template as eventUpdateCredential } from "./templates/event-update_credential";
import { Template as eventUpdatePassword } from "./templates/event-update_password";
import { Template as eventUpdateTotp } from "./templates/event-update_totp";
import { Template as eventUserDisabledByPermanentLockout } from "./templates/event-user_disabled_by_permanent_lockout";
import { Template as eventUserDisabledByTemporaryLockout } from "./templates/event-user_disabled_by_temporary_lockout";
import { Template as executeActions } from "./templates/executeActions";
import { Template as identityProviderLink } from "./templates/identity-provider-link";
import { Template as orgInvite } from "./templates/org-invite";
import { Template as passwordReset } from "./templates/password-reset";
import { Template as verifiableCredentialOffer } from "./templates/verifiable-credential-offer";
import { Template as workflowNotification } from "./templates/workflow-notification";
import { resolveEmailTheme } from "./theme/resolve-email-theme";
import type { EmailTheme } from "./theme/theme";

export type { EmailTemplateId } from "./templates-meta";

type PreviewTemplate = ComponentType<{
    locale: string;
    themeName: string;
    t: TFunction;
    theme: EmailTheme;
}>;

const TEMPLATES: Record<EmailTemplateId, PreviewTemplate> = {
    "email-test": emailTest,
    "email-update-confirmation": emailUpdateConfirmation,
    "email-verification": emailVerification,
    "event-login_error": eventLoginError,
    "event-remove_credential": eventRemoveCredential,
    "event-remove_totp": eventRemoveTotp,
    "event-update_credential": eventUpdateCredential,
    "event-update_password": eventUpdatePassword,
    "event-update_totp": eventUpdateTotp,
    "event-user_disabled_by_permanent_lockout": eventUserDisabledByPermanentLockout,
    "event-user_disabled_by_temporary_lockout": eventUserDisabledByTemporaryLockout,
    executeActions: executeActions,
    "identity-provider-link": identityProviderLink,
    "org-invite": orgInvite,
    "password-reset": passwordReset,
    "verifiable-credential-offer": verifiableCredentialOffer,
    "workflow-notification": workflowNotification,
};

/**
 * Mock values for the Keycloak runtime `${...}` variables that survive rendering.
 * The template copy itself comes from i18next; only these interpolated variables
 * remain as tokens, so we swap them for readable sample data in the preview.
 */
const MOCK_VARS: Record<string, string> = {
    realmName: "Keycloakify Editor",
    "user.firstName": "Jane",
    "user.username": "jane.doe",
    link: "https://example.com/action",
    "linkExpirationFormatter(linkExpiration)": "5 hours",
    "event.date": "June 1, 2024, 12:00 PM",
    "event.ipAddress": "192.168.1.1",
    'event.details.credential_type!"unknown"': "Password",
    newEmail: "jane.new@example.com",
    identityProviderDisplayName: "Google",
    "identityProviderContext.username": "jane.doe",
    firstName: "Jane",
    lastName: "Doe",
    "organization.name": "Acme Inc.",
    credentialScopeDisplayName: "Digital Badge",
};

function fillMocks(html: string): string {
    return html.replace(/\$\{([^}]+)\}/g, (_match, expr: string) => {
        const key = expr.trim();
        return MOCK_VARS[key] ?? `[${key}]`; // readable fallback for unmapped ones
    });
}

type EmailThemeOptions = {
    primaryColor: PrimaryPreset;
    logoUrl?: string;
};

export async function renderEmailPreview(opts: {
    templateId: EmailTemplateId;
    locale: string;
    theme: EmailThemeOptions;
    plainText: boolean | undefined;
}): Promise<string> {
    const Template = TEMPLATES[opts.templateId];
    if (!Template) {
        throw new Error(`Unknown email template: ${opts.templateId}`);
    }
    const t = i18n.getFixedT(opts.locale);
    const theme = resolveEmailTheme(opts.theme.primaryColor, opts.theme.logoUrl);
    const html = await render(<Template locale={opts.locale} t={t} theme={theme} themeName="vanilla" />, {
        plainText: opts.plainText ? opts.plainText : false,
    });
    return fillMocks(html);
}
