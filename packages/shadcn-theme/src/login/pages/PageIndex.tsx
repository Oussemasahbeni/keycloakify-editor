import { Suspense, lazy } from "react";

import { useKcContext } from "../KcContext";

const PageLogin = lazy(() => import("./login"));
const PageRegister = lazy(() => import("./register"));
const PageInfo = lazy(() => import("./info"));
const PageError = lazy(() => import("./error"));
const PageLoginResetPassword = lazy(() => import("./login-reset-password"));
const PageLoginVerifyEmail = lazy(() => import("./login-verify-email"));
const PageTerms = lazy(() => import("./terms"));
const PageLoginOauth2DeviceVerifyUserCode = lazy(() => import("./login-oauth2-device-verify-user-code"));
const PageLoginOauthGrant = lazy(() => import("./login-oauth-grant"));
const PageLoginOtp = lazy(() => import("./login-otp"));
const PageLoginPassword = lazy(() => import("./login-password"));
const PageLoginUsername = lazy(() => import("./login-username"));
const PageWebauthnAuthenticate = lazy(() => import("./webauthn-authenticate"));
const PageWebauthnRegister = lazy(() => import("./webauthn-register"));
const PageLoginUpdatePassword = lazy(() => import("./login-update-password"));
const PageLinkIdpAction = lazy(() => import("./link-idp-action"));
const PageLoginUpdateProfile = lazy(() => import("./login-update-profile"));
const PageLoginIdpLinkConfirm = lazy(() => import("./login-idp-link-confirm"));
const PageLoginPageExpired = lazy(() => import("./login-page-expired"));
const PageLoginIdpLinkEmail = lazy(() => import("./login-idp-link-email"));
const PageLoginConfigTotp = lazy(() => import("./login-config-totp"));
const PageLogoutConfirm = lazy(() => import("./logout-confirm"));
const PageIdpReviewUserProfile = lazy(() => import("./idp-review-user-profile"));
const PageUpdateEmail = lazy(() => import("./update-email"));
const PageSelectAuthenticator = lazy(() => import("./select-authenticator"));
const PageSamlPostForm = lazy(() => import("./saml-post-form"));
const PageDeleteCredential = lazy(() => import("./delete-credential"));
const PageCode = lazy(() => import("./code"));
const PageDeleteAccountConfirm = lazy(() => import("./delete-account-confirm"));
const PageFrontchannelLogout = lazy(() => import("./frontchannel-logout"));
const PageLoginRecoveryAuthnCodeConfig = lazy(() => import("./login-recovery-authn-code-config"));
const PageLoginRecoveryAuthnCodeInput = lazy(() => import("./login-recovery-authn-code-input"));
const PageLoginResetOtp = lazy(() => import("./login-reset-otp"));
const PageLoginX509Info = lazy(() => import("./login-x509-info"));
const PageWebauthnError = lazy(() => import("./webauthn-error"));
const PageLoginPasskeysConditionalAuthenticate = lazy(() => import("./login-passkeys-conditional-authenticate"));
const PageLoginIdpLinkConfirmOverride = lazy(() => import("./login-idp-link-confirm-override"));
const PageSelectOrganization = lazy(() => import("./select-organization"));

// Extension pages: not part of base Keycloak, rendered by server extensions (Phase Two magic link).
const PageOtpForm = lazy(() => import("./otp-form"));
const PageEmailConfirmation = lazy(() => import("./email-confirmation"));
const PageEmailConfirmationError = lazy(() => import("./email-confirmation-error"));
const PageViewEmail = lazy(() => import("./view-email"));
const PageViewEmailContinuation = lazy(() => import("./view-email-continuation"));
const PageViewActivationSent = lazy(() => import("./view-activation-sent"));
const PageLoginTokenForm = lazy(() => import("./login-token-form"));
const PageLoginTokenUserSwitch = lazy(() => import("./login-token-user-switch"));
const PageCfCaptcha = lazy(() => import("./cf-captcha"));

