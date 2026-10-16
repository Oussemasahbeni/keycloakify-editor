import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "#/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "#/components/ui/input-otp";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

/** Phase Two magic link extension: one-time code sent by email. */
export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "otp-form.ftl");

    const { msg, msgStr } = useI18n();

    return (
        <Template displayMessage={!kcContext.messagesPerField.existsError("totp")} headerNode={msg("doLogIn")}>
            <form id="kc-otp-login-form" action={kcContext.url.loginAction} method="post">
                <FieldGroup>
                    <FieldDescription>{msg("enterAccessCode")}</FieldDescription>

                    <Field>
                        <FieldLabel htmlFor="otp">{msg("loginOtpOneTime")}</FieldLabel>
                        <InputOTP id="otp" maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} name="otp" autoFocus>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className="size-12 text-lg" />
                                <InputOTPSlot index={1} className="size-12 text-lg" />
                                <InputOTPSlot index={2} className="size-12 text-lg" />
                                <InputOTPSlot index={3} className="size-12 text-lg" />
                                <InputOTPSlot index={4} className="size-12 text-lg" />
                                <InputOTPSlot index={5} className="size-12 text-lg" />
                            </InputOTPGroup>
                        </InputOTP>
                        {kcContext.messagesPerField.existsError("totp") && (
                            <FieldError id="input-error-otp-code">
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(kcContext.messagesPerField.get("totp")),
                                    }}
                                />
                            </FieldError>
                        )}
                    </Field>

                    {/* Not disabled on submit: a disabled submitter is left out of the form data, and the
                    extension tells "resend" from "submit" by which button's name is posted. */}
                    <Field id="kc-form-buttons">
                        <Button className="w-full" name="submit" id="kc-submit" type="submit">
                            {msgStr("doSubmit")}
                        </Button>
                        <Button className="w-full" variant="outline" name="resend" id="kc-resend" type="submit">
                            {msgStr("doResend")}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </Template>
    );
}
