import { createFileRoute } from "@tanstack/react-router";

import { EmailPreviewIframe } from "#/features/editor/email/preview/preview-iframe.tsx";
import { EmailThemeSidebar } from "#/features/editor/email/sidebar/index.tsx";
import { EditorSurface } from "#/features/editor/shared/components/editor-surface.tsx";

export const Route = createFileRoute("/editor/email")({
    component: EmailEditor,
});

function EmailEditor() {
    return <EditorSurface Preview={EmailPreviewIframe} Sidebar={EmailThemeSidebar} />;
}
