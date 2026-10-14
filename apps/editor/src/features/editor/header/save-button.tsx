import { Save } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";

import { useEditor } from "../state/editor-context";
import { useSaveTheme } from "../state/use-save-theme";

export function SaveButton() {
    const { saved, isDirty, remote } = useEditor().persistence;
    const { saveTheme, isSaving } = useSaveTheme();

    return (
        <Button
            size="sm"
            variant="outline"
            // A failed save has already been reported to the user.
            onClick={() => void saveTheme().catch(() => undefined)}
            disabled={isSaving || remote.state !== "ready" || (saved !== null && !isDirty)}
        >
            {isSaving ? <Spinner /> : <Save />}
            {saved !== null && !isDirty ? "Saved" : "Save"}
        </Button>
    );
}
