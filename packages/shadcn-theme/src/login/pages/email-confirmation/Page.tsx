import { assert } from "tsafe/assert";

import { buttonVariants } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

/** Phase Two magic link extension: shown in the tab opened from the emailed link. */
export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "email-confirmation.ftl");

    const { msg } = useI18n();

    const { magicLinkContinuation } = kcContext;

    return (
        <Template displayMessage={false} headerNode={msg("magicLinkConfirmedTitle")}>
            <div className="flex flex-col gap-6 text-sm leading-relaxed">
                {magicLinkContinuation.sameBrowser ? (
                    <>
                        <p>{msg("magicLinkSuccessfulLogin")}</p>
                        <a id="mode-barcode" href={magicLinkContinuation.url} className={buttonVariants()}>
                            {msg("loginPage")}
                        </a>
                    </>
                ) : (
                    <p>{msg("magicLinkConfirmedOtherBrowser")}</p>
                )}
            </div>
        </Template>
    );
}
