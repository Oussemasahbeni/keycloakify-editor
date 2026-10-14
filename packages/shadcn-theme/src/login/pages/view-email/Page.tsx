import { MailCheck } from "lucide-react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

/** Phase Two magic link extension: "check your inbox" after the link was sent. */
export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "view-email.ftl");

    const { msg } = useI18n();

    return (
        <Template displayMessage={false} headerNode={msg("magicLinkCheckEmailTitle")}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4 text-center text-sm leading-relaxed">
                    <MailCheck className="size-10 text-primary" />
                    <p>{msg("magicLinkConfirmation")}</p>
                </div>
                {/* Posting the form again re-runs the authenticator, which sends a new link. */}
                <form action={kcContext.url.loginAction} method="post">
                    <Button className="w-full" variant="outline" type="submit">
                        {msg("doResend")}
                    </Button>
                </form>
            </div>
        </Template>
    );
}
