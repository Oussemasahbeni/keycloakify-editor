import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { Info } from "lucide-react";
import { assert } from "tsafe/assert";

import { Alert, AlertDescription } from "#/components/ui/alert";
import { buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "info.ftl");

    const { advancedMsgStr, msg } = useI18n();

    return (
        <Template
            displayMessage={false}
            headerNode={
                <span
                    dangerouslySetInnerHTML={{
                        __html: kcSanitize(
                            kcContext.messageHeader
                                ? advancedMsgStr(kcContext.messageHeader)
                                : kcContext.message.summary,
                        ),
                    }}
                />
            }
        >
            <Alert variant="info">
                <Info />
                <AlertDescription>
                    <p
                        dangerouslySetInnerHTML={{
                            __html: kcSanitize(
                                (() => {
                                    let html = kcContext.message.summary;

                                    if (kcContext.requiredActions) {
                                        html += "<b>";

                                        html += kcContext.requiredActions
                                            .map(requiredAction => advancedMsgStr(`requiredAction.${requiredAction}`))
                                            .join(", ");

                                        html += "</b>";
                                    }

                                    return html;
                                })(),
                            ),
                        }}
                    />
                </AlertDescription>
            </Alert>

            {(() => {
                if (kcContext.skipLink) {
                    return null;
                }

                if (kcContext.pageRedirectUri) {
                    return (
                        <a
                            href={kcContext.pageRedirectUri}
                            className={cn(
                                buttonVariants({
                                    variant: "default",
                                }),
                                "ms-auto flex",
                            )}
                        >
                            {msg("backToApplication")}
                        </a>
                    );
                }
                if (kcContext.actionUri) {
                    return (
                        <a
                            href={kcContext.actionUri}
                            className={cn(
                                buttonVariants({
                                    variant: "default",
                                }),
                                "ms-auto flex",
                            )}
                        >
                            {msg("proceedWithAction")}
                        </a>
                    );
                }

                if (kcContext.client.baseUrl) {
                    return (
                        <a
                            href={kcContext.client.baseUrl}
                            className={cn(
                                buttonVariants({
                                    variant: "link",
                                }),
                                "ms-auto flex",
                            )}
                        >
                            {msg("backToApplication")}
                        </a>
                    );
                }
            })()}
        </Template>
    );
}
