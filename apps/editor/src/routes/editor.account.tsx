import { createFileRoute } from "@tanstack/react-router";

import { AccountPreviewIframe } from "#/features/editor/account/preview/preview-iframe.tsx";
import { LoginThemeSidebar } from "#/features/editor/login/sidebar";
import { EditorSurface } from "#/features/editor/shared/components/editor-surface.tsx";

export const Route = createFileRoute("/editor/account")({
    component: AccountEditor,
});

function AccountEditor() {
    return <EditorSurface Preview={AccountPreviewIframe} Sidebar={LoginThemeSidebar} />;
}
