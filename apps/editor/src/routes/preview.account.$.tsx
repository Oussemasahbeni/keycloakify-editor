import {
    AccountPreviewUi,
    KcAccountUiLoader,
    applyThemePreset,
    createAccountKcContext,
    setBrandOverrides,
    setPreviewKeycloak,
} from "@keycloakify-editor/shadcn-theme/account-preview";
import { createFileRoute } from "@tanstack/react-router";
import { Keycloak } from "oidc-spa/keycloak-js";
import { useEffect, useEffectEvent, useState } from "react";

import { Spinner } from "#/components/ui/spinner";
import type { AccountPreviewConfig } from "#/features/editor/account/hooks/use-account-preview-channel.ts";
import { useReceiveAccountPreview } from "#/features/editor/account/hooks/use-account-preview-channel.ts";

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

    const { isFramed, postReady, postError } = useReceiveAccountPreview({
        onConfig: incoming => setConfig(current => current ?? incoming),
        onBranding: ({ presets, logos }) => {
            applyThemePreset(presets);
            setBrandOverrides(logos);
        },
    });

    if (!isFramed) {
        return (
            <div className="flex h-svh items-center justify-center p-6 text-center text-sm text-muted-foreground">
                This page is the editor's account preview. Open it from the Account tab of the editor.
            </div>
        );
    }

    if (!config) return <Loading />;

    return <AccountPreviewApp config={config} onReady={postReady} onError={postError} />;
}

function AccountPreviewApp({
    config,
    onReady,
    onError,
}: {
    config: AccountPreviewConfig;
    onReady: () => void;
    onError: (message: string) => void;
}) {
    const [isAuthReady, setIsAuthReady] = useState(false);
    const notifyReady = useEffectEvent(onReady);
    const notifyError = useEffectEvent(onError);

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
            try {
                await keycloak.init({ onLoad: "login-required", pkceMethod: "S256" });
            } catch (error) {
                // Keycloak unreachable, realm/client misconfigured, network error… Tell the
                // editor (which keeps this frame hidden until `ready`) instead of hanging.
                notifyError(
                    error instanceof Error && error.message
                        ? error.message
                        : "Couldn't sign in to Keycloak for the account preview.",
                );
                return;
            }
            setPreviewKeycloak(keycloak);
            notifyReady();
            setIsAuthReady(true);
        })();
    }, [kcContext]);

    if (!isAuthReady) return <Loading />;

    return <KcAccountUiLoader kcContext={kcContext} KcAccountUi={AccountPreviewUi} loadingFallback={<Loading />} />;
}
