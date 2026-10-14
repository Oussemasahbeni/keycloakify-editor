import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

/** The message is HTML (it bolds both names), so the usernames must not be able to inject markup. */
function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

/**
 * Phase Two magic link extension (Login Token): the token belongs to a different user than the one
 * already signed in on this browser.
 */
export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "login-token-user-switch.ftl");

    const { msg } = useI18n();

    return (
        <Template headerNode={msg("doLogIn")}>
            <form
                id="kc-user-switch-form"
                className="flex flex-col gap-6"
                action={kcContext.url.loginAction}
                method="post"
            >
                <p className="text-sm leading-relaxed">
                    {msg(
                        "magicLinkUserSwitchInfo",
                        escapeHtml(kcContext.currentUsername),
                        escapeHtml(kcContext.targetUsername),
                    )}
                </p>

                <div id="kc-form-buttons" className="flex gap-3">
                    <Button
                        className="flex-1"
                        variant="outline"
                        name="action"
                        id="kc-cancel"
                        type="submit"
                        value="cancel"
                    >
                        {msg("doCancel")}
                    </Button>
                    <Button className="flex-1" name="action" id="kc-logout" type="submit" value="logout">
                        {msg("magicLinkLogoutAndContinue")}
                    </Button>
                </div>
            </form>
        </Template>
    );
}
