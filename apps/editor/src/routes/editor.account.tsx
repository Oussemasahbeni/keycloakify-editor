import { createFileRoute } from "@tanstack/react-router";

import { AccountPreviewIframe } from "#/features/editor/account/preview/preview-iframe.tsx";
import { AccountThemeSidebar } from "#/features/editor/account/sidebar";
import { EditorSurface } from "#/features/editor/shared/components/editor-surface.tsx";

export const Route = createFileRoute("/editor/account")({
    component: AccountEditor,
});

function AccountEditor() {
    return <EditorSurface Preview={AccountPreviewIframe} Sidebar={AccountThemeSidebar} />;
}
