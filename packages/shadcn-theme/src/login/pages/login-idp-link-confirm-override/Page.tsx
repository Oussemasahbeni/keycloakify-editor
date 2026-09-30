import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-idp-link-confirm-override.ftl");

    const { msg } = useI18n();

    return (
        <Template headerNode={msg("confirmOverrideIdpTitle")}>
            <form
                id="kc-register-form"
                action={kcContext.url.loginAction}
                className="flex flex-col gap-5"
                method="post"
            >
                <span>
                    {msg("pageExpiredMsg1")}{" "}
                    <a
                        className="text-primary underline underline-offset-2 dark:text-foreground"
                        id="loginRestartLink"
                        href={kcContext.url.loginRestartFlowUrl}
                    >
                        {msg("doClickHere")}
                    </a>
                </span>

                <Button
                    type="submit"
                    className="w-full"
                    name="submitAction"
                    id="confirmOverride"
                    value="confirmOverride"
                >
                    {msg("confirmOverrideIdpContinue", kcContext.idpDisplayName)}
                </Button>
            </form>
        </Template>
    );
}
