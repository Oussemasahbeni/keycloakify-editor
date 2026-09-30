import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useState } from "react";
import { MdOutlineDevices } from "react-icons/md";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Field, FieldError } from "#/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "#/components/ui/input-otp";
import { Label } from "#/components/ui/label";
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "login-otp.ftl");

    const { msg, msgStr } = useI18n();

    const [isSubmitting, setIsSubmitting] = useState(false);
    return (
        <Template displayMessage={!kcContext.messagesPerField.existsError("totp")} headerNode={msg("doLogIn")}>
            <form
                id="kc-otp-login-form"
                className="flex flex-col gap-6"
                action={kcContext.url.loginAction}
                onSubmit={() => {
                    setIsSubmitting(true);
                    return true;
                }}
                method="post"
            >
                {kcContext.otpLogin.userOtpCredentials.length > 1 && (
                    <RadioGroup
                        name="selectedCredentialId"
                        defaultValue={kcContext.otpLogin.selectedCredentialId}
                        className="flex flex-col gap-3"
                    >
                        {kcContext.otpLogin.userOtpCredentials.map((otpCredential, index) => (
                            <div key={otpCredential.id} className="flex items-center gap-3 rounded-lg border p-3">
                                <RadioGroupItem value={otpCredential.id} id={`kc-otp-credential-${index}`} />
                                <Label
                                    htmlFor={`kc-otp-credential-${index}`}
                                    className="flex flex-1 cursor-pointer items-center gap-2"
                                >
                                    <MdOutlineDevices />
                                    <span className="text-sm font-medium">{otpCredential.userLabel}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}

                <Field>
                    <Label htmlFor="otp" className="block text-sm font-medium">
                        {msg("loginOtpOneTime")}
                    </Label>
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

                <Button className="w-full" name="login" id="kc-login" type="submit" disabled={isSubmitting}>
                    {msgStr("doLogIn")}
                </Button>
            </form>
        </Template>
    );
}
