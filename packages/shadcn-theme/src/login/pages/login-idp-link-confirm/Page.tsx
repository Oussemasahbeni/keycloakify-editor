import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-idp-link-confirm.ftl");

    const { msg } = useI18n();

    return (
        <Template headerNode={msg("confirmLinkIdpTitle")}>
            <form id="kc-register-form" action={kcContext.url.loginAction} method="post">
                <div className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full"
                        variant="outline"
                        name="submitAction"
                        id="updateProfile"
                        value="updateProfile"
                    >
                        {msg("confirmLinkIdpReviewProfile")}
                    </Button>
                    <Button type="submit" className="w-full" name="submitAction" id="linkAccount" value="linkAccount">
                        {msg("confirmLinkIdpContinue", kcContext.idpAlias)}
                    </Button>
                </div>
            </form>
        </Template>
    );
}
