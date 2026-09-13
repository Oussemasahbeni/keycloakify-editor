import { LogIn } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { getViewportWidth } from "#/features/editor/shared/model/viewport.ts";
import { useEditor } from "#/features/editor/state/editor-context";
import { useOidc } from "#/oidc";

/**
 * The user is already logged in to that realm (it is the editor's OIDC issuer),
 * so the console renders their own account. No branding overrides yet — this
 * only proves the console can be framed at all. The realm's security headers
 * (`X-Frame-Options`, CSP `frame-ancestors`) must allow this origin.
 */
export function AccountPreviewIframe() {
    const { isUserLoggedIn, user, login } = useOidc();
    const { viewport } = useEditor().login;
    const width = getViewportWidth(viewport);

    const [isLoaded, setIsLoaded] = useState(false);

    if (!isUserLoggedIn || !user) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/30 p-4 text-center">
                <LogIn className="size-6 text-muted-foreground" />
                <p className="text-sm font-medium">Sign in to preview your account console</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                    The account console shows the signed-in user's real account on the connected realm.
                </p>
                <Button size="sm" onClick={() => void login?.()}>
                    Sign in
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="relative grid flex-1 place-items-center overflow-auto bg-muted/30 p-4">
                {!isLoaded && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Spinner />
                        <span>Loading account console…</span>
                    </div>
                )}
                {/* oxlint-disable-next-line react/iframe-missing-sandbox -- cross-origin Keycloak console; it needs its own scripts, cookies, forms and login redirects, which a sandbox would break */}
                <iframe
                    src={"http://localhost:8080/realms/myrealm/account"}
                    title="Account console preview"
                    onLoad={() => setIsLoaded(true)}
                    className="h-full rounded-lg border bg-background shadow-sm transition-[width] duration-250"
                    style={{ width: width ? `${width}px` : "100%" }}
                />
            </div>
        </div>
    );
}
