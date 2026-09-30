import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-oauth-grant.ftl");

    const { msg, msgStr, advancedMsg, advancedMsgStr } = useI18n();

    return (
        <Template
            bodyClassName="oauth"
            headerNode={
                <div className="flex flex-col items-center gap-3">
                    {kcContext.client.attributes.logoUri && (
                        <img
                            src={kcContext.client.attributes.logoUri}
                            alt="Client logo"
                            className="h-12 w-auto object-contain"
                        />
                    )}
                    <p className="text-center text-lg font-medium">
                        {kcContext.client.name
                            ? msg("oauthGrantTitle", advancedMsgStr(kcContext.client.name))
                            : msg("oauthGrantTitle", kcContext.client.clientId)}
                    </p>
                </div>
            }
        >
            <div className="flex flex-col gap-4">
                <div className="text-base">{msg("oauthGrantRequest")}</div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        {kcContext.oauth.clientScopesRequested.map(clientScope => (
                            <div key={clientScope.consentScreenText} className="flex items-start gap-2">
                                <div className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                                <span className="text-sm text-muted-foreground">
                                    {advancedMsg(clientScope.consentScreenText)}
                                    {clientScope.dynamicScopeParameter && (
                                        <>
                                            :{" "}
                                            <span className="font-medium text-foreground">
                                                {clientScope.dynamicScopeParameter}
                                            </span>
                                        </>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>

                    {(kcContext.client.attributes.policyUri || kcContext.client.attributes.tosUri) && (
                        <>
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-muted-foreground">
                                    {kcContext.client.name
                                        ? msg("oauthGrantInformation", advancedMsgStr(kcContext.client.name))
                                        : msg("oauthGrantInformation", kcContext.client.clientId)}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {kcContext.client.attributes.tosUri && (
                                        <a
                                            href={kcContext.client.attributes.tosUri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline underline-offset-4 hover:text-primary/80 dark:text-foreground"
                                        >
                                            {msg("oauthGrantTos")}
                                        </a>
                                    )}
                                    {kcContext.client.attributes.policyUri && (
                                        <a
                                            href={kcContext.client.attributes.policyUri}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline underline-offset-4 hover:text-primary/80 dark:text-foreground"
                                        >
                                            {msg("oauthGrantPolicy")}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div>
                    <form className="w-full" action={kcContext.url.oauthAction} method="POST">
                        <input type="hidden" name="code" value={kcContext.oauth.code} />
                        <div className="flex w-full flex-col gap-3 sm:flex-row">
                            <Button type="submit" name="cancel" id="kc-cancel" variant="outline" className="flex-1">
                                {msgStr("doNo")}
                            </Button>
                            <Button type="submit" name="accept" id="kc-login" className="flex-1">
                                {msgStr("doYes")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Template>
    );
}
