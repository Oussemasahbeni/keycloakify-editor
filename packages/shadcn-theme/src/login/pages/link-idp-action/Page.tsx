import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "link-idp-action.ftl");

    const { msg, msgStr } = useI18n();

    return (
        <Template headerNode={msg("linkIdpActionTitle", kcContext.idpDisplayName)} displayMessage={false}>
            <div id="kc-link-text">{msg("linkIdpActionMessage", kcContext.idpDisplayName)}</div>
            <form action={kcContext.url.loginAction} method="post">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button name="cancel-aia" variant="outline" className="flex-1" id="kc-cancel" type="submit">
                        {msgStr("doCancel")}
                    </Button>
                    <Button name="continue" id="kc-continue" type="submit" className="flex-1">
                        {msgStr("doContinue")}
                    </Button>
                </div>
            </form>
            <div className="clearfix" />
        </Template>
    );
}
