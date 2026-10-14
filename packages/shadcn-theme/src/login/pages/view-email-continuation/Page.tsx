import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { assert } from "tsafe/assert";

import { Spinner } from "#/components/ui/spinner";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

const POLL_INTERVAL_MS = 2500;
const RETRY_INTERVAL_MS = 4000;

type ContinuationState = "pending" | "confirmed" | "expired";

/**
 * Phase Two magic link extension, "continuation" mode: this tab waits while the user opens the
 * link (possibly on another device), polling the extension's status endpoint and moving the flow
 * on once the link is confirmed.
 */
export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "view-email-continuation.ftl");

    const { msg } = useI18n();

    const { pollingUrl, url } = kcContext;

    const [state, setState] = useState<ContinuationState>("pending");
    const [expiresIn, setExpiresIn] = useState<number | undefined>(undefined);

    useEffect(() => {
        // Only poll on a real Keycloak render; Storybook and the editor preview use a mock context.
        if (window.kcContext === undefined) {
            return;
        }

        let isStopped = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const expire = () => {
            setState("expired");
            setExpiresIn(undefined);
        };

        const tick = async () => {
            try {
                const response = await fetch(pollingUrl, { cache: "no-store", credentials: "same-origin" });
                if (isStopped) {
                    return;
                }
                if (!response.ok) {
                    if (response.status === 404 || response.status === 401) {
                        expire();
                        return;
                    }
                    throw new Error(`Unexpected status ${response.status}`);
                }

                const data = (await response.json()) as { state?: string; expires_in?: number };
                if (isStopped) {
                    return;
                }
                if (typeof data.expires_in === "number") {
                    setExpiresIn(data.expires_in);
                }

                switch (data.state) {
                    case "confirmed":
                        setState("confirmed");
                        window.location.href = url.loginAction;
                        return;
                    case "expired":
                        expire();
                        return;
                    default:
                        timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
                }
            } catch {
                // Network error or server unavailable: retry with a longer delay.
                if (!isStopped) {
                    timeoutId = setTimeout(tick, RETRY_INTERVAL_MS);
                }
            }
        };

        void tick();

        return () => {
            isStopped = true;
            clearTimeout(timeoutId);
        };
    }, [pollingUrl, url.loginAction]);

    return (
        <Template displayMessage={false} headerNode={msg("loginAccountTitle")}>
            <div className="flex flex-col items-center gap-4 text-center text-sm leading-relaxed">
                <MailCheck className="size-10 text-primary" />
                {state === "expired" ? (
                    <>
                        <p id="mlc-status">{msg("magicLinkContinuationExpired")}</p>
                        <a
                            href={url.loginRestartFlowUrl}
                            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 dark:text-foreground"
                        >
                            {msg("backToLogin")}
                        </a>
                    </>
                ) : (
                    <>
                        <p>{msg("magicLinkContinuationConfirmation")}</p>
                        <div id="mlc-status" className="flex items-center gap-2 text-muted-foreground">
                            <Spinner />
                            {state === "confirmed"
                                ? msg("magicLinkContinuationRedirecting")
                                : msg("magicLinkContinuationWaiting")}
                        </div>
                        {state === "pending" && expiresIn !== undefined && expiresIn > 0 && (
                            <p id="mlc-exp" className="text-xs text-muted-foreground">
                                {msg("magicLinkContinuationExpiresIn", String(expiresIn))}
                            </p>
                        )}
                    </>
                )}
            </div>
        </Template>
    );
}
