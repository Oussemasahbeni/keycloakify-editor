import { assert } from "tsafe/assert";

import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";
import { Form } from "./Form";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-reset-password.ftl");

    const { msg } = useI18n();

    return (
        <Template
            displayInfo
            displayMessage={!kcContext.messagesPerField.existsError("username")}
            infoNode={
                kcContext.realm.duplicateEmailsAllowed ? msg("emailInstructionUsername") : msg("emailInstruction")
            }
            headerNode={msg("emailForgotTitle")}
        >
            <Form />
        </Template>
    );
}
