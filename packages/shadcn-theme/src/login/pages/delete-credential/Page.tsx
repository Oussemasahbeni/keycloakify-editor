import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "delete-credential.ftl");

    const { msgStr, msg } = useI18n();

    return (
        <Template displayMessage={false} headerNode={msg("deleteCredentialTitle", kcContext.credentialLabel)}>
            <p>{msg("deleteCredentialMessage", kcContext.credentialLabel)}</p>

            <form className="form-actions" action={kcContext.url.loginAction} method="POST">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button variant="outline" name="cancel-aia" id="kc-decline" type="submit" className="sm:flex-1">
                        {msgStr("doCancel")}
                    </Button>

                    <Button name="accept" id="kc-accept" type="submit" variant="destructive" className="sm:flex-1">
                        {msgStr("doConfirmDelete")}
                    </Button>
                </div>
            </form>
        </Template>
    );
}
