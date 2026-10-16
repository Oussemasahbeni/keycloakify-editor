import { useState } from "react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Field, FieldGroup } from "#/components/ui/field";
import { LogoutOtherSessions } from "#/login/components/LogoutOtherSessions.tsx";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";
import { UserProfileFormFields } from "../../components/UserProfileFormFields";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "update-email.ftl");

    const { msg, msgStr } = useI18n();

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);

    const { url, messagesPerField, isAppInitiatedAction } = kcContext;

    return (
        <Template
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields
            headerNode={msg("updateEmailTitle")}
        >
            <form id="kc-update-email-form" action={url.loginAction} method="post">
                <FieldGroup>
                    <UserProfileFormFields onIsFormSubmittableValueChange={setIsFormSubmittable} />

                    <LogoutOtherSessions />

                    <Field>
                        <Button disabled={!isFormSubmittable} className="w-full" type="submit">
                            {msgStr("doSubmit")}
                        </Button>
                        {isAppInitiatedAction && (
                            <Button variant="outline" className="w-full" type="submit" name="cancel-aia" value="true">
                                {msg("doCancel")}
                            </Button>
                        )}
                    </Field>
                </FieldGroup>
            </form>
        </Template>
    );
}
