import type { ComponentType } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { useEditor } from "#/features/editor/state/editor-context.tsx";

type EditorSurfaceProps = {
    Preview: ComponentType;
    Sidebar: ComponentType;
};

export function EditorSurface({ Preview, Sidebar }: EditorSurfaceProps) {
    const { panelLayout, setPanelLayout } = useEditor();

    return (
        <ResizablePanelGroup defaultLayout={panelLayout} onLayoutChanged={setPanelLayout}>
            <ResizablePanel id="preview" defaultSize="80%" minSize="30%">
                <Preview />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="sidebar" defaultSize="20%" minSize="15%">
                <Sidebar />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
