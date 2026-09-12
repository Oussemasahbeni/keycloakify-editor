import { useEffect, useEffectEvent, useRef } from "react";

import type { ThemeAssetKey } from "#/features/editor/shared/model/assets.ts";
import type { Locale } from "#/lib/locales";

import type { PreviewColorScheme } from "../../shared/model/preview-color-scheme";
import type { LoginThemeConfig } from "../../shared/model/theme-config";
import type { PageId } from "../stories/types";

/**
 * Cross-context transport for the editor's uploaded preview images.
 *
 * The live preview runs in two places — the inline <iframe> (PreviewPane) and the
 * standalone full-screen tab ("open in new tab"). Both need the user's uploaded
 * image assets, which can't travel by URL (they're binary) — so the editor
 * publishes them over a same-origin BroadcastChannel and each preview consumes them.
 *
 * BroadcastChannel messages aren't buffered, so a preview that opens *after* an
 * upload would miss the broadcast. Hence a tiny request/reply handshake: a consumer
 * asks for the current assets on mount, the editor replies — in addition to pushing
 * live updates whenever assets change.
 */

const CHANNEL_NAME = "kc-preview";

export type PreviewState = {
    pageId: PageId;
    storyId: string;
    colorScheme: PreviewColorScheme;
    locale: Locale;
    config: LoginThemeConfig;
};

export type PreviewAssets = Partial<Record<ThemeAssetKey, File | null>>;

type ChannelMessage =
    | { type: "request" }
    | { type: "state"; state: PreviewState }
    | { type: "assets"; assets: PreviewAssets };

/** Preview side: receive state + asset pushes, and request current values on mount. */
export function useReceivePreview(handlers: {
    onState: (state: PreviewState) => void;
    onAssets: (assets: PreviewAssets) => void;
}) {
    const onState = useEffectEvent(handlers.onState);
    const onAssets = useEffectEvent(handlers.onAssets);
    useEffect(() => {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.addEventListener("message", (event: MessageEvent<ChannelMessage>) => {
            if (event.data.type === "state") onState(event.data.state);
            else if (event.data.type === "assets") onAssets(event.data.assets);
        });
        channel.postMessage({ type: "request" } satisfies ChannelMessage);
        return () => channel.close();
    }, []);
}

/** Editor side: answer requests with current state + assets, and push each on change. */
export function usePublishPreview(
    pageId: PageId,
    storyId: string,
    colorScheme: PreviewColorScheme,
    config: LoginThemeConfig,
    locale: Locale,
    assets: PreviewAssets,
) {
    const channelRef = useRef<BroadcastChannel | null>(null);

    const publishState = useEffectEvent(() => {
        channelRef.current?.postMessage({
            type: "state",
            state: { pageId, storyId, colorScheme, config, locale },
        } satisfies ChannelMessage);
    });
    const publishAssets = useEffectEvent(() => {
        channelRef.current?.postMessage({
            type: "assets",
            assets,
        } satisfies ChannelMessage);
    });

    useEffect(() => {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = channel;
        channel.addEventListener("message", (e: MessageEvent<ChannelMessage>) => {
            if (e.data.type === "request") {
                publishState();
                publishAssets();
            }
        });
        return () => {
            channel.close();
            channelRef.current = null;
        };
    }, []);

    useEffect(() => publishState(), [pageId, storyId, colorScheme, config, locale]);
    useEffect(() => publishAssets(), [assets]);
}
