import type { BrandOverrides, ThemePresetProperties } from "@kc-studio/shadcn-theme/account-preview";
import type { RefObject } from "react";
import { useEffect, useEffectEvent, useState } from "react";

/**
 * Transport between the editor page and the `/preview/account` iframe it embeds
 * (`routes/preview.account.$.tsx`) — the account counterpart of
 * `login/hooks/use-preview-channel.ts`.
 *
 * Both ends are this app, so a message is trusted once `event.origin` is ours and
 * `event.source` is the exact frame or parent window; only the type tag is
 * checked, because extensions and dev tools also post to windows.
 */

export type AccountPreviewConfig = {
    serverBaseUrl: string;
    realm: string;
    clientId: string;
    locale: string;
    properties: Record<string, string>;
};

/** What the console can re-apply live: the four presets and the two logos. */
export type AccountPreviewBranding = {
    presets: ThemePresetProperties;
    /** Effective URLs (uploads already turned into blob URLs); empty string = none. */
    logos: Required<BrandOverrides>;
};

type ChannelMessage =
    | { type: "kc-account-preview:request-config" }
    | { type: "kc-account-preview:ready" }
    | { type: "kc-account-preview:config"; config: AccountPreviewConfig }
    | { type: "kc-account-preview:branding"; branding: AccountPreviewBranding };

function isChannelMessage(data: unknown): data is ChannelMessage {
    return (
        typeof data === "object" &&
        data !== null &&
        typeof (data as { type?: unknown }).type === "string" &&
        (data as { type: string }).type.startsWith("kc-account-preview:")
    );
}

/** Frame side: request the config on mount, receive config + branding, and announce readiness. */
export function useReceiveAccountPreview(handlers: {
    onConfig: (config: AccountPreviewConfig) => void;
    onBranding: (branding: AccountPreviewBranding) => void;
}) {
    const onConfig = useEffectEvent(handlers.onConfig);
    const onBranding = useEffectEvent(handlers.onBranding);
    const isFramed = window.parent !== window;

    useEffect(() => {
        if (!isFramed) return;
        const editor = window.parent;

        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin || event.source !== editor) return;
            const data: unknown = event.data;
            if (!isChannelMessage(data)) return;

            if (data.type === "kc-account-preview:config") onConfig(data.config);
            else if (data.type === "kc-account-preview:branding") onBranding(data.branding);
        };

        window.addEventListener("message", onMessage);
        editor.postMessage(
            { type: "kc-account-preview:request-config" } satisfies ChannelMessage,
            window.location.origin,
        );
        return () => window.removeEventListener("message", onMessage);
    }, [isFramed]);

    const postReady = () => {
        window.parent.postMessage(
            { type: "kc-account-preview:ready" } satisfies ChannelMessage,
            window.location.origin,
        );
    };

    return { isFramed, postReady };
}

/**
 * Editor side: answer the frame's config request, learn when it is ready, and push
 * branding on every change from then on. `frameKey` mirrors the iframe's `key`: a
 * new key means a new document, so readiness starts over.
 */
export function usePublishAccountPreview(
    frameRef: RefObject<HTMLIFrameElement | null>,
    params: { config: AccountPreviewConfig | undefined; branding: AccountPreviewBranding; frameKey: string },
) {
    const [isReady, setIsReady] = useState(false);

    const post = (message: ChannelMessage) => {
        frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
    };
    const replyConfig = useEffectEvent(() => {
        if (params.config) post({ type: "kc-account-preview:config", config: params.config });
    });
    const publishBranding = useEffectEvent(() => {
        post({ type: "kc-account-preview:branding", branding: params.branding });
    });

    useEffect(() => setIsReady(false), [params.frameKey]);

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const frame = frameRef.current?.contentWindow;
            if (!frame || event.origin !== window.location.origin || event.source !== frame) return;
            const data: unknown = event.data;
            if (!isChannelMessage(data)) return;

            if (data.type === "kc-account-preview:request-config") replyConfig();
            else if (data.type === "kc-account-preview:ready") setIsReady(true);
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [frameRef]);

    useEffect(() => {
        if (isReady) publishBranding();
    }, [isReady, params.branding]);

    return { isReady };
}
