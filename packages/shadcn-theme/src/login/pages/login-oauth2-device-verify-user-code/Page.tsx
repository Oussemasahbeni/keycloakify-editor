import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-oauth2-device-verify-user-code.ftl");

    const { msg, msgStr } = useI18n();

    return (
        <Template headerNode={msg("oauth2DeviceVerificationTitle")}>
            <form
                id="kc-user-verify-device-user-code-form"
                action={kcContext.url.oauth2DeviceVerificationAction}
                method="post"
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="device-user-code">{msg("verifyOAuth2DeviceUserCode")}</FieldLabel>
                        <Input id="device-user-code" name="device_user_code" autoComplete="off" type="text" autoFocus />
                    </Field>

                    <Field id="kc-form-buttons">
                        <Button className="w-full" type="submit">
                            {msgStr("doSubmit")}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        </Template>
    );
}
