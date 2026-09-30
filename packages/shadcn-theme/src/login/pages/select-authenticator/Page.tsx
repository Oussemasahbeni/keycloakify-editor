import { ChevronRight, Fingerprint, Globe, KeyRound, Shield } from "lucide-react";
import { FaKey } from "react-icons/fa";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

const getAuthenticatorIcon = (authSelection: { displayName: string; iconCssClass?: string }) => {
    const displayName = authSelection.displayName.toLowerCase();
    const iconClass = authSelection.iconCssClass?.toLowerCase() || "";

    if (
        displayName.includes("webauthn") ||
        displayName.includes("passwordless") ||
        iconClass.includes("webauthn") ||
        displayName.includes("passkey")
    ) {
        return <Fingerprint className="size-5" />;
    }

    if (displayName.includes("otp") || displayName.includes("totp") || displayName.includes("authenticator")) {
        return <Shield className="size-5" />;
    }

    if (
        displayName.includes("identity-provider") ||
        displayName.includes("idp") ||
        displayName.includes("sso") ||
        iconClass.includes("identityprovider")
    ) {
        return <Globe className="size-5" />;
    }

    if (displayName.includes("password") || displayName.includes("username") || iconClass.includes("password")) {
        return <KeyRound className="size-5" />;
    }

    return <FaKey className="size-5" />;
};

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "select-authenticator.ftl");

    const { url, auth } = kcContext;

    const { msg, advancedMsg } = useI18n();
    return (
        <Template displayInfo={false} headerNode={msg("loginChooseAuthenticator")}>
            <form id="kc-select-credential-form" className="flex flex-col gap-3" action={url.loginAction} method="post">
                <div className="flex flex-col gap-2">
                    {auth.authenticationSelections.map(authenticationSelection => (
                        <Button
                            key={authenticationSelection.authExecId}
                            variant="outline"
                            className="flex h-auto w-full items-center justify-between p-3 text-start hover:bg-accent"
                            type="submit"
                            name="authenticationExecution"
                            value={authenticationSelection.authExecId}
                        >
                            <div className="flex flex-1 items-start justify-start gap-3">
                                <span className="mt-0.5 shrink-0">{getAuthenticatorIcon(authenticationSelection)}</span>

                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium">
                                        {advancedMsg(authenticationSelection.displayName)}
                                    </div>
                                    <div className="mt-1 text-xs whitespace-normal text-muted-foreground">
                                        {advancedMsg(authenticationSelection.helpText)}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                        </Button>
                    ))}
                </div>
            </form>
        </Template>
    );
}
