import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { useState } from "react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "#/components/ui/input-group";
import { Label } from "#/components/ui/label";
import { WebAuthnConditionalUI } from "#/login/components/WebAuthnConditionalUi";
import { useI18n } from "#/login/i18n";
import { useKcContext } from "#/login/KcContext";
import { useKcEnv } from "#/login/useKcEnv";

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
                            className="flex flex-col gap-4"
                        >
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
                                        aria-invalid={kcContext.messagesPerField.existsError("username", "password")}
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

                            <Field>
                                <FieldLabel htmlFor="password">{msg("password")}</FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        type="password"
                                        id="password"
                                        name="password"
                                        autoComplete="current-password"
                                        placeholder={showPlaceholder ? msgStr("passwordPlaceholder") : undefined}
                                        aria-invalid={kcContext.messagesPerField.existsError("username", "password")}
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
                                                    kcContext.messagesPerField.getFirstError("username", "password"),
                                                ),
                                            }}
                                        />
                                    </FieldError>
                                )}
                            </Field>

                            <div className="flex justify-between text-xs">
                                {kcContext.realm.rememberMe && !kcContext.usernameHidden && (
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="rememberMe"
                                            name="rememberMe"
                                            defaultChecked={!!kcContext.login.rememberMe}
                                        />

                                        <Label htmlFor="rememberMe" className="cursor-pointer text-sm font-medium">
                                            {msg("rememberMe")}
                                        </Label>
                                    </div>
                                )}
                                <div className="link-style">
                                    {kcContext.realm.resetPasswordAllowed && (
                                        <span className="underline-offset-4 hover:underline">
                                            <a href={kcContext.url.loginResetCredentialsUrl}>
                                                <Label className="cursor-pointer text-sm font-medium">
                                                    {msg("doForgotPassword")}
                                                </Label>
                                            </a>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <input
                                    type="hidden"
                                    id="id-hidden-input"
                                    name="credentialId"
                                    value={kcContext.auth.selectedCredential}
                                />

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
                            </div>
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
