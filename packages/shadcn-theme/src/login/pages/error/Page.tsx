import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { XCircle } from "lucide-react";
import { assert } from "tsafe/assert";

import { Alert, AlertDescription } from "#/components/ui/alert";
import { buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

export function Page() {
    const { kcContext } = useKcContext();
    assert(kcContext.pageId === "error.ftl");

    const { msg } = useI18n();

    return (
        <Template displayMessage={false} headerNode={msg("errorTitle")}>
            <div id="kc-error-message" className="flex flex-col gap-4">
                <Alert variant="error">
                    <XCircle />
                    <AlertDescription>
                        <span
                            className="instruction"
                            dangerouslySetInnerHTML={{
                                __html: kcSanitize(kcContext.message.summary),
                            }}
                        />
                    </AlertDescription>
                </Alert>

                {!kcContext.skipLink && !!kcContext.client?.baseUrl && (
                    <div className="flex justify-end">
                        <a
                            id="backToApplication"
                            href={kcContext.client.baseUrl}
                            className={cn(
                                buttonVariants({
                                    variant: "link",
                                }),
                            )}
                        >
                            {msg("backToApplication")}
                        </a>
                    </div>
                )}
            </div>
        </Template>
    );
}
