import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

/** Phase Two magic link extension (Login Token): sign in by entering a login token. */
export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "login-token-form.ftl");

    const { msg, msgStr } = useI18n();

    // The extension reports token errors as a form-level message; show it under the field instead.
    const error = kcContext.message?.type === "error" ? kcContext.message.summary : undefined;

    return (
        <Template displayMessage={error === undefined} headerNode={msg("doLogIn")}>
            <form
                id="kc-login-token-form"
                className="flex flex-col gap-6"
                action={kcContext.url.loginAction}
                method="post"
            >
                <Field>
                    <FieldLabel htmlFor="login_token">{msg("loginTokenLabel")}</FieldLabel>
                    <Input
                        id="login_token"
                        name="login_token"
                        type="text"
                        autoComplete="off"
                        autoFocus
                        aria-invalid={error !== undefined}
                    />
                    {error !== undefined && (
                        <FieldError>
                            <span aria-live="polite" dangerouslySetInnerHTML={{ __html: kcSanitize(error) }} />
                        </FieldError>
                    )}
                </Field>

                <Button className="w-full" name="submit" id="kc-submit" type="submit">
                    {msgStr("doSubmit")}
                </Button>
            </form>
        </Template>
    );
}
