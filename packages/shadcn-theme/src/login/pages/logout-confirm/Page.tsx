import { assert } from "tsafe/assert";

import { Button, buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "logout-confirm.ftl");

    const { url, client, logoutConfirm } = kcContext;

    const { msg, msgStr } = useI18n();
    return (
        <Template headerNode={msg("logoutConfirmTitle")}>
            <div className="flex flex-col gap-4">
                <p className="text-foreground">{msg("logoutConfirmHeader")}</p>

                <form className="flex flex-col gap-6" action={url.logoutConfirmAction} method="POST">
                    <input type="hidden" name="session_code" value={logoutConfirm.code} />

                    <Button className="w-full" name="confirmLogout" id="kc-logout" type="submit">
                        {msgStr("doLogout")}
                    </Button>
                </form>

                {!logoutConfirm.skipLink && client.baseUrl && (
                    <div className="flex justify-end">
                        <a
                            href={client.baseUrl}
                            className={cn(
                                buttonVariants({
                                    variant: "default",
                                }),
                            )}
                        >
                            {msg("backToApplication")}
                        </a>
                    </div>
                )}
            </div>
        </Template>
    );
}
