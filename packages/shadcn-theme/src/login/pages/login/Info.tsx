import { assert } from "tsafe/assert";

import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

export function Info() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login.ftl");

    const { url } = kcContext;

    const { msg } = useI18n();

    return (
        <div id="kc-registration-container">
            <div id="kc-registration">
                <span className="flex items-center justify-center gap-2">
                    {msg("noAccount")}
                    <a className="underline underline-offset-4" href={url.registrationUrl}>
                        {msg("doRegister")}
                    </a>
                </span>
            </div>
        </div>
    );
}
