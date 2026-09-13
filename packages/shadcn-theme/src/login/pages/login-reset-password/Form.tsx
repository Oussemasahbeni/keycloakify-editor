import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { assert } from "tsafe/assert";

import { Button, buttonVariants } from "#/components/ui/button";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { useI18n } from "#/login/i18n";
import { useKcContext } from "#/login/KcContext";
import { useKcEnv } from "#/login/useKcEnv";

export function Form() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-reset-password.ftl");

    const { msg, msgStr } = useI18n();
    const { SHADCN_THEME_SHOW_PLACEHOLDER: showPlaceholder } = useKcEnv();

    return (
        <form
            id="kc-reset-password-form"
            className="flex flex-col gap-4"
            action={kcContext.url.loginAction}
            method="post"
        >
            <Field>
                <FieldLabel htmlFor="username">
                    {" "}
                    {!kcContext.realm.loginWithEmailAllowed
                        ? msg("username")
                        : !kcContext.realm.registrationEmailAsUsername
                          ? msg("usernameOrEmail")
                          : msg("email")}
                </FieldLabel>
                <Input
                    type="text"
                    id="username"
                    name="username"
                    autoFocus
                    defaultValue={kcContext.auth.attemptedUsername ?? ""}
                    placeholder={
                        showPlaceholder
                            ? !kcContext.realm.loginWithEmailAllowed
                                ? msgStr("usernamePlaceholder")
                                : !kcContext.realm.registrationEmailAsUsername
                                  ? msgStr("usernameOrEmailPlaceholder")
                                  : msgStr("emailPlaceholder")
                            : undefined
                    }
                    aria-invalid={kcContext.messagesPerField.existsError("username")}
                />
                {kcContext.messagesPerField.existsError("username") && (
                    <FieldError>
                        <span
                            id="input-error"
                            aria-live="polite"
                            dangerouslySetInnerHTML={{
                                __html: kcSanitize(kcContext.messagesPerField.getFirstError("username")),
                            }}
                        />
                    </FieldError>
                )}
            </Field>

            <Button className="w-full" type="submit">
                {msgStr("doSubmit")}
            </Button>

            <div className="flex justify-end">
                <a
                    id="backToApplication"
                    href={kcContext.url.loginUrl}
                    className={buttonVariants({
                        variant: "link",
                    })}
                >
                    {msg("backToApplication")}
                </a>
            </div>
        </form>
    );
}
