import { useKcClsx } from "@keycloakify/login-ui/useKcClsx";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-oauth2-device-verify-user-code.ftl");

    const { msg, msgStr } = useI18n();

    const { kcClsx } = useKcClsx();

    return (
        <Template headerNode={msg("oauth2DeviceVerificationTitle")}>
            <form
                id="kc-user-verify-device-user-code-form"
                className="flex flex-col gap-4"
                action={kcContext.url.oauth2DeviceVerificationAction}
                method="post"
            >
                <Field>
                    <FieldLabel htmlFor="device-user-code">{msg("verifyOAuth2DeviceUserCode")}</FieldLabel>
                    <Input
                        id="device-user-code"
                        name="device_user_code"
                        autoComplete="off"
                        type="text"
                        className={kcClsx("kcInputClass")}
                        autoFocus
                    />
                </Field>

                <div className={kcClsx("kcFormGroupClass")}>
                    <div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
                        <div className={kcClsx("kcFormOptionsWrapperClass")}></div>
                    </div>

                    <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                        <div className={kcClsx("kcFormButtonsWrapperClass")}>
                            <Button className="w-full" type="submit">
                                {msgStr("doSubmit")}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}
