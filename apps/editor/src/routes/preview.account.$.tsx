import {
    AccountPreviewUi,
    KcAccountUiLoader,
    applyThemePreset,
    createAccountKcContext,
    setPreviewKeycloak,
} from "@kc-studio/shadcn-theme/account-preview";
import { createFileRoute } from "@tanstack/react-router";
import { Keycloak } from "oidc-spa/keycloak-js";
import { useEffect, useEffectEvent, useState } from "react";

import { Spinner } from "#/components/ui/spinner";
import type { AccountPreviewConfig } from "#/features/editor/account/hooks/use-account-preview-channel";
import { useReceiveAccountPreview } from "#/features/editor/account/hooks/use-account-preview-channel";

/**
 * Isolated document embedded by the Account surface. Runs the account console
 * from the theme's source on the editor's own origin.
 *
 * The auth client is built HERE, with the editor's copy of oidc-spa (the one the
 * Vite plugin initialised in this document), and handed to the theme's preview
 * UI. `sessionRestorationMethod: "full page redirect"` is what makes it work
 * inside an iframe: the frame hops to Keycloak and back on load, picking up the
 * existing session, instead of the silent-iframe flow oidc-spa refuses for
 * framed apps. The splat swallows the console's own routes and the login callback.
 */
export const Route = createFileRoute("/preview/account/$")({
    ssr: false,
    component: AccountPreviewDocument,
    pendingComponent: () => <Loading />,
});

function Loading() {
    return (
        <div className="flex h-svh items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Loading account console…</span>
        </div>
    );
}

function AccountPreviewDocument() {
    const [config, setConfig] = useState<AccountPreviewConfig | null>(null);

    const { isFramed, postReady } = useReceiveAccountPreview({
        onConfig: incoming => setConfig(current => current ?? incoming),
        onPresets: applyThemePreset,
    });

    if (!isFramed) {
        return (
            <div className="flex h-svh items-center justify-center p-6 text-center text-sm text-muted-foreground">
                This page is the editor's account preview. Open it from the Account tab of the editor.
            </div>
        );
    }

    if (!config) return <Loading />;

    return <AccountPreviewApp config={config} onReady={postReady} />;
}

function AccountPreviewApp({ config, onReady }: { config: AccountPreviewConfig; onReady: () => void }) {
    const [isAuthReady, setIsAuthReady] = useState(false);
    const notifyReady = useEffectEvent(onReady);

    // Built exactly once per document: the loader reloads the page on any change.
    const [kcContext] = useState(() =>
        createAccountKcContext({
            serverBaseUrl: config.serverBaseUrl,
            realm: config.realm,
            clientId: config.clientId,
            consolePath: "/preview/account/",
            locale: config.locale,
            properties: config.properties,
        }),
    );

    useEffect(() => {
        const keycloak = new Keycloak({
            url: kcContext.serverBaseUrl,
            realm: kcContext.realm.name,
            clientId: kcContext.clientId,
            sessionRestorationMethod: "full page redirect",
        });

        void (async () => {
            await keycloak.init({ onLoad: "login-required", pkceMethod: "S256" });
            setPreviewKeycloak(keycloak);
            notifyReady();
            setIsAuthReady(true);
        })();
    }, [kcContext]);

    if (!isAuthReady) return <Loading />;

    return <KcAccountUiLoader kcContext={kcContext} KcAccountUi={AccountPreviewUi} loadingFallback={<Loading />} />;
}
