import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "terms.ftl");

    const { msg, msgStr } = useI18n();

    const { url } = kcContext;

    return (
        <Template displayMessage={false} headerNode={msg("termsTitle")}>
            <div className="flex flex-col gap-6">
                <div
                    id="kc-terms-text"
                    className="max-h-64 overflow-y-auto rounded-lg bg-muted/50 p-4 text-sm leading-relaxed"
                >
                    {msg("termsText")}
                </div>

                <form className="flex flex-col gap-4" action={url.loginAction} method="POST">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                        <Button variant="outline" name="cancel" id="kc-decline" type="submit" className="sm:flex-1">
                            {msgStr("doDecline")}
                        </Button>
                        <Button name="accept" id="kc-accept" type="submit" className="sm:flex-1">
                            {msgStr("doAccept")}
                        </Button>
                    </div>
                </form>
            </div>
        </Template>
    );
}
