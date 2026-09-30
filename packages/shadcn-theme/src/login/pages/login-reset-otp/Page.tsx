import { useKcClsx } from "@keycloakify/login-ui/useKcClsx";
import { Smartphone } from "lucide-react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-reset-otp.ftl");

    const { kcClsx } = useKcClsx();

    const { url, messagesPerField, configuredOtpCredentials } = kcContext;

    const { msg, msgStr } = useI18n();

    return (
        <Template displayMessage={!messagesPerField.existsError("totp")} headerNode={msg("doLogIn")}>
            <form id="kc-otp-reset-form" className={kcClsx("kcFormClass")} action={url.loginAction} method="post">
                <div className="flex w-full flex-col gap-4">
                    <p id="kc-otp-reset-form-description">{msg("otp-reset-description")}</p>

                    <RadioGroup
                        name="selectedCredentialId"
                        defaultValue={configuredOtpCredentials.selectedCredentialId}
                        className="flex flex-col gap-2"
                    >
                        {configuredOtpCredentials.userOtpCredentials.map((otpCredential, index) => (
                            <div key={otpCredential.id} className="flex items-center gap-3 rounded-lg border p-3">
                                <Label
                                    htmlFor={`kc-otp-credential-${index}`}
                                    className="flex flex-1 cursor-pointer items-center gap-2"
                                >
                                    <Smartphone className="size-5 shrink-0 text-muted-foreground" />
                                    <span className="text-sm font-medium">{otpCredential.userLabel}</span>
                                </Label>
                                <RadioGroupItem value={otpCredential.id} id={`kc-otp-credential-${index}`} />
                            </div>
                        ))}
                    </RadioGroup>

                    <div className={kcClsx("kcFormGroupClass")}>
                        <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                            <Button id="kc-otp-reset-form-submit" className={"w-full"} type="submit">
                                {msgStr("doSubmit")}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}
