import { useState } from "react";

import { getPage } from "#/features/editor/login/stories/pages";
import type { PageId } from "#/features/editor/login/stories/types";
import { getViewportWidth } from "#/features/editor/shared/model/viewport.ts";
import { useEditor } from "#/features/editor/state/editor-context";

import { usePublishPreview } from "../hooks/use-preview-channel";
import { LoginPreviewToolbar } from "./preview-toolbar";

/**
 * Renders the real theme in an isolated iframe (`/preview/login`).
 */
export function LoginPreviewIframe() {
    const { login, locale } = useEditor();
    const { viewport, previewColorScheme, config, assets } = login;

    const width = getViewportWidth(viewport);

    const [pageId, setPageId] = useState<PageId>("login.ftl");
    const [storyId, setStoryId] = useState("default");

    function handlePageChange(value: PageId) {
        setPageId(value);
        setStoryId(getPage(value)?.stories[0]?.id ?? "default");
    }
    usePublishPreview(pageId, storyId, previewColorScheme, config, locale, assets);

    return (
        <div className="flex h-full flex-col">
            <LoginPreviewToolbar
                pageId={pageId}
                storyId={storyId}
                onPageChange={handlePageChange}
                onStoryChange={setStoryId}
            />
            <div className="grid flex-1 place-items-center overflow-auto bg-muted/30 p-4">
                <iframe
                    src="/preview/login"
                    title="Theme preview"
                    // oxlint-disable-next-line react/iframe-missing-sandbox
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    className="h-full rounded-lg border bg-background shadow-sm transition-[width] duration-250"
                    style={{ width: width ? `${width}px` : "100%" }}
                />
            </div>
        </div>
    );
}
