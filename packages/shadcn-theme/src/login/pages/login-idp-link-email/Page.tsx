import { assert } from "tsafe/assert";

import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-idp-link-email.ftl");

    const { msg } = useI18n();

    return (
        <Template headerNode={msg("emailLinkIdpTitle", kcContext.idpAlias)}>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>
                    {msg(
                        "emailLinkIdp1",
                        kcContext.idpAlias,
                        kcContext.brokerContext.username,
                        kcContext.realm.displayName,
                    )}
                </p>
                <p className="leading-relaxed">
                    {msg("emailLinkIdp2")}{" "}
                    <a
                        href={kcContext.url.loginAction}
                        className="inline-flex items-center gap-1 text-primary underline underline-offset-2 dark:text-foreground"
                    >
                        {msg("doClickHere")}
                    </a>{" "}
                    {msg("emailLinkIdp3")}
                </p>

                <p className="leading-relaxed">
                    {msg("emailLinkIdp4")}{" "}
                    <a
                        href={kcContext.url.loginAction}
                        className="inline-flex items-center gap-1 text-primary underline underline-offset-2 dark:text-foreground"
                    >
                        {msg("doClickHere")}
                    </a>{" "}
                    {msg("emailLinkIdp5")}
                </p>
            </div>
        </Template>
    );
}
