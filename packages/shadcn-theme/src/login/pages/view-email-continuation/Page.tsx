import { MailCheck } from "lucide-react";
import { useEffect } from "react";
import { assert } from "tsafe/assert";

import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

const RELOAD_DELAY_MS = 5000;

/**
 * Phase Two magic link extension, "continuation" mode: this tab waits while the user opens the
 * link elsewhere, reloading periodically so Keycloak can move the flow on once it is confirmed.
 */
export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "view-email-continuation.ftl");

    const { msg } = useI18n();

    useEffect(() => {
        // Only poll on a real Keycloak render; Storybook and the editor preview use a mock context.
        if (window.kcContext === undefined) {
            return;
        }
        const timeoutId = setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <Template displayMessage={false} headerNode={msg("magicLinkCheckEmailTitle")}>
            <div className="flex flex-col items-center gap-4 text-center text-sm leading-relaxed">
                <MailCheck className="size-10 text-primary" />
                <p>{msg("magicLinkContinuationConfirmation")}</p>
            </div>
        </Template>
    );
}
