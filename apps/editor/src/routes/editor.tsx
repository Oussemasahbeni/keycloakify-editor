import { createFileRoute, Outlet } from "@tanstack/react-router";

import { EditorHeader } from "#/features/editor/header/editor-header.tsx";
import { EditorProvider } from "#/features/editor/state/editor-context.tsx";

export const Route = createFileRoute("/editor")({
    component: EditorLayout,
});

function EditorLayout() {
    return (
        <EditorProvider>
            <div className="flex h-svh flex-col">
                <EditorHeader />
                <Outlet />
            </div>
        </EditorProvider>
    );
}
