import { assert } from "tsafe/assert";

import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-verify-email.ftl");

    const { msg } = useI18n();

    const { url, user } = kcContext;
    return (
        <Template
            displayInfo
            headerNode={msg("emailVerifyTitle")}
            infoNode={
                <p className="text-start">
                    {msg("emailVerifyInstruction2")}
                    <br />
                    <a className="text-primary underline" href={url.loginAction}>
                        {msg("doClickHere")}
                    </a>
                    &nbsp;
                    {msg("emailVerifyInstruction3")}
                </p>
            }
        >
            <p className="instruction">{msg("emailVerifyInstruction1", user?.email ?? "")}</p>
        </Template>
    );
}
