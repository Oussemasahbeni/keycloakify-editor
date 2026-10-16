import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { useState } from "react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "#/components/ui/input-group";
import { WebAuthnConditionalUI } from "#/login/components/WebAuthnConditionalUi/index.ts";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";
import { useKcEnv } from "#/login/useKcEnv.ts";

import { PasswordVisibilityButton } from "../../components/PasswordVisibilityButton";

export function Form() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "login.ftl");

    const { msg, msgStr } = useI18n();

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const { SHADCN_THEME_SHOW_PLACEHOLDER: showPlaceholder } = useKcEnv();

    return (
        <>
            <div id="kc-form">
                <div id="kc-form-wrapper">
                    {kcContext.realm.password && (
                        <form
                            id="kc-form-login"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={kcContext.url.loginAction}
                            method="post"
                        >
                            <FieldGroup>
                                {!kcContext.usernameHidden && (
                                    <Field>
                                        <FieldLabel htmlFor="username">
                                            {!kcContext.realm.loginWithEmailAllowed
                                                ? msg("username")
                                                : !kcContext.realm.registrationEmailAsUsername
                                                  ? msg("usernameOrEmail")
                                                  : msg("email")}
                                        </FieldLabel>
                                        <Input
                                            type="text"
                                            id="username"
                                            defaultValue={kcContext.login.username ?? ""}
                                            name="username"
                                            autoFocus
                                            placeholder={
                                                showPlaceholder
                                                    ? !kcContext.realm.loginWithEmailAllowed
                                                        ? msgStr("usernamePlaceholder")
                                                        : !kcContext.realm.registrationEmailAsUsername
                                                          ? msgStr("usernameOrEmailPlaceholder")
                                                          : msgStr("emailPlaceholder")
                                                    : undefined
                                            }
                                            autoComplete={
                                                kcContext.enableWebAuthnConditionalUI ? "username webauthn" : "username"
                                            }
                                            aria-invalid={kcContext.messagesPerField.existsError(
                                                "username",
                                                "password",
                                            )}
                                        />
                                        {kcContext.messagesPerField.existsError("username", "password") && (
                                            <FieldError>
                                                <span
                                                    id="input-error-username"
                                                    aria-live="polite"
                                                    dangerouslySetInnerHTML={{
                                                        __html: kcSanitize(
                                                            kcContext.messagesPerField.getFirstError(
                                                                "username",
                                                                "password",
                                                            ),
                                                        ),
                                                    }}
                                                />
                                            </FieldError>
                                        )}
                                    </Field>
                                )}

                                <FieldGroup>
                                    <Field>
                                        <div className="flex items-center">
                                            <FieldLabel htmlFor="password">{msg("password")}</FieldLabel>
                                            {kcContext.realm.resetPasswordAllowed && (
                                                <a
                                                    href={kcContext.url.loginResetCredentialsUrl}
                                                    className="ms-auto inline-block text-sm underline-offset-4 hover:underline"
                                                >
                                                    {msg("doForgotPassword")}
                                                </a>
                                            )}
                                        </div>
                                        <InputGroup>
                                            <InputGroupInput
                                                type="password"
                                                id="password"
                                                name="password"
                                                autoComplete="current-password"
                                                placeholder={
                                                    showPlaceholder ? msgStr("passwordPlaceholder") : undefined
                                                }
                                                aria-invalid={kcContext.messagesPerField.existsError(
                                                    "username",
                                                    "password",
                                                )}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <PasswordVisibilityButton passwordInputId="password" />
                                            </InputGroupAddon>
                                        </InputGroup>
                                        {kcContext.messagesPerField.existsError("username", "password") && (
                                            <FieldError>
                                                <span
                                                    id="input-error-password"
                                                    aria-live="polite"
                                                    dangerouslySetInnerHTML={{
                                                        __html: kcSanitize(
                                                            kcContext.messagesPerField.getFirstError(
                                                                "username",
                                                                "password",
                                                            ),
                                                        ),
                                                    }}
                                                />
                                            </FieldError>
                                        )}
                                    </Field>

                                    {kcContext.realm.rememberMe && !kcContext.usernameHidden && (
                                        <Field orientation="horizontal">
                                            <Checkbox
                                                id="rememberMe"
                                                name="rememberMe"
                                                defaultChecked={!!kcContext.login.rememberMe}
                                            />
                                            <FieldLabel htmlFor="rememberMe">{msg("rememberMe")}</FieldLabel>
                                        </Field>
                                    )}
                                </FieldGroup>

                                <input
                                    type="hidden"
                                    id="id-hidden-input"
                                    name="credentialId"
                                    value={kcContext.auth.selectedCredential}
                                />

                                <Field>
                                    <Button
                                        disabled={isLoginButtonDisabled}
                                        className="w-full"
                                        name="login"
                                        id="kc-login"
                                        type="submit"
                                        value={msgStr("doLogIn")}
                                    >
                                        {msgStr("doLogIn")}
                                    </Button>
                                </Field>
                            </FieldGroup>
                        </form>
                    )}
                </div>
            </div>

            {kcContext.enableWebAuthnConditionalUI && (
                <WebAuthnConditionalUI
                    isUserIdentified={kcContext.isUserIdentified}
                    challenge={kcContext.challenge}
                    rpId={kcContext.rpId}
                    userVerification={kcContext.userVerification}
                    createTimeout={kcContext.createTimeout}
                    mediation={kcContext.mediation}
                    authenticatorAttachment={kcContext.authenticatorAttachment}
                    authenticators={kcContext.authenticators?.authenticators}
                    loginAction={kcContext.url.loginAction}
                />
            )}
        </>
    );
}
