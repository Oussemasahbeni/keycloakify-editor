import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { assert } from "tsafe/assert";

import { Button, buttonVariants } from "#/components/ui/button";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";
import { LogoutOtherSessions } from "#/login/components/LogoutOtherSessions.tsx";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "login-config-totp.ftl");

    const { msg, msgStr, advancedMsg } = useI18n();

    return (
        <Template
            headerNode={msg("loginTotpTitle")}
            displayMessage={!kcContext.messagesPerField.existsError("totp", "userLabel")}
        >
            <ol id="kc-totp-settings" className="flex list-decimal flex-col gap-4 px-4 text-sm text-foreground">
                <li className="flex flex-col gap-2">
                    <p>{msg("loginTotpStep1")}</p>
                    <ul className="ms-4 list-inside list-disc" id="kc-totp-supported-apps">
                        {kcContext.totp.supportedApplications.map(app => (
                            <li className="text-primary" key={app}>
                                {advancedMsg(app)}
                            </li>
                        ))}
                    </ul>
                </li>

                {kcContext.mode == "manual" ? (
                    <>
                        <li>
                            <p className="mb-3">{msg("loginTotpManualStep2")}</p>
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <div>
                                    <span
                                        id="kc-totp-secret-key"
                                        className="rounded border bg-secondary px-3 py-2 font-mono text-lg break-all"
                                    >
                                        {kcContext.totp.totpSecretEncoded}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <a
                                        href={kcContext.totp.qrUrl}
                                        className={cn(
                                            buttonVariants({
                                                variant: "outline",
                                            }),
                                            "text-sm",
                                        )}
                                    >
                                        {msg("loginTotpScanBarcode")}
                                    </a>
                                </div>
                            </div>
                        </li>
                        <li>
                            <p className="mb-3">{msg("loginTotpManualStep3")}</p>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{msg("loginTotpType")}:</span>
                                        <span className="rounded bg-secondary px-2 py-1 font-mono text-xs">
                                            {msg(`loginTotp.${kcContext.totp.policy.type}`)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{msg("loginTotpAlgorithm")}:</span>
                                        <span className="rounded bg-secondary px-2 py-1 font-mono text-xs">
                                            {kcContext.totp.policy.getAlgorithmKey()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{msg("loginTotpDigits")}:</span>
                                        <span className="rounded bg-secondary px-2 py-1 font-mono text-xs">
                                            {kcContext.totp.policy.digits}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {kcContext.totp.policy.type === "totp"
                                                ? msg("loginTotpInterval")
                                                : msg("loginTotpCounter")}
                                            :
                                        </span>
                                        <span className="rounded bg-secondary px-2 py-1 font-mono text-xs">
                                            {kcContext.totp.policy.type === "totp"
                                                ? kcContext.totp.policy.period
                                                : kcContext.totp.policy.initialCounter}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </>
                ) : (
                    <li className="space-y-2">
                        <p>{msg("loginTotpStep2")}</p>
                        <img
                            id="kc-totp-secret-qr-code"
                            className="mt-2 dark:mt-0"
                            src={`data:image/png;base64, ${kcContext.totp.totpSecretQrCode}`}
                            alt="QR code for authenticator app setup — use the manual entry link below if you cannot scan"
                        />

                        <a
                            href={kcContext.totp.manualUrl}
                            id="mode-manual"
                            className={cn(
                                buttonVariants({
                                    variant: "outline",
                                }),
                            )}
                        >
                            {msg("loginTotpUnableToScan")}
                        </a>
                    </li>
                )}
                <li>
                    <p>{msg("loginTotpStep3")}</p>
                    <p>{msg("loginTotpStep3DeviceName")}</p>
                </li>
            </ol>

            <form
                action={kcContext.url.loginAction}
                className="flex flex-col gap-4"
                id="kc-totp-settings-form"
                method="post"
            >
                <div>
                    <Field>
                        <FieldLabel htmlFor="totp">
                            {msg("authenticatorCode")} <span className="required">*</span>
                        </FieldLabel>
                        <Input
                            type="text"
                            id="totp"
                            name="totp"
                            autoComplete="off"
                            aria-invalid={kcContext.messagesPerField.existsError("totp")}
                        />
                        {kcContext.messagesPerField.existsError("totp") && (
                            <FieldError>
                                {" "}
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(kcContext.messagesPerField.get("totp")),
                                    }}
                                />
                            </FieldError>
                        )}
                    </Field>
                    <input type="hidden" id="totpSecret" name="totpSecret" value={kcContext.totp.totpSecret} />
                    {kcContext.mode && <input type="hidden" id="mode" value={kcContext.mode} />}
                </div>

                <div>
                    <Field>
                        <FieldLabel htmlFor="userLabel">
                            {msg("loginTotpDeviceName")}{" "}
                            {kcContext.totp.otpCredentials.length >= 1 && <span className="required">*</span>}
                        </FieldLabel>
                        <Input
                            type="text"
                            id="userLabel"
                            name="userLabel"
                            autoComplete="off"
                            aria-invalid={kcContext.messagesPerField.existsError("userLabel")}
                        />
                        {kcContext.messagesPerField.existsError("userLabel") && (
                            <FieldError>
                                {" "}
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(kcContext.messagesPerField.get("userLabel")),
                                    }}
                                />
                            </FieldError>
                        )}
                    </Field>
                </div>

                <LogoutOtherSessions />

                {kcContext.isAppInitiatedAction ? (
                    <>
                        <div className="flex justify-between gap-3">
                            <Button
                                variant="secondary"
                                value="true"
                                id="cancelTOTPBtn"
                                name="cancel-aia"
                                type="submit"
                                className="flex-1"
                            >
                                {msgStr("doCancel")}
                            </Button>
                            <Button id="saveTOTPBtn" type="submit" className="flex-1">
                                {msgStr("doSubmit")}
                            </Button>
                        </div>
                    </>
                ) : (
                    <Button id="saveTOTPBtn" className="w-full" type="submit">
                        {msgStr("doSubmit")}
                    </Button>
                )}
            </form>
        </Template>
    );
}
