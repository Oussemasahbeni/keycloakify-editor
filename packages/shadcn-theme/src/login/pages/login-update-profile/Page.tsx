import { useState } from "react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Field, FieldGroup } from "#/components/ui/field";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";
import { UserProfileFormFields } from "../../components/UserProfileFormFields";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-update-profile.ftl");

    const { messagesPerField, url, isAppInitiatedAction } = kcContext;

    const { msg, msgStr } = useI18n();

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);

    return (
        <Template
            displayRequiredFields
            headerNode={msg("loginProfileTitle")}
            displayMessage={messagesPerField.exists("global")}
        >
            <form id="kc-update-profile-form" action={url.loginAction} method="post">
                <FieldGroup>
                    <UserProfileFormFields onIsFormSubmittableValueChange={setIsFormSubmittable} />

                    <Field id="kc-form-buttons">
                        <Button
                            disabled={!isFormSubmittable}
                            className="w-full"
                            type="submit"
                            value={msgStr("doSubmit")}
                        >
                            {msgStr("doSubmit")}
                        </Button>
                        {isAppInitiatedAction && (
                            <Button variant="secondary" className="w-full" type="submit" name="cancel-aia" value="true">
                                {msg("doCancel")}
                            </Button>
                        )}
                    </Field>
                </FieldGroup>
            </form>
        </Template>
    );
}
