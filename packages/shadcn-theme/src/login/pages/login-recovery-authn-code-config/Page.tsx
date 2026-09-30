import { AlertTriangle, Copy, Download, Printer } from "lucide-react";
import { assert } from "tsafe/assert";

import { Alert, AlertDescription } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Label } from "#/components/ui/label";
import { LogoutOtherSessions } from "#/login/components/LogoutOtherSessions.tsx";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";
import { useScript } from "./useScript";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-recovery-authn-code-config.ftl");

    const { recoveryAuthnCodesConfigBean, isAppInitiatedAction } = kcContext;

    const { msg, msgStr } = useI18n();

    const olRecoveryCodesListId = "kc-recovery-codes-list";

    useScript({ olRecoveryCodesListId });

    return (
        <Template headerNode={msg("recovery-code-config-header")}>
            <div className="flex flex-col gap-6">
                <Alert variant="warning">
                    <AlertTriangle />
                    <AlertDescription>
                        <div className="flex flex-col gap-2">
                            <h4 className="font-medium">{msg("recovery-code-config-warning-title")}</h4>
                            <p className="text-sm">{msg("recovery-code-config-warning-message")}</p>
                        </div>
                    </AlertDescription>
                </Alert>

                <div className="rounded-lg bg-muted/50 p-4">
                    <ol id={olRecoveryCodesListId} className="grid grid-cols-1 gap-2 font-mono text-sm sm:grid-cols-2">
                        {recoveryAuthnCodesConfigBean.generatedRecoveryAuthnCodesList.map((code, index) => (
                            <li key={code} className="flex items-center">
                                <span className="min-w-8 text-muted-foreground">{index + 1}:</span>
                                <span className="font-medium">
                                    {code.slice(0, 4)}-{code.slice(4, 8)}-{code.slice(8)}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        id="printRecoveryCodes"
                        variant="outline"
                        size="sm"
                        type="button"
                        className="flex items-center gap-2"
                    >
                        <Printer className="size-4" />
                        {msg("recovery-codes-print")}
                    </Button>
                    <Button
                        id="downloadRecoveryCodes"
                        variant="outline"
                        size="sm"
                        type="button"
                        className="flex items-center gap-2"
                    >
                        <Download className="size-4" />
                        {msg("recovery-codes-download")}
                    </Button>
                    <Button
                        id="copyRecoveryCodes"
                        variant="outline"
                        size="sm"
                        type="button"
                        className="flex items-center gap-2"
                    >
                        <Copy className="size-4" />
                        {msg("recovery-codes-copy")}
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="kcRecoveryCodesConfirmationCheck"
                        name="kcRecoveryCodesConfirmationCheck"
                        onCheckedChange={checked => {
                            const saveButton = document.getElementById(
                                "saveRecoveryAuthnCodesBtn",
                            ) as HTMLButtonElement | null;
                            if (saveButton) {
                                saveButton.disabled = !checked;
                            }
                        }}
                    />
                    <Label htmlFor="kcRecoveryCodesConfirmationCheck" className="cursor-pointer text-sm font-medium">
                        {msg("recovery-codes-confirmation-message")}
                    </Label>
                </div>

                <form
                    action={kcContext.url.loginAction}
                    className="flex flex-col gap-4"
                    id="kc-recovery-codes-settings-form"
                    method="post"
                >
                    <input
                        type="hidden"
                        name="generatedRecoveryAuthnCodes"
                        value={recoveryAuthnCodesConfigBean.generatedRecoveryAuthnCodesAsString}
                    />
                    <input type="hidden" name="generatedAt" value={recoveryAuthnCodesConfigBean.generatedAt} />
                    <input
                        type="hidden"
                        id="userLabel"
                        name="userLabel"
                        value={msgStr("recovery-codes-label-default")}
                    />

                    <LogoutOtherSessions />

                    {isAppInitiatedAction ? (
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button type="submit" id="saveRecoveryAuthnCodesBtn" disabled className="sm:flex-1">
                                {msgStr("recovery-codes-action-complete")}
                            </Button>
                            <Button
                                type="submit"
                                variant="outline"
                                name="cancel-aia"
                                value="true"
                                id="cancelRecoveryAuthnCodesBtn"
                                className="sm:flex-1"
                            >
                                {msg("recovery-codes-action-cancel")}
                            </Button>
                        </div>
                    ) : (
                        <Button type="submit" className="w-full" id="saveRecoveryAuthnCodesBtn" disabled>
                            {msgStr("recovery-codes-action-complete")}
                        </Button>
                    )}
                </form>
            </div>
        </Template>
    );
}
