import { assert } from "tsafe/assert";

import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

/** Phase Two magic link extension: the emailed link points to an expired authentication session. */
export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "email-confirmation-error.ftl");

    const { msg } = useI18n();

    return (
        <Template displayMessage={false} headerNode={msg("magicLinkExpiredTitle")}>
            <p className="text-sm leading-relaxed">{msg("magicLinkFailLogin")}</p>
        </Template>
    );
}