export function PageIndex() {
    const { kcContext } = useKcContext();

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return <PageLogin />;
                    case "register.ftl":
                        return <PageRegister />;
                    case "info.ftl":
                        return <PageInfo />;
                    case "error.ftl":
                        return <PageError />;
                    case "login-reset-password.ftl":
                        return <PageLoginResetPassword />;
                    case "login-verify-email.ftl":
                        return <PageLoginVerifyEmail />;
                    case "terms.ftl":
                        return <PageTerms />;
                    case "login-oauth2-device-verify-user-code.ftl":
                        return <PageLoginOauth2DeviceVerifyUserCode />;
                    case "login-oauth-grant.ftl":
                        return <PageLoginOauthGrant />;
                    case "login-otp.ftl":
                        return <PageLoginOtp />;
                    case "login-username.ftl":
                        return <PageLoginUsername />;
                    case "login-password.ftl":
                        return <PageLoginPassword />;
                    case "webauthn-authenticate.ftl":
                        return <PageWebauthnAuthenticate />;
                    case "webauthn-register.ftl":
                        return <PageWebauthnRegister />;
                    case "login-update-password.ftl":
                        return <PageLoginUpdatePassword />;
                    case "link-idp-action.ftl":
                        return <PageLinkIdpAction />;
                    case "login-update-profile.ftl":
                        return <PageLoginUpdateProfile />;
                    case "login-idp-link-confirm.ftl":
                        return <PageLoginIdpLinkConfirm />;
                    case "login-idp-link-email.ftl":
                        return <PageLoginIdpLinkEmail />;
                    case "login-page-expired.ftl":
                        return <PageLoginPageExpired />;
                    case "login-config-totp.ftl":
                        return <PageLoginConfigTotp />;
                    case "logout-confirm.ftl":
                        return <PageLogoutConfirm />;
                    case "idp-review-user-profile.ftl":
                        return <PageIdpReviewUserProfile />;
                    case "update-email.ftl":
                        return <PageUpdateEmail />;
                    case "select-authenticator.ftl":
                        return <PageSelectAuthenticator />;
                    case "saml-post-form.ftl":
                        return <PageSamlPostForm />;
                    case "delete-credential.ftl":
                        return <PageDeleteCredential />;
                    case "code.ftl":
                        return <PageCode />;
                    case "delete-account-confirm.ftl":
                        return <PageDeleteAccountConfirm />;
                    case "frontchannel-logout.ftl":
                        return <PageFrontchannelLogout />;
                    case "login-recovery-authn-code-config.ftl":
                        return <PageLoginRecoveryAuthnCodeConfig />;
                    case "login-recovery-authn-code-input.ftl":
                        return <PageLoginRecoveryAuthnCodeInput />;
                    case "login-reset-otp.ftl":
                        return <PageLoginResetOtp />;
                    case "login-x509-info.ftl":
                        return <PageLoginX509Info />;
                    case "webauthn-error.ftl":
                        return <PageWebauthnError />;
                    case "login-passkeys-conditional-authenticate.ftl":
                        return <PageLoginPasskeysConditionalAuthenticate />;
                    case "login-idp-link-confirm-override.ftl":
                        return <PageLoginIdpLinkConfirmOverride />;
                    case "select-organization.ftl":
                        return <PageSelectOrganization />;
                    case "otp-form.ftl":
                        return <PageOtpForm />;
                    case "email-confirmation.ftl":
                        return <PageEmailConfirmation />;
                    case "email-confirmation-error.ftl":
                        return <PageEmailConfirmationError />;
                    case "view-email.ftl":
                        return <PageViewEmail />;
                    case "view-email-continuation.ftl":
                        return <PageViewEmailContinuation />;
                    case "view-activation-sent.ftl":
                        return <PageViewActivationSent />;
                    case "login-token-form.ftl":
                        return <PageLoginTokenForm />;
                    case "login-token-user-switch.ftl":
                        return <PageLoginTokenUserSwitch />;
                    case "cf-captcha.ftl":
                        return <PageCfCaptcha />;
                }
            })()}
        </Suspense>
    );
}
