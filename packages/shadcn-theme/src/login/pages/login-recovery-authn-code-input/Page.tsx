import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-recovery-authn-code-input.ftl");

    const { url, messagesPerField, recoveryAuthnCodesInputBean } = kcContext;

    const { msg, msgStr } = useI18n();
    return (
        <Template
            headerNode={msg("auth-recovery-code-header")}
            displayMessage={!messagesPerField.existsError("recoveryCodeInput")}
        >
            <form
                id="kc-recovery-code-login-form"
                className="flex flex-col gap-6"
                action={url.loginAction}
                method="post"
            >
                <Field>
                    <FieldLabel htmlFor="recoveryCodeInput">
                        {msg("auth-recovery-code-prompt", `${recoveryAuthnCodesInputBean.codeNumber}`)}
                    </FieldLabel>
                    <Input
                        tabIndex={0}
                        id="recoveryCodeInput"
                        name="recoveryCodeInput"
                        autoComplete="off"
                        type="text"
                        autoFocus
                        placeholder="Enter recovery code"
                        aria-invalid={messagesPerField.existsError("recoveryCodeInput")}
                    />
                    {messagesPerField.existsError("recoveryCodeInput") && (
                        <FieldError>
                            <span
                                id="input-error"
                                aria-live="polite"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(messagesPerField.getFirstError("recoveryCodeInput")),
                                }}
                            />
                        </FieldError>
                    )}
                </Field>

                <Button className="w-full" name="login" id="kc-login" type="submit">
                    {msgStr("doLogIn")}
                </Button>
            </form>
        </Template>
    );
}
