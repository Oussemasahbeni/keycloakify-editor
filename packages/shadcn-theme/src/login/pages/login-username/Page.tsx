import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { useState } from "react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { WebAuthnConditionalUI } from "#/login/components/WebAuthnConditionalUi";
import { useI18n } from "#/login/i18n";
import { useKcContext } from "#/login/KcContext";
import { useKcEnv } from "#/login/useKcEnv";

import { Template } from "../../components/Template";
import { SocialProviders } from "../login/SocialProviders";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-username.ftl");

    const {
        social,
        realm,
        url,
        usernameHidden,
        login,
        registrationDisabled,
        messagesPerField,
        enableWebAuthnConditionalUI,
    } = kcContext;

    const { msg, msgStr } = useI18n();

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const { SHADCN_THEME_SHOW_PLACEHOLDER: showPlaceholder } = useKcEnv();

    return (
        <Template
            displayMessage={!messagesPerField.existsError("username")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <div id="kc-registration" className="text-center text-sm">
                    <span>
                        {msg("noAccount")}{" "}
                        <a className="underline underline-offset-4" href={url.registrationUrl}>
                            {msg("doRegister")}
                        </a>
                    </span>
                </div>
            }
            headerNode={msg("doLogIn")}
            socialProvidersNode={realm.password && social !== undefined && <SocialProviders />}
        >
            <div>
                {realm.password && (
                    <form
                        id="kc-form-login"
                        className="flex flex-col gap-4"
                        onSubmit={() => {
                            setIsLoginButtonDisabled(true);
                            return true;
                        }}
                        action={url.loginAction}
                        method="post"
                    >
                        {!usernameHidden && (
                            <Field>
                                <FieldLabel htmlFor="username">
                                    {!realm.loginWithEmailAllowed
                                        ? msg("email")
                                        : !realm.registrationEmailAsUsername
                                          ? msg("usernameOrEmail")
                                          : msg("username")}
                                </FieldLabel>
                                <Input
                                    type="text"
                                    id="username"
                                    defaultValue={login.username ?? ""}
                                    name="username"
                                    autoFocus
                                    placeholder={
                                        showPlaceholder
                                            ? !realm.loginWithEmailAllowed
                                                ? msgStr("usernamePlaceholder")
                                                : !realm.registrationEmailAsUsername
                                                  ? msgStr("usernameOrEmailPlaceholder")
                                                  : msgStr("emailPlaceholder")
                                            : undefined
                                    }
                                    className="autofill:bg-background"
                                    autoComplete={enableWebAuthnConditionalUI ? "username webauthn" : "username"}
                                    aria-invalid={messagesPerField.existsError("username")}
                                />
                                {messagesPerField.existsError("username") && (
                                    <FieldError>
                                        <span
                                            id="input-error"
                                            aria-live="polite"
                                            dangerouslySetInnerHTML={{
                                                __html: kcSanitize(messagesPerField.getFirstError("username")),
                                            }}
                                        />
                                    </FieldError>
                                )}
                            </Field>
                        )}

                        {realm.rememberMe && !usernameHidden && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="rememberMe"
                                    name="rememberMe"
                                    value="on"
                                    defaultChecked={!!login.rememberMe}
                                />
                                <Label htmlFor="rememberMe" className="cursor-pointer text-sm font-medium">
                                    {msg("rememberMe")}
                                </Label>
                            </div>
                        )}

                        <Button disabled={isLoginButtonDisabled} className="w-full" name="login" type="submit">
                            {msgStr("doLogIn")}
                        </Button>
                    </form>
                )}

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
            </div>
        </Template>
    );
}
