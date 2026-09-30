import { assert } from "tsafe/assert";

import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-page-expired.ftl");

    const { msg } = useI18n();

    return (
        <Template headerNode={msg("pageExpiredTitle")}>
            <div className="flex flex-col gap-3 text-sm leading-relaxed">
                <p>
                    {msg("pageExpiredMsg1")}{" "}
                    <a
                        id="loginRestartLink"
                        href={kcContext.url.loginRestartFlowUrl}
                        className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 dark:text-foreground"
                    >
                        {msg("doClickHere")}
                    </a>
                    .
                </p>
                <p>
                    {msg("pageExpiredMsg2")}{" "}
                    <a
                        id="loginContinueLink"
                        href={kcContext.url.loginAction}
                        className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 dark:text-foreground"
                    >
                        {msg("doClickHere")}
                    </a>
                    .
                </p>
            </div>
        </Template>
    );
}
