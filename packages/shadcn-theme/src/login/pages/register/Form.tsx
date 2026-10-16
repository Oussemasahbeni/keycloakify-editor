import { useKcClsx } from "@keycloakify/login-ui/useKcClsx";
import { useLayoutEffect, useState } from "react";
import { assert } from "tsafe/assert";

import { Button, buttonVariants } from "#/components/ui/button";
import { Field, FieldGroup } from "#/components/ui/field";
import { cn } from "#/lib/utils";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { UserProfileFormFields } from "../../components/UserProfileFormFields";
import { TermsAcceptance } from "./TermsAcceptance";

export function Form() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "register.ftl");
    const { kcClsx } = useKcClsx();
    const { msg, msgStr } = useI18n();

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);

    useLayoutEffect(() => {
        const win = window as typeof window & { onSubmitRecaptcha?: () => void };
        win.onSubmitRecaptcha = () => {
            (document.getElementById("kc-register-form") as HTMLFormElement | null)?.requestSubmit();
        };

        return () => {
            delete win.onSubmitRecaptcha;
        };
    }, []);

    return (
        <form id="kc-register-form" action={kcContext.url.registrationAction} method="post">
            <FieldGroup>
                <UserProfileFormFields onIsFormSubmittableValueChange={setIsFormSubmittable} />
                {kcContext.termsAcceptanceRequired && (
                    <TermsAcceptance
                        messagesPerField={kcContext.messagesPerField}
                        areTermsAccepted={areTermsAccepted}
                        onAreTermsAcceptedValueChange={setAreTermsAccepted}
                    />
                )}
                {kcContext.recaptchaRequired &&
                    (kcContext.recaptchaVisible || kcContext.recaptchaAction === undefined) && (
                        <div className="form-group">
                            <div className={kcClsx("kcInputWrapperClass")}>
                                <div
                                    className="g-recaptcha"
                                    data-size="compact"
                                    data-sitekey={kcContext.recaptchaSiteKey}
                                    data-action={kcContext.recaptchaAction}
                                ></div>
                            </div>
                        </div>
                    )}
                <Field>
                    {kcContext.recaptchaRequired &&
                    !kcContext.recaptchaVisible &&
                    kcContext.recaptchaAction !== undefined ? (
                        <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                            <button
                                className={cn(buttonVariants(), "g-recaptcha w-full")}
                                data-sitekey={kcContext.recaptchaSiteKey}
                                data-callback="onSubmitRecaptcha"
                                data-action={kcContext.recaptchaAction}
                                type="submit"
                            >
                                {msg("doRegister")}
                            </button>
                        </div>
                    ) : (
                        <Button
                            disabled={!isFormSubmittable || (kcContext.termsAcceptanceRequired && !areTermsAccepted)}
                            className="w-full"
                            name="register"
                            type="submit"
                        >
                            {msgStr("doRegister")}
                        </Button>
                    )}

                    <div className="flex justify-end">
                        <a className={cn(buttonVariants({ variant: "link" }))} href={kcContext.url.loginUrl}>
                            {msg("backToLogin")}
                        </a>
                    </div>
                </Field>
            </FieldGroup>
        </form>
    );
}
