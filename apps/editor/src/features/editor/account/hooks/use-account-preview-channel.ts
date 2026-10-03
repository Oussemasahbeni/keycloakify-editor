import type { BrandOverrides, ThemePresetProperties } from "@keycloakify-editor/shadcn-theme/account-preview";
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
    | { type: "kc-account-preview:error"; message: string }
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

    return { isFramed, postReady, postError };
}

function postReady() {
    window.parent.postMessage({ type: "kc-account-preview:ready" } satisfies ChannelMessage, window.location.origin);
}

function postError(message: string) {
    window.parent.postMessage(
        { type: "kc-account-preview:error", message } satisfies ChannelMessage,
        window.location.origin,
    );
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
    const [readyFrameKey, setReadyFrameKey] = useState<string>();
    const isReady = readyFrameKey === params.frameKey;
    const markReady = useEffectEvent(() => setReadyFrameKey(params.frameKey));

    // Same per-frame bookkeeping for a failed sign-in: a new frame (new key) starts clean.
    const [failure, setFailure] = useState<{ frameKey: string; message: string }>();
    const error = failure?.frameKey === params.frameKey ? failure.message : undefined;
    const markFailed = useEffectEvent((message: string) => setFailure({ frameKey: params.frameKey, message }));

    const post = (message: ChannelMessage) => {
        frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
    };
    const replyConfig = useEffectEvent(() => {
        if (params.config) post({ type: "kc-account-preview:config", config: params.config });
    });
    const publishBranding = useEffectEvent((branding: AccountPreviewBranding) => {
        post({ type: "kc-account-preview:branding", branding });
    });

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const frame = frameRef.current?.contentWindow;
            if (!frame || event.origin !== window.location.origin || event.source !== frame) return;
            const data: unknown = event.data;
            if (!isChannelMessage(data)) return;

            if (data.type === "kc-account-preview:request-config") replyConfig();
            else if (data.type === "kc-account-preview:ready") markReady();
            else if (data.type === "kc-account-preview:error") markFailed(data.message);
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [frameRef]);

    useEffect(() => {
        // `branding` is passed in (not read inside the event) so it is a real dependency of this effect.
        if (isReady) publishBranding(params.branding);
    }, [isReady, params.branding]);

    return { isReady, error };
}
