import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-x509-info.ftl");

    const { url, x509 } = kcContext;

    const { msg, msgStr } = useI18n();

    return (
        <Template headerNode={msg("doLogIn")}>
            <form id="kc-x509-login-info" className="flex flex-col gap-6" action={url.loginAction} method="post">
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">{msg("clientCertificate")}</Label>
                    <div className="rounded-lg bg-muted/50 p-3">
                        <p className="font-mono text-sm break-all">{x509.formData.subjectDN || msg("noCertificate")}</p>
                    </div>
                </div>

                {x509.formData.isUserEnabled && (
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">{msg("doX509Login")}</Label>
                        <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-sm font-medium">{x509.formData.username}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                    {x509.formData.isUserEnabled && (
                        <Button variant="outline" name="cancel" id="kc-cancel" type="submit" className="sm:flex-1">
                            {msgStr("doIgnore")}
                        </Button>
                    )}
                    <Button name="login" id="kc-login" type="submit" className="sm:flex-1">
                        {msgStr("doContinue")}
                    </Button>
                </div>
            </form>
        </Template>
    );
}
