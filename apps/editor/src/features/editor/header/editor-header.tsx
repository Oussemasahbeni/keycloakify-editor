import { Logo } from "#/components/logo";
import { ModeToggle } from "#/components/mode-toggle";
import { Badge } from "#/components/ui/badge";

import { useEditor } from "../state/editor-context";
import { ExportButton } from "./export-button";
import { SaveButton } from "./save-button";
import { SurfaceSwitch } from "./surface-switch";
import { UserMenu } from "./user-menu";

export function EditorHeader() {
    const {
        themeName,
        persistence: { isDirty, isSharedCopy },
    } = useEditor();

    return (
        <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b bg-background px-4">
            <div className="flex items-center gap-2">
                <Logo size={28} />
                <span className="truncate text-muted-foreground">{themeName || "my-theme"}</span>
                {isDirty && <Badge variant="outline">Unsaved changes</Badge>}
                {isSharedCopy && <Badge variant="secondary">Shared theme · save to keep a copy</Badge>}
            </div>

            <SurfaceSwitch />

            <div className="flex items-center justify-end gap-2">
                <SaveButton />
                <ExportButton />
                <ModeToggle />
                <UserMenu />
            </div>
        </header>
    );
}
