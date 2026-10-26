import { assert } from "tsafe/assert";

import { SocialProviders } from "#/login/components/socialProviders/SocialProviders.tsx";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";
import { Form } from "./Form";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "register.ftl");

    const { msg, advancedMsg } = useI18n();

    return (
        <Template
            headerNode={
                kcContext.messageHeader !== undefined ? advancedMsg(kcContext.messageHeader) : msg("registerTitle")
            }
            displayMessage={kcContext.messagesPerField.exists("global")}
            displayRequiredFields
            socialProvidersNode={kcContext.social !== undefined && <SocialProviders />}
        >
            <Form />
        </Template>
    );
}
