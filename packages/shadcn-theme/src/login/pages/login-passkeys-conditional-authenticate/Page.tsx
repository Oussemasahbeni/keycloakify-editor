import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { useKcClsx } from "@keycloakify/login-ui/useKcClsx";
import { clsx } from "keycloakify/tools/clsx";
import { Shield } from "lucide-react";
import { Fragment } from "react";
import { assert } from "tsafe/assert";

import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { WebAuthnConditionalUI } from "#/login/components/WebAuthnConditionalUi/index.ts";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-passkeys-conditional-authenticate.ftl");

    const {
        messagesPerField,
        login,
        url,
        usernameHidden,
        shouldDisplayAuthenticators,
        authenticators,
        registrationDisabled,
        realm,
        isUserIdentified,
        challenge,
        userVerification,
        rpId,
        createTimeout,
    } = kcContext;

    const { msg, advancedMsg } = useI18n();

    const { kcClsx } = useKcClsx();

    return (
        <Template
            displayInfo={realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <div id="kc-registration" className="text-center text-sm">
                    <span>
                        {msg("noAccount")}{" "}
                        <a
                            href={url.registrationUrl}
                            className="text-primary underline underline-offset-4 hover:text-primary/80 dark:text-foreground"
                        >
                            {msg("doRegister")}
                        </a>
                    </span>
                </div>
            }
            headerNode={msg("passkey-login-title")}
        >
            <div className="flex flex-col gap-4">
                {authenticators && (
                    <>
                        <form id="authn_select" hidden>
                            {authenticators.authenticators.map(authenticator => (
                                <Input
                                    key={authenticator.credentialId}
                                    type="hidden"
                                    name="authn_use_chk"
                                    value={authenticator.credentialId}
                                />
                            ))}
                        </form>

                        {shouldDisplayAuthenticators && (
                            <div className="flex flex-col gap-4">
                                {authenticators.authenticators.length > 1 && (
                                    <h3 className="text-center text-sm font-medium">
                                        {msg("passkey-available-authenticators")}
                                    </h3>
                                )}

                                <div className="flex flex-col gap-2">
                                    {authenticators.authenticators.map((authenticator, i) => (
                                        <div
                                            key={authenticator.credentialId}
                                            id={`kc-webauthn-authenticator-item-${i}`}
                                            className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3"
                                        >
                                            <div className="shrink-0">
                                                {(() => {
                                                    // oxlint-disable-next-line typescript/no-explicit-any -- iconClass is a free-form string from Keycloak, not a known kcClsx key
                                                    const className = kcClsx(authenticator.transports.iconClass as any);
                                                    const isDefaultIcon =
                                                        className === authenticator.transports.iconClass;

                                                    if (isDefaultIcon) {
                                                        return <Shield className="size-5 text-muted-foreground" />;
                                                    }

                                                    return <i className={clsx(className, "text-muted-foreground")} />;
                                                })()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div
                                                    id={`kc-webauthn-authenticator-label-${i}`}
                                                    className="text-sm font-medium"
                                                >
                                                    {advancedMsg(authenticator.label)}
                                                </div>

                                                {authenticator.transports.displayNameProperties?.length && (
                                                    <div
                                                        id={`kc-webauthn-authenticator-transport-${i}`}
                                                        className="mt-1 text-xs text-muted-foreground"
                                                    >
                                                        {authenticator.transports.displayNameProperties.map(
                                                            (displayNameProperty, propertyIndex, arr) => (
                                                                <Fragment key={displayNameProperty}>
                                                                    {advancedMsg(displayNameProperty)}
                                                                    {propertyIndex !== arr.length - 1 && (
                                                                        <span>, </span>
                                                                    )}
                                                                </Fragment>
                                                            ),
                                                        )}
                                                    </div>
                                                )}

                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    <span id={`kc-webauthn-authenticator-createdlabel-${i}`}>
                                                        {msg("passkey-createdAt-label")}
                                                    </span>{" "}
                                                    <span id={`kc-webauthn-authenticator-created-${i}`}>
                                                        {authenticator.createdAt}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {realm.password && !usernameHidden && (
                    <form id="kc-form-login" action={url.loginAction} method="post" className="flex flex-col gap-4">
                        <Field>
                            <FieldLabel htmlFor="username">{msg("passkey-autofill-select")}</FieldLabel>
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                defaultValue={login.username ?? ""}
                                autoFocus
                                className="autofill:bg-background"
                                autoComplete="username webauthn"
                                aria-invalid={messagesPerField.existsError("username")}
                            />
                            {messagesPerField.existsError("username") && (
                                <FieldError>
                                    <span
                                        id="input-error-username"
                                        aria-live="polite"
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(messagesPerField.getFirstError("username")),
                                        }}
                                    />
                                </FieldError>
                            )}
                        </Field>
                    </form>
                )}

                <WebAuthnConditionalUI
                    isUserIdentified={String(isUserIdentified) === "true" ? "true" : "false"}
                    challenge={challenge}
                    rpId={rpId}
                    userVerification={userVerification}
                    createTimeout={createTimeout}
                    authenticators={authenticators?.authenticators}
                    loginAction={url.loginAction}
                />
            </div>
        </Template>
    );
}
