/** A `messagesPerField` mock that reports an error for the given field names. */

import { definePage, fieldError, simplePage } from "./helpers";
import { allSocialProviders, socialProviders } from "./social-providers";
import type { PageGroup, PageId, PagePreview, PageStory } from "./types";
import { pageCategories } from "./types";

export const pages: PagePreview[] = [
    definePage({
        pageId: "login.ftl",
        label: "Login",
        category: "sign-in",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "invalid-credential",
                label: "Invalid credentials",
                overrides: {
                    login: { username: "johndoe" },
                    messagesPerField: fieldError("Invalid username or password.", "username", "password"),
                },
            },
            {
                id: "webauthn",
                label: "WebAuthn (passkeys)",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    enableWebAuthnConditionalUI: true,
                },
            },
            {
                id: "no-registration",
                label: "Registration disabled",
                overrides: { realm: { registrationAllowed: false } },
            },
            {
                id: "no-remember-me",
                label: "Without remember me",
                overrides: { realm: { rememberMe: false } },
            },
            {
                id: "no-password-reset",
                label: "Without password reset",
                overrides: { realm: { resetPasswordAllowed: false } },
            },
            {
                id: "email-as-username",
                label: "Email as username",
                overrides: {
                    realm: { loginWithEmailAllowed: true, registrationEmailAsUsername: true },
                },
            },
            {
                id: "preset-username",
                label: "Preset username",
                overrides: { login: { username: "max.mustermann@mail.com" } },
            },
            {
                id: "immutable-preset-username",
                label: "Immutable preset username",
                overrides: {
                    auth: { attemptedUsername: "max.mustermann@mail.com", showUsername: true },
                    usernameHidden: true,
                    message: { type: "info", summary: "Please re-authenticate to continue" },
                },
            },
            {
                id: "social-providers",
                label: "With social providers",
                overrides: { social: { displayInfo: true, providers: allSocialProviders } },
            },
            {
                id: "no-password-field",
                label: "Without password field",
                overrides: { realm: { password: false } },
            },
            {
                id: "error-message",
                label: "With error banner",
                overrides: {
                    message: {
                        type: "error",
                        summary:
                            "The time allotted for the connection has elapsed.<br/>The login process will restart from the beginning.",
                    },
                },
            },
            {
                id: "one-social-provider",
                label: "One social provider",
                overrides: { social: { displayInfo: true, providers: [socialProviders.google] } },
            },
            {
                id: "two-social-providers",
                label: "Two social providers",
                overrides: {
                    social: {
                        displayInfo: true,
                        providers: [socialProviders.google, socialProviders.microsoft],
                    },
                },
            },
            {
                id: "no-social-providers",
                label: "No social providers",
                overrides: { social: { displayInfo: true, providers: [] } },
            },
            {
                id: "many-social-providers",
                label: "Many social providers",
                overrides: {
                    social: {
                        displayInfo: true,
                        providers: [
                            socialProviders.google,
                            socialProviders.microsoft,
                            socialProviders.facebook,
                            socialProviders.twitter,
                        ],
                    },
                },
            },
            {
                id: "social-providers-no-remember-me",
                label: "Social providers, no remember me",
                overrides: {
                    social: { displayInfo: true, providers: [socialProviders.google] },
                    realm: { rememberMe: false },
                },
            },
        ],
    }),
    definePage({
        pageId: "register.ftl",
        label: "Register",
        category: "registration",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "email-already-exists",
                label: "Email already exists",
                overrides: {
                    profile: {
                        attributesByName: {
                            username: { value: "johndoe" },
                            email: { value: "jhon.doe@gmail.com" },
                            firstName: { value: "John" },
                            lastName: { value: "Doe" },
                        },
                    },
                    messagesPerField: fieldError("Email already exists.", "email"),
                },
            },
            {
                id: "restricted-to-mit-students",
                label: "Restricted email pattern",
                overrides: {
                    profile: {
                        attributesByName: {
                            email: {
                                validators: {
                                    pattern: {
                                        pattern: "^[^@]+@([^.]+\\.)*((mit\\.edu)|(berkeley\\.edu))$",
                                        "error-message": "${profile.attributes.email.pattern.error}",
                                    },
                                },
                                annotations: {
                                    inputHelperTextBefore: "${profile.attributes.email.inputHelperTextBefore}",
                                },
                            },
                        },
                    },
                    "x-keycloakify": {
                        messages: {
                            "profile.attributes.email.inputHelperTextBefore": "Please use your MIT or Berkeley email.",
                            "profile.attributes.email.pattern.error":
                                "This is not an MIT (<strong>@mit.edu</strong>) nor a Berkeley (<strong>@berkeley.edu</strong>) email.",
                        },
                    },
                },
            },
            {
                id: "favorite-pet",
                label: "Select field (favorite pet)",
                overrides: {
                    profile: {
                        attributesByName: {
                            favoritePet: {
                                name: "favorite-pet",
                                displayName: "${profile.attributes.favoritePet}",
                                validators: { options: { options: ["cat", "dog", "fish"] } },
                                annotations: {
                                    inputOptionLabelsI18nPrefix: "profile.attributes.favoritePet.options",
                                },
                                required: false,
                                readOnly: false,
                            },
                        },
                    },
                    "x-keycloakify": {
                        messages: {
                            "profile.attributes.favoritePet": "Favorite Pet",
                            "profile.attributes.favoritePet.options.cat": "Fluffy Cat",
                            "profile.attributes.favoritePet.options.dog": "Loyal Dog",
                            "profile.attributes.favoritePet.options.fish": "Peaceful Fish",
                        },
                    },
                },
            },
            {
                id: "newsletter",
                label: "Checkbox field (newsletter)",
                overrides: {
                    profile: {
                        attributesByName: {
                            newsletter: {
                                name: "newsletter",
                                displayName: "Sign up to the newsletter",
                                validators: { options: { options: ["yes"] } },
                                annotations: {
                                    inputOptionLabels: {
                                        yes: "I want my email inbox filled with spam",
                                    },
                                    inputType: "multiselect-checkboxes",
                                },
                                required: false,
                                readOnly: false,
                            },
                        },
                    },
                },
            },
            {
                id: "email-as-username",
                label: "Email as username",
                overrides: {
                    realm: { registrationEmailAsUsername: true },
                    profile: { attributesByName: { username: undefined } },
                },
            },
            {
                id: "recaptcha",
                label: "With reCAPTCHA",
                overrides: {
                    scripts: ["https://www.google.com/recaptcha/api.js?hl=en"],
                    recaptchaRequired: true,
                    recaptchaSiteKey: "6LfQHvApAAAAAE73SYTd5vS0lB1Xr7zdiQ-6iBVa",
                },
            },
            {
                id: "recaptcha-french",
                label: "With reCAPTCHA (French)",
                overrides: {
                    locale: { currentLanguageTag: "fr" },
                    scripts: ["https://www.google.com/recaptcha/api.js?hl=fr"],
                    recaptchaRequired: true,
                    recaptchaSiteKey: "6LfQHvApAAAAAE73SYTd5vS0lB1Xr7zdiQ-6iBVa",
                },
            },
            {
                id: "password-min-length",
                label: "Password policy (min 8)",
                overrides: { passwordPolicies: { length: 8 } },
            },
            {
                id: "terms-acceptance",
                label: "Terms acceptance required",
                overrides: {
                    termsAcceptanceRequired: true,
                    "x-keycloakify": {
                        messages: {
                            termsText: "<a href='https://example.com/terms'>Service Terms of Use</a>",
                        },
                    },
                },
            },
            {
                id: "terms-not-accepted",
                label: "Terms not accepted (error)",
                overrides: {
                    termsAcceptanceRequired: true,
                    messagesPerField: fieldError("You must accept the terms.", "termsAccepted"),
                },
            },
            {
                id: "field-errors",
                label: "With field errors",
                overrides: {
                    profile: {
                        attributesByName: {
                            username: { value: "" },
                            email: { value: "invalid-email" },
                        },
                    },
                    messagesPerField: {
                        existsError: (...names: string[]) => names.some(name => ["username", "email"].includes(name)),
                        get: (name: string) => {
                            if (name === "username") return "Username is required.";
                            if (name === "email") return "Invalid email format.";
                            return "";
                        },
                    },
                },
            },
            {
                id: "read-only-fields",
                label: "With read-only fields",
                overrides: {
                    profile: {
                        attributesByName: {
                            username: { value: "johndoe", readOnly: true },
                            email: { value: "jhon.doe@gmail.com", readOnly: false },
                        },
                    },
                },
            },
            {
                id: "auto-generated-username",
                label: "Auto-generated username",
                overrides: {
                    profile: {
                        attributesByName: { username: { value: "autogenerated_username" } },
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "info.ftl",
        label: "Info",
        category: "status",
        stories: [
            {
                id: "default",
                label: "Default",
                overrides: {
                    messageHeader: "Message header",
                    message: { summary: "Server info message" },
                },
            },
            {
                id: "link-back",
                label: "With back link",
                overrides: {
                    messageHeader: "Message header",
                    message: { summary: "Server message" },
                    actionUri: undefined,
                },
            },
            {
                id: "required-actions",
                label: "With required actions",
                overrides: {
                    messageHeader: "Message header",
                    message: { summary: "Required actions: " },
                    requiredActions: ["CONFIGURE_TOTP", "UPDATE_PROFILE", "VERIFY_EMAIL", "CUSTOM_ACTION"],
                    "x-keycloakify": {
                        messages: { "requiredAction.CUSTOM_ACTION": "Custom action" },
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "error.ftl",
        label: "Error",
        category: "status",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "another-message",
                label: "Another message",
                overrides: { message: { summary: "With another error message" } },
            },
            {
                id: "html-error",
                label: "HTML error message",
                overrides: {
                    message: {
                        summary:
                            "<strong>Error:</strong> Something went wrong. <a href='https://example.com'>Go back</a>",
                    },
                },
            },
            {
                id: "french",
                label: "French",
                overrides: {
                    locale: { currentLanguageTag: "fr" },
                    message: { summary: "Une erreur s'est produite" },
                },
            },
            {
                id: "skip-link",
                label: "With skip link",
                overrides: {
                    message: { summary: "An error occurred" },
                    skipLink: true,
                    client: { baseUrl: "https://example.com" },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-reset-password.ftl",
        label: "Reset password",
        category: "credentials",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "email-as-username",
                label: "Email as username",
                overrides: {
                    realm: { loginWithEmailAllowed: true, registrationEmailAsUsername: true },
                },
            },
            {
                id: "username-error",
                label: "With username error",
                overrides: {
                    realm: {
                        loginWithEmailAllowed: false,
                        registrationEmailAsUsername: false,
                        duplicateEmailsAllowed: false,
                    },
                    url: { loginAction: "/mock-login-action", loginUrl: "/mock-login-url" },
                    messagesPerField: fieldError("Invalid username", "username"),
                    auth: { attemptedUsername: "invalid_user" },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-verify-email.ftl",
        label: "Verify email",
        category: "credentials",
        stories: [
            {
                id: "default",
                label: "Default (warning)",
                overrides: {
                    message: {
                        summary: "You need to verify your email to activate your account.",
                        type: "warning",
                    },
                    user: { email: "john.doe@gmail.com" },
                },
            },
            {
                id: "success",
                label: "Success message",
                overrides: {
                    message: {
                        summary: "Your email has been successfully verified.",
                        type: "success",
                    },
                    user: { email: "john.doe@gmail.com" },
                    url: { loginAction: "/mock-login-action" },
                },
            },
            {
                id: "error",
                label: "Error message",
                overrides: {
                    message: {
                        summary: "There was an error verifying your email. Please try again.",
                        type: "error",
                    },
                    user: { email: "john.doe@gmail.com" },
                    url: { loginAction: "/mock-login-action" },
                },
            },
            {
                id: "info",
                label: "Info message",
                overrides: {
                    message: {
                        summary: "Please verify your email to continue using our services.",
                        type: "info",
                    },
                    user: { email: "john.doe@gmail.com" },
                    url: { loginAction: "/mock-login-action" },
                },
            },
        ],
    }),
    definePage({
        pageId: "terms.ftl",
        label: "Terms and conditions",
        category: "sessions",
        stories: [
            {
                id: "default",
                label: "English",
                overrides: {
                    "x-keycloakify": {
                        messages: { termsText: "<p>My terms in <strong>English</strong></p>" },
                    },
                },
            },
            {
                id: "arabic",
                label: "Arabic (RTL)",
                overrides: {
                    locale: { currentLanguageTag: "ar", rtl: true },
                    "x-keycloakify": {
                        messages: { termsText: "<p>شروطي باللغة <strong>العربية</strong></p>" },
                    },
                },
            },
            {
                id: "french",
                label: "French",
                overrides: {
                    locale: { currentLanguageTag: "fr" },
                    "x-keycloakify": {
                        messages: { termsText: "<p>Mes terme en <strong>Français</strong></p>" },
                    },
                },
            },
            {
                id: "spanish",
                label: "Spanish",
                overrides: {
                    locale: { currentLanguageTag: "es" },
                    "x-keycloakify": {
                        messages: { termsText: "<p>Mis términos en <strong>Español</strong></p>" },
                    },
                },
            },
            {
                id: "long-message",
                label: "Long message",
                overrides: {
                    "x-keycloakify": {
                        messages: {
                            termsText: `
                                <p>These are the terms and conditions. Please read them carefully.</p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.</p>
                                <p>Cras vehicula diam vel metus faucibus, at scelerisque lacus pretium. Donec ac consectetur justo. Morbi in sollicitudin nulla.</p>
                                <p>Suspendisse potenti. Phasellus pharetra consequat ante, at dictum ligula volutpat a. Quisque ultricies velit nec nulla gravida accumsan.</p>
                                <p><strong>Please accept the terms to proceed.</strong></p>
                            `,
                        },
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-oauth2-device-verify-user-code.ftl",
        label: "Device (verify user code)",
        category: "sessions",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "error-message",
                label: "Invalid code",
                overrides: {
                    url: { oauth2DeviceVerificationAction: "/mock-oauth2-device-verification" },
                    message: {
                        summary: "The user code you entered is invalid. Please try again.",
                        type: "error",
                    },
                },
            },
            {
                id: "empty-input",
                label: "Empty input",
                overrides: {
                    url: { oauth2DeviceVerificationAction: "/mock-oauth2-device-verification" },
                    message: {
                        summary: "User code cannot be empty. Please enter a valid code.",
                        type: "error",
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "webauthn-error.ftl",
        label: "WebAuthn error",
        category: "status",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "retry-available",
                label: "Retry available",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    isAppInitiatedAction: false,
                    message: {
                        summary: "WebAuthn authentication failed. Please try again.",
                        type: "error",
                    },
                },
            },
            {
                id: "app-initiated",
                label: "App-initiated action",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    isAppInitiatedAction: true,
                    message: {
                        summary: "WebAuthn authentication failed. You can try again or cancel.",
                        type: "error",
                    },
                },
            },
            {
                id: "javascript-disabled",
                label: "JavaScript disabled",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    isAppInitiatedAction: false,
                    message: {
                        summary: "JavaScript is disabled or not working. Please retry manually.",
                        type: "warning",
                    },
                },
            },
        ],
    }),
    simplePage("login-passkeys-conditional-authenticate.ftl", "Passkeys (conditional)", "sign-in"),
    simplePage("login-idp-link-confirm-override.ftl", "IdP link (confirm override)", "idp"),
    simplePage("saml-post-form.ftl", "SAML post form", "sessions"),
    definePage({
        pageId: "login-oauth-grant.ftl",
        label: "OAuth grant",
        category: "sessions",
        stories: [
            {
                id: "default",
                label: "Default",
                overrides: {
                    url: { oauthAction: "/oauth-action" },
                    oauth: {
                        clientScopesRequested: [
                            { consentScreenText: "Scope1", dynamicScopeParameter: "dynamicScope1" },
                            { consentScreenText: "Scope2" },
                        ],
                        code: "mockCode",
                    },
                    client: {
                        attributes: {
                            policyUri: "https://twitter.com/en/tos",
                            tosUri: "https://twitter.com/en/privacy",
                        },
                        name: "Twitter",
                        clientId: "twitter-client-id",
                    },
                },
            },
            {
                id: "without-scopes",
                label: "Without scopes",
                overrides: {
                    url: { oauthAction: "/oauth-action" },
                    oauth: { clientScopesRequested: [], code: "mockCode" },
                    client: { name: "Twitter", clientId: "twitter-client-id" },
                },
            },
            {
                id: "form-submission-error",
                label: "Form submission error",
                overrides: {
                    url: { oauthAction: "/error" },
                    oauth: { code: "mockCode" },
                    client: { name: "Twitter", clientId: "twitter-client-id" },
                    message: {
                        type: "error",
                        summary: "An error occurred during form submission.",
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-otp.ftl",
        label: "OTP",
        category: "sign-in",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "multiple-credentials",
                label: "Multiple OTP credentials",
                overrides: {
                    otpLogin: {
                        userOtpCredentials: [
                            { id: "credential1", userLabel: "Device 1" },
                            { id: "credential2", userLabel: "Device 2" },
                            { id: "credential3", userLabel: "Device 3" },
                            { id: "credential4", userLabel: "Device 4" },
                            { id: "credential5", userLabel: "Device 5" },
                            { id: "credential6", userLabel: "Device 6" },
                        ],
                        selectedCredentialId: "credential1",
                    },
                    url: { loginAction: "/login-action" },
                    messagesPerField: { existsError: () => false },
                },
            },
            {
                id: "otp-error",
                label: "OTP error",
                overrides: {
                    otpLogin: { userOtpCredentials: [] },
                    url: { loginAction: "/login-action" },
                    messagesPerField: fieldError("Invalid OTP code", "totp"),
                },
            },
            {
                id: "no-credentials",
                label: "No OTP credentials",
                overrides: {
                    otpLogin: { userOtpCredentials: [] },
                    url: { loginAction: "/login-action" },
                    messagesPerField: { existsError: () => false },
                },
            },
            {
                id: "error-and-multiple",
                label: "Error + multiple credentials",
                overrides: {
                    otpLogin: {
                        userOtpCredentials: [
                            { id: "credential1", userLabel: "Device 1" },
                            { id: "credential2", userLabel: "Device 2" },
                        ],
                        selectedCredentialId: "credential1",
                    },
                    url: { loginAction: "/login-action" },
                    messagesPerField: fieldError("Invalid OTP code", "totp"),
                },
            },
        ],
    }),
    definePage({
        pageId: "login-username.ftl",
        label: "Login Username",
        category: "sign-in",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "webauthn",
                label: "WebAuthn (passkeys)",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    enableWebAuthnConditionalUI: true,
                },
            },
            {
                id: "email-as-username",
                label: "Email as username",
                overrides: {
                    realm: { loginWithEmailAllowed: true, registrationEmailAsUsername: true },
                },
            },
            {
                id: "social-providers",
                label: "With social providers",
                overrides: { social: { displayInfo: true, providers: allSocialProviders } },
            },
            {
                id: "error-message",
                label: "With error banner",
                overrides: {
                    message: {
                        type: "error",
                        summary:
                            "The time allotted for the connection has elapsed.<br/>The login process will restart from the beginning.",
                    },
                },
            },
            {
                id: "one-social-provider",
                label: "One social provider",
                overrides: { social: { displayInfo: true, providers: [socialProviders.google] } },
            },
            {
                id: "two-social-providers",
                label: "Two social providers",
                overrides: {
                    social: {
                        displayInfo: true,
                        providers: [socialProviders.google, socialProviders.microsoft],
                    },
                },
            },
            {
                id: "no-social-providers",
                label: "No social providers",
                overrides: { social: { displayInfo: true, providers: [] } },
            },
            {
                id: "many-social-providers",
                label: "Many social providers",
                overrides: {
                    social: {
                        displayInfo: true,
                        providers: [
                            socialProviders.google,
                            socialProviders.microsoft,
                            socialProviders.facebook,
                            socialProviders.twitter,
                        ],
                    },
                },
            },
            {
                id: "social-providers-no-remember-me",
                label: "Social providers, no remember me",
                overrides: {
                    social: { displayInfo: true, providers: [socialProviders.google] },
                    realm: { rememberMe: false },
                },
            },
            {
                id: "custom-provider",
                label: "Custom provider",
                overrides: {
                    social: {
                        displayInfo: true,
                        providers: [
                            {
                                loginUrl: "custom",
                                alias: "custom",
                                providerId: "custom",
                                displayName: "Custom",
                            },
                        ],
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-password.ftl",
        label: "Login Password",
        category: "sign-in",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "attempted-username",
                label: "With attempted username",
                overrides: { auth: { showUsername: true, attemptedUsername: "MyUsername" } },
            },
            {
                id: "password-error",
                label: "With password error",
                overrides: {
                    realm: { resetPasswordAllowed: true },
                    url: {
                        loginAction: "/mock-login",
                        loginResetCredentialsUrl: "/mock-reset-password",
                    },
                    messagesPerField: fieldError("Invalid password", "password"),
                },
            },
            {
                id: "webauthn",
                label: "WebAuthn (passkeys)",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    enableWebAuthnConditionalUI: true,
                },
            },
            {
                id: "no-reset-password",
                label: "Without reset password",
                overrides: {
                    realm: { resetPasswordAllowed: false },
                    url: {
                        loginAction: "/mock-login",
                        loginResetCredentialsUrl: "/mock-reset-password",
                    },
                    messagesPerField: { existsError: () => false },
                },
            },
        ],
    }),
    definePage({
        pageId: "webauthn-authenticate.ftl",
        label: "WebAuthn authenticate",
        category: "sign-in",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "try-another-way",
                label: "Try another way",
                overrides: { auth: { showTryAnotherWayLink: true } },
            },
            {
                id: "multiple-authenticators",
                label: "Multiple authenticators",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    authenticators: {
                        authenticators: [
                            {
                                credentialId: "authenticator-1",
                                label: "Security Key 1",
                                transports: {
                                    iconClass: "kcAuthenticatorUsbIcon",
                                    displayNameProperties: ["USB"],
                                },
                                createdAt: "2023-01-01",
                            },
                            {
                                credentialId: "authenticator-2",
                                label: "Security Key 2",
                                transports: {
                                    iconClass: "kcAuthenticatorNfcIcon",
                                    displayNameProperties: ["NFC"],
                                },
                                createdAt: "2023-02-01",
                            },
                        ],
                    },
                    shouldDisplayAuthenticators: true,
                },
            },
            {
                id: "single-authenticator",
                label: "Single authenticator",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    authenticators: {
                        authenticators: [
                            {
                                credentialId: "authenticator-1",
                                label: "My Security Key",
                                transports: {
                                    iconClass: "kcAuthenticatorUsbIcon",
                                    displayNameProperties: ["USB"],
                                },
                                createdAt: "2023-01-01",
                            },
                        ],
                    },
                    shouldDisplayAuthenticators: true,
                },
            },
            {
                id: "error",
                label: "Authentication error",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    authenticators: {
                        authenticators: [
                            {
                                credentialId: "authenticator-1",
                                label: "My Security Key",
                                transports: {
                                    iconClass: "kcAuthenticatorUsbIcon",
                                    displayNameProperties: ["USB"],
                                },
                                createdAt: "2023-01-01",
                            },
                        ],
                    },
                    shouldDisplayAuthenticators: true,
                    message: {
                        summary: "An error occurred during WebAuthn authentication.",
                        type: "error",
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "webauthn-register.ftl",
        label: "WebAuthn register",
        category: "credentials",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "retry-available",
                label: "Retry available",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    isSetRetry: true,
                    isAppInitiatedAction: false,
                },
            },
            {
                id: "error",
                label: "Registration error",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    isSetRetry: false,
                    isAppInitiatedAction: false,
                    message: {
                        summary: "An error occurred during WebAuthn registration. Please try again.",
                        type: "error",
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-update-password.ftl",
        label: "Update password",
        category: "credentials",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "password-error",
                label: "Password error",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    messagesPerField: fieldError("Password must be at least 8 characters long.", "password"),
                    isAppInitiatedAction: false,
                },
            },
            {
                id: "password-confirm-error",
                label: "Password confirm error",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    messagesPerField: fieldError("Passwords do not match.", "password-confirm"),
                    isAppInitiatedAction: false,
                },
            },
        ],
    }),
    definePage({
        pageId: "login-x509-info.ftl",
        label: "X.509 info",
        category: "credentials",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "user-not-enabled",
                label: "User not enabled",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    x509: {
                        formData: {
                            subjectDN: "CN=John Doe, OU=Example Org, O=Example Inc, C=US",
                            username: "johndoe",
                            isUserEnabled: false,
                        },
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "link-idp-action.ftl",
        label: "Link IdP action",
        category: "idp",
        stories: [
            {
                id: "default",
                label: "GitHub",
                overrides: { idpDisplayName: "GitHub", url: { loginAction: "/mock-login-action" } },
            },
            {
                id: "different-provider",
                label: "Google",
                overrides: {
                    idpDisplayName: "Google",
                    url: { loginAction: "/custom-login-action" },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-idp-link-confirm.ftl",
        label: "IdP link (confirm)",
        category: "idp",
        stories: [
            {
                id: "default",
                label: "Default",
                overrides: { url: { loginAction: "/login-action" }, idpAlias: "mockIdpAlias" },
            },
            {
                id: "form-submission-error",
                label: "Form submission error",
                overrides: {
                    url: { loginAction: "/error" },
                    idpAlias: "mockIdpAlias",
                    message: {
                        type: "error",
                        summary: "An error occurred during form submission.",
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-idp-link-email.ftl",
        label: "IdP link (email)",
        category: "idp",
        stories: [
            {
                id: "default",
                label: "Default",
                overrides: {
                    url: { loginAction: "/login-action" },
                    idpAlias: "mockIdpAlias",
                    brokerContext: { username: "mockUser" },
                    realm: { displayName: "MockRealm" },
                },
            },
            {
                id: "idp-alias",
                label: "Google provider",
                overrides: {
                    url: { loginAction: "/login-action" },
                    idpAlias: "Google",
                    brokerContext: { username: "john.doe" },
                    realm: { displayName: "MyRealm" },
                },
            },
            {
                id: "custom-realm",
                label: "Custom realm display name",
                overrides: {
                    url: { loginAction: "/login-action" },
                    idpAlias: "Facebook",
                    brokerContext: { username: "jane.doe" },
                    realm: { displayName: "CUSTOM REALM DISPLAY NAME" },
                },
            },
            {
                id: "form-submission-error",
                label: "Form submission error",
                overrides: {
                    url: { loginAction: "/error" },
                    idpAlias: "mockIdpAlias",
                    brokerContext: { username: "mockUser" },
                    realm: { displayName: "MockRealm" },
                    message: {
                        type: "error",
                        summary: "An error occurred during form submission.",
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-page-expired.ftl",
        label: "Page expired",
        category: "status",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "error-message",
                label: "With error message",
                overrides: {
                    url: {
                        loginRestartFlowUrl: "/mock-restart-flow",
                        loginAction: "/mock-continue-login",
                    },
                    message: {
                        type: "error",
                        summary: "An error occurred while processing your session.",
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-config-totp.ftl",
        label: "Configure TOTP",
        category: "credentials",
        stories: [
            { id: "default", label: "Default" },
            { id: "manual-setup", label: "Manual setup", overrides: { mode: "manual" } },
            {
                id: "error",
                label: "With error",
                overrides: { messagesPerField: fieldError("Invalid TOTP", "totp") },
            },
            {
                id: "app-initiated",
                label: "App-initiated action",
                overrides: { isAppInitiatedAction: true },
            },
            {
                id: "prefilled-label",
                label: "Pre-filled user label",
                overrides: { totp: { otpCredentials: [{ userLabel: "MyDevice" }] } },
            },
        ],
    }),
    definePage({
        pageId: "logout-confirm.ftl",
        label: "Logout confirm",
        category: "sessions",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "custom-message",
                label: "Custom logout message",
                overrides: {
                    url: { logoutConfirmAction: "/mock-logout-action" },
                    client: { baseUrl: "/mock-client-url" },
                    logoutConfirm: { code: "mock-session-code", skipLink: false },
                    message: {
                        summary: "Are you sure you want to log out from all sessions?",
                        type: "warning",
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "login-update-profile.ftl",
        label: "Update profile",
        category: "registration",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "profile-error",
                label: "With profile error",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    messagesPerField: fieldError("Invalid email format", "email"),
                    isAppInitiatedAction: false,
                },
            },
        ],
    }),
    definePage({
        pageId: "idp-review-user-profile.ftl",
        label: "IdP (review user profile)",
        category: "registration",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "validation-errors",
                label: "With validation errors",
                overrides: {
                    messagesPerField: {
                        existsError: (...names: string[]) => names.some(name => ["email", "firstName"].includes(name)),
                        get: (name: string) => {
                            if (name === "email") return "Invalid email format.";
                            if (name === "firstName") return "First name is required.";
                            return "";
                        },
                    },
                },
            },
            {
                id: "read-only-fields",
                label: "With read-only fields",
                overrides: {
                    profile: {
                        attributesByName: {
                            email: { value: "jane.doe@example.com", readOnly: true },
                            firstName: { value: "Jane", readOnly: false },
                        },
                    },
                },
            },
            {
                id: "prefilled-fields",
                label: "Pre-filled fields",
                overrides: {
                    profile: {
                        attributesByName: {
                            firstName: { value: "Jane" },
                            lastName: { value: "Doe" },
                            email: { value: "jane.doe@example.com" },
                        },
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "update-email.ftl",
        label: "Update email",
        category: "registration",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "app-initiated",
                label: "App-initiated action",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    messagesPerField: { exists: () => false },
                    isAppInitiatedAction: true,
                },
            },
        ],
    }),
    definePage({
        pageId: "select-authenticator.ftl",
        label: "Select authenticator",
        category: "sign-in",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "different-methods",
                label: "Different methods",
                overrides: {
                    auth: {
                        authenticationSelections: [
                            {
                                authExecId: "25697c4e-0c80-4f2c-8eb7-2c16347e8e8d",
                                displayName: "auth-username-password-form-display-name",
                                helpText: "auth-username-password-form-help-text",
                                iconCssClass: "kcAuthenticatorPasswordClass",
                            },
                            {
                                authExecId: "4cb60872-ce0d-4c8f-a806-e651ed77994b",
                                displayName: "webauthn-passwordless-display-name",
                                helpText: "webauthn-passwordless-help-text",
                                iconCssClass: "kcAuthenticatorWebAuthnPasswordlessClass",
                            },
                        ],
                    },
                },
            },
            {
                id: "realm-translations",
                label: "With realm translations",
                overrides: {
                    auth: {
                        authenticationSelections: [
                            {
                                authExecId: "f0c22855-eda7-4092-8565-0c22f77d2ffb",
                                displayName: "home-idp-discovery-display-name",
                                helpText: "home-idp-discovery-help-text",
                                iconCssClass: "kcAuthenticatorDefaultClass",
                            },
                            {
                                authExecId: "20456f5a-8b2b-45f3-98e0-551dcb27e3e1",
                                displayName: "identity-provider-redirctor-display-name",
                                helpText: "identity-provider-redirctor-help-text",
                                iconCssClass: "kcAuthenticatorDefaultClass",
                            },
                            {
                                authExecId: "eb435db9-474e-473a-8da7-c184fa510b96",
                                displayName: "auth-username-password-form-display-name",
                                helpText: "auth-username-password-help-text",
                                iconCssClass: "kcAuthenticatorDefaultClass",
                            },
                        ],
                    },
                    "x-keycloakify": {
                        messages: {
                            "home-idp-discovery-display-name": "Home identity provider",
                            "home-idp-discovery-help-text":
                                "Sign in via your home identity provider which will be automatically determined based on your provided email address.",
                            "identity-provider-redirctor-display-name": "Identity Provider Redirector",
                            "identity-provider-redirctor-help-text": "Sign in via your identity provider.",
                            "auth-username-password-help-text": "Sign in via your username and password.",
                        },
                    },
                },
            },
            {
                id: "no-selections",
                label: "No authentication methods",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    auth: { authenticationSelections: [] },
                },
            },
        ],
    }),
    definePage({
        pageId: "delete-credential.ftl",
        label: "Delete credential",
        category: "credentials",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "custom-label",
                label: "Custom credential label",
                overrides: {
                    credentialLabel: "Test Credential",
                    url: { loginAction: "/login-action" },
                },
            },
        ],
    }),
    definePage({
        pageId: "code.ftl",
        label: "Device code",
        category: "status",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "dark-mode-forbidden",
                label: "Dark mode forbidden",
                overrides: { darkMode: false },
            },
            {
                id: "error-code",
                label: "Error code",
                overrides: { code: { success: false, error: "Failed to generate code" } },
            },
            {
                id: "french",
                label: "French",
                overrides: {
                    locale: { currentLanguageTag: "fr" },
                    code: { success: true, code: "XYZ789" },
                },
            },
            {
                id: "html-error",
                label: "HTML error message",
                overrides: {
                    code: {
                        success: false,
                        error: "Something went wrong. <a href='https://example.com'>Try again</a>",
                    },
                },
            },
        ],
    }),
    definePage({
        pageId: "delete-account-confirm.ftl",
        label: "Delete account confirm",
        category: "sessions",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "aia-flow",
                label: "With AIA flow",
                overrides: { triggered_from_aia: true, url: { loginAction: "/login-action" } },
            },
            {
                id: "without-aia-flow",
                label: "Without AIA flow",
                overrides: { triggered_from_aia: false, url: { loginAction: "/login-action" } },
            },
        ],
    }),
    definePage({
        pageId: "frontchannel-logout.ftl",
        label: "Frontchannel logout",
        category: "sessions",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "no-redirect",
                label: "Without redirect URL",
                overrides: { logout: { clients: [] } },
            },
        ],
    }),
    definePage({
        pageId: "login-recovery-authn-code-config.ftl",
        label: "Recovery codes (config)",
        category: "credentials",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "error",
                label: "Code generation error",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    message: {
                        summary: "An error occurred during recovery code generation. Please try again.",
                        type: "error",
                    },
                },
            },
        ],
    }),
    simplePage("login-recovery-authn-code-input.ftl", "Recovery codes (input)", "sign-in"),
    definePage({
        pageId: "login-reset-otp.ftl",
        label: "Reset OTP",
        category: "credentials",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "no-credentials",
                label: "Without OTP credentials",
                overrides: {
                    url: { loginAction: "/mock-login" },
                    configuredOtpCredentials: {
                        userOtpCredentials: [],
                        selectedCredentialId: undefined,
                    },
                    messagesPerField: { existsError: () => false },
                },
            },
            {
                id: "otp-error",
                label: "OTP error",
                overrides: {
                    url: { loginAction: "/mock-login" },
                    configuredOtpCredentials: {
                        userOtpCredentials: [
                            { id: "otp1", userLabel: "Device 1" },
                            { id: "otp2", userLabel: "Device 2" },
                        ],
                        selectedCredentialId: "otp1",
                    },
                    messagesPerField: fieldError("Invalid OTP selection", "totp"),
                },
            },
            {
                id: "one-credential",
                label: "Only one OTP credential",
                overrides: {
                    url: { loginAction: "/mock-login" },
                    configuredOtpCredentials: {
                        userOtpCredentials: [{ id: "otp1", userLabel: "Device 1" }],
                        selectedCredentialId: "otp1",
                    },
                    messagesPerField: { existsError: () => false },
                },
            },
        ],
    }),
    definePage({
        pageId: "select-organization.ftl",
        label: "Select organization",
        category: "sessions",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "many",
                label: "Many organizations",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    user: {
                        organizations: [
                            { alias: "org1", name: "Organization 1" },
                            { alias: "org2", name: "Organization 2" },
                            { alias: "org3", name: "Organization 3" },
                            { alias: "org4", name: "Organization 4" },
                            { alias: "org5", name: "Organization 5" },
                            { alias: "org6", name: "Organization 6" },
                        ],
                    },
                },
            },
            {
                id: "few",
                label: "Few organizations",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    user: {
                        organizations: [
                            { alias: "org1", name: "Organization 1" },
                            { alias: "org2", name: "Organization 2" },
                            { alias: "org3", name: "Organization 3" },
                        ],
                    },
                },
            },
            {
                id: "single",
                label: "Single organization",
                overrides: {
                    url: { loginAction: "/mock-login-action" },
                    user: { organizations: [{ alias: "org1", name: "My Organization" }] },
                },
            },
        ],
    }),
    definePage({
        pageId: "otp-form.ftl",
        label: "Email access code (Phase Two)",
        category: "extensions",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "invalid-code",
                label: "Invalid code",
                // The extension reports a wrong code as a form-level error, not on the "totp" field.
                overrides: { message: { type: "error", summary: "Invalid access code." } },
            },
            {
                id: "code-resent",
                label: "Code resent",
                overrides: {
                    message: { type: "info", summary: "A new access code has been sent to your email." },
                },
            },
        ],
    }),
    simplePage("view-email.ftl", "Magic link sent (Phase Two)", "extensions"),
    simplePage("view-email-continuation.ftl", "Magic link sent, waiting (Phase Two)", "extensions"),
    definePage({
        pageId: "email-confirmation.ftl",
        label: "Magic link confirmed (Phase Two)",
        category: "extensions",
        stories: [
            { id: "default", label: "Same browser" },
            {
                id: "other-browser",
                label: "Other browser",
                overrides: { magicLinkContinuation: { sameBrowser: false } },
            },
        ],
    }),
    simplePage("email-confirmation-error.ftl", "Magic link expired (Phase Two)", "extensions"),
    simplePage("view-activation-sent.ftl", "Activation email sent (Phase Two)", "extensions"),
    definePage({
        pageId: "login-token-form.ftl",
        label: "Login token (Phase Two)",
        category: "extensions",
        stories: [
            { id: "default", label: "Default" },
            {
                id: "invalid-token",
                label: "Invalid token",
                overrides: {
                    message: { type: "error", summary: "Invalid or expired login token. Please try again." },
                },
            },
        ],
    }),
    simplePage("login-token-user-switch.ftl", "Login token, switch user (Phase Two)", "extensions"),
    simplePage("cf-captcha.ftl", "Cloudflare Turnstile captcha (Phase Two)", "extensions"),
];

/** All page ids, in catalog order. */
/** The page and scenario the login preview opens on. */
export const initialPreview = { pageId: "login.ftl", storyId: "two-social-providers" } as const satisfies {
    pageId: PageId;
    storyId: string;
};

export const pageIds: PageId[] = pages.map(page => page.pageId);

/** Look up a page's catalog entry. */
export function getPage(pageId: PageId): PagePreview | undefined {
    return pages.find(page => page.pageId === pageId);
}

/** Resolve a scenario within a page, falling back to the page's first scenario. */
export function getStory(pageId: PageId, scenarioId: string): PageStory | undefined {
    const page = getPage(pageId);
    if (page === undefined) {
        return undefined;
    }
    return page.stories.find(scenario => scenario.id === scenarioId) ?? page.stories[0];
}

export function getGroupedPages(): PageGroup[] {
    return pageCategories
        .map(({ id, label }) => ({
            id,
            label,
            pages: pages.filter(page => page.category === id),
        }))
        .filter(group => group.pages.length > 0);
}
