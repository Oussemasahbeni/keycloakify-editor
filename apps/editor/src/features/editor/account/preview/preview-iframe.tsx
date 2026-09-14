import type { ThemePresetProperties } from "@kc-studio/shadcn-theme/account-preview";
import { LogIn } from "lucide-react";
import { createKeycloakUtils } from "oidc-spa/keycloak";
import { useRef } from "react";

import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import type { AccountPreviewConfig } from "#/features/editor/account/hooks/use-account-preview-channel";
import { usePublishAccountPreview } from "#/features/editor/account/hooks/use-account-preview-channel";
import { themeConfigToProperties } from "#/features/editor/shared/model/theme-config.ts";
import { getViewportWidth } from "#/features/editor/shared/model/viewport.ts";
import { useEditor } from "#/features/editor/state/editor-context";
import { cn } from "#/lib/utils";
import { useOidc } from "#/oidc";

const PREVIEW_PATH = "/preview/account/";

/**
 * Hosts the account console preview (`/preview/account`, same origin). The frame
 * logs itself in against the same realm and client as the editor; this side only
 * tells it which ones, and pushes branding whenever the config changes.
 */
export function AccountPreviewIframe() {
    const oidc = useOidc();
    const { login, locale } = useEditor();
    const width = getViewportWidth(login.viewport);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Where the frame logs in and what it renders at mount. The realm and server root
    // only exist inside the issuer URI; oidc-spa parses it.
    let config: AccountPreviewConfig | undefined;
    if (oidc.isUserLoggedIn) {
        const { issuerUriParsed } = createKeycloakUtils({ issuerUri: oidc.issuerUri });
        config = {
            serverBaseUrl: `${issuerUriParsed.origin}${issuerUriParsed.kcHttpRelativePath ?? ""}`,
            realm: issuerUriParsed.realm,
            clientId: oidc.clientId,
            locale,
            properties: themeConfigToProperties(login.config),
        };
    }

    // The four values the console re-applies live, typed straight off the config.
    const presets: ThemePresetProperties = {
        SHADCN_THEME_PRIMARY: login.config.primary,
        SHADCN_THEME_BASE: login.config.base,
        SHADCN_THEME_RADIUS: login.config.radius,
        SHADCN_THEME_FONT: login.config.font,
    };

    // A locale change remounts the frame (the console reads it once), hence the key.
    const { isReady } = usePublishAccountPreview(iframeRef, { config, presets, frameKey: locale });

    if (!oidc.isUserLoggedIn) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/30 p-4 text-center">
                <LogIn className="size-6 text-muted-foreground" />
                <p className="text-sm font-medium">Sign in to preview your account console</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                    The preview shows the signed-in user's real account on the connected realm.
                </p>
                <Button size="sm" onClick={() => void oidc.login?.()}>
                    Sign in
                </Button>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="relative grid flex-1 place-items-center overflow-auto bg-muted/30 p-4">
                {!isReady && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Spinner />
                        <span>Loading account console…</span>
                    </div>
                )}
                {/* oxlint-disable-next-line react/iframe-missing-sandbox -- same-origin first-party /preview/account route; the frame must navigate to Keycloak and back to log in, which a sandbox would break */}
                <iframe
                    key={locale}
                    ref={iframeRef}
                    src={PREVIEW_PATH}
                    title="Account console preview"
                    // Hidden until the frame reports `ready`: its login hop passes through the editor root.
                    className={cn(
                        "h-full rounded-lg border bg-background shadow-sm transition-[width] duration-250",
                        !isReady && "invisible",
                    )}
                    style={{ width: width ? `${width}px` : "100%" }}
                />
            </div>
        </div>
    );
}
