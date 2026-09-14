import { KcPage, getKcContextMock } from "@kc-studio/shadcn-theme/preview";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Spinner } from "#/components/ui/spinner";
import type { PreviewAssets, PreviewState } from "#/features/editor/login/hooks/use-preview-channel.ts";
import { useReceivePreview } from "#/features/editor/login/hooks/use-preview-channel.ts";
import { getStory } from "#/features/editor/login/stories/pages";
import type { AssetKey } from "#/features/editor/shared/model/assets.ts";
import { assetDefinitions } from "#/features/editor/shared/model/assets.ts";
import { defaultLoginThemeConfig, themeConfigToProperties } from "#/features/editor/shared/model/theme-config.ts";
import { DEFAULT_LOCALE } from "#/lib/locales";

/**
 * Isolated preview document, embedded by `PreviewPane` via an iframe.
 */
export const Route = createFileRoute("/preview")({
    ssr: false,
    component: PreviewRoute,
    pendingComponent: () => (
        <div className="flex h-svh items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Loading preview…</span>
        </div>
    ),
});

function PreviewRoute() {
    const [state, setState] = useState<PreviewState & { assets?: PreviewAssets }>({
        pageId: "login.ftl",
        storyId: "default",
        colorScheme: "light",
        locale: DEFAULT_LOCALE,
        config: defaultLoginThemeConfig,
    });

    const { pageId, storyId, colorScheme, config, assets, locale } = state;

    const [assetUrls, setAssetUrls] = useState<Partial<Record<AssetKey, string>>>({});

    useEffect(() => {
        const urls: Partial<Record<AssetKey, string>> = {};
        for (const { key } of assetDefinitions) {
            const file = assets?.[key];
            if (file) urls[key] = URL.createObjectURL(file);
        }
        setAssetUrls(urls);
        return () => {
            for (const url of Object.values(urls)) URL.revokeObjectURL(url);
        };
    }, [assets]);

    useReceivePreview({
        onState: incoming => setState(current => ({ ...current, ...incoming })),
        onAssets: incoming => setState(current => ({ ...current, assets: incoming })),
    });

    // Apply the editor's color scheme to the iframe document.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", colorScheme === "dark");

        localStorage.setItem("isDarkMode", colorScheme);
    }, [colorScheme]);

    // Re-resolve the scenario's overrides here (they hold non-cloneable
    // functions, so they can't be sent through `postMessage`)
    const storyOverrides = getStory(pageId, storyId)?.overrides;

    const uploadedAssetProperties: Record<string, string> = {};
    for (const { key, property } of assetDefinitions) {
        const url = assetUrls[key];
        if (url) uploadedAssetProperties[property] = url;
    }

    const kcContext = getKcContextMock({
        pageId,
        overrides: {
            ...storyOverrides,
            locale: {
                ...storyOverrides?.locale,
                currentLanguageTag: locale,
            },
            properties: {
                ...storyOverrides?.properties,
                ...themeConfigToProperties(config),
                ...uploadedAssetProperties,
            },
        },
    });

    return <KcPage key={`${pageId}::${storyId}::${locale}`} kcContext={kcContext} />;
}
