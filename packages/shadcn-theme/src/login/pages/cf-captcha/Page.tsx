import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { assert } from "tsafe/assert";

import { Button } from "#/components/ui/button";
import { useI18n } from "#/login/i18n.ts";
import { useKcContext } from "#/login/KcContext.ts";

import { Template } from "../../components/Template";

const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
    render: (
        container: HTMLElement,
        options: { sitekey: string; action: string; language: string; callback: () => void },
    ) => string | undefined;
    remove: (widgetId: string) => void;
};

function getTurnstile() {
    return (window as { turnstile?: Turnstile }).turnstile;
}

/** Phase Two magic link extension (Cloudflare Turnstile): a captcha step before signing in. */
export function Page() {
    const { kcContext } = useKcContext();

    assert(kcContext.pageId === "cf-captcha.ftl");

    const { msg, msgStr } = useI18n();

    const { captchaSiteKey, captchaAction, captchaLanguage } = kcContext;

    const formRef = useRef<HTMLFormElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);
    const [isSolved, setIsSolved] = useState(false);

    // Storybook and the editor preview use a mock context: show a placeholder instead of calling Cloudflare.
    const isRealKeycloak = window.kcContext !== undefined;

    useEffect(() => {
        const container = widgetRef.current;
        if (!isRealKeycloak || container === null) {
            return;
        }

        let isCancelled = false;
        let widgetId: string | undefined;

        const renderWidget = () => {
            const turnstile = getTurnstile();
            if (isCancelled || turnstile === undefined) {
                return;
            }
            widgetId = turnstile.render(container, {
                sitekey: captchaSiteKey,
                action: captchaAction,
                language: captchaLanguage,
                // Like the extension's own template: submit as soon as the challenge is solved.
                callback: () => {
                    setIsSolved(true);
                    formRef.current?.submit();
                },
            });
        };

        if (getTurnstile() !== undefined) {
            renderWidget();
        } else {
            let script = document.querySelector<HTMLScriptElement>(`script[src="${TURNSTILE_SCRIPT_URL}"]`);
            if (script === null) {
                script = document.createElement("script");
                script.src = TURNSTILE_SCRIPT_URL;
                script.async = true;
                document.head.appendChild(script);
            }
            script.addEventListener("load", renderWidget, { once: true });
        }

        return () => {
            isCancelled = true;
            if (widgetId !== undefined) {
                getTurnstile()?.remove(widgetId);
            }
        };
    }, [isRealKeycloak, captchaSiteKey, captchaAction, captchaLanguage]);

    return (
        <Template headerNode={msg("loginAccountTitle")}>
            <form
                ref={formRef}
                id="kc-form-login"
                className="flex flex-col items-center gap-6"
                action={kcContext.url.loginAction}
                method="post"
            >
                {isRealKeycloak ? (
                    <div ref={widgetRef} />
                ) : (
                    <div className="flex h-16.25 w-75 items-center gap-3 rounded-md border bg-muted/40 px-4 text-sm text-muted-foreground">
                        <ShieldCheck className="size-6" />
                        Cloudflare Turnstile
                    </div>
                )}

                <input type="hidden" name="credentialId" value={kcContext.auth.selectedCredential ?? ""} />

                <Button className="w-full" name="login" id="kc-login" type="submit" disabled={!isSolved}>
                    {msgStr("doContinue")}
                </Button>
            </form>
        </Template>
    );
}
