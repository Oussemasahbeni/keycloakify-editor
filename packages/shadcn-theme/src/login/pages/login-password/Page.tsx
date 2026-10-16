import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { useState } from "react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "#/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "#/components/ui/input-group";
import { PasswordVisibilityButton } from "#/login/components/PasswordVisibilityButton.tsx";
import { WebAuthnConditionalUI } from "#/login/components/WebAuthnConditionalUi/index.ts";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";
import { useKcEnv } from "#/login/useKcEnv.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-password.ftl");

    const { msg, msgStr } = useI18n();

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const { SHADCN_THEME_SHOW_PLACEHOLDER: showPlaceholder } = useKcEnv();

    return (
        <Template headerNode={msg("doLogIn")} displayMessage={!kcContext.messagesPerField.existsError("password")}>
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
                                placeholder={showPlaceholder ? msgStr("passwordPlaceholder") : undefined}
                                aria-invalid={kcContext.messagesPerField.existsError("password")}
                            />
                            <InputGroupAddon align="inline-end">
                                <PasswordVisibilityButton passwordInputId="password" />
                            </InputGroupAddon>
                        </InputGroup>
                        {kcContext.messagesPerField.existsError("password") && (
                            <FieldError>
                                <span
                                    id="input-error"
                                    aria-live="polite"
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(kcContext.messagesPerField.getFirstError("password")),
                                    }}
                                />
                            </FieldError>
                        )}
                    </Field>

                    <Field>
                        <Button disabled={isLoginButtonDisabled} className="w-full" name="login" type="submit">
                            {msgStr("doLogIn")}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
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
        </Template>
    );
}
