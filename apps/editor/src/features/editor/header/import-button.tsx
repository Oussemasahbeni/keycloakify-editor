import { Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "#/components/ui/button.tsx";
import { Spinner } from "#/components/ui/spinner.tsx";
import { toast } from "@/components/ui/toast";

import { parseThemeJar } from "../shared/parse-theme-jar";
import { useEditor } from "../state/editor-context";

export function ImportButton() {
    const { importTheme } = useEditor();

    const [isImporting, setIsImporting] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        setIsImporting(true);

        try {
            const bytes = new Uint8Array(await file.arrayBuffer());
            importTheme(parseThemeJar(bytes));
            toast.add({
                description: `Imported ${file.name}`,
                type: "success",
            });
        } catch (error) {
            toast.add({
                description: error instanceof Error ? error.message : "Import failed.",
                type: "error",
            });
        } finally {
            setIsImporting(false);
        }
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".jar"
                className="hidden"
                disabled={isImporting}
                onChange={handleFile}
            />
            <Button size="sm" variant="outline" disabled={isImporting} onClick={() => inputRef.current?.click()}>
                {isImporting ? <Spinner /> : <Upload />}
                Import
            </Button>
        </>
    );
}
