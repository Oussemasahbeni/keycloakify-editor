import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { toast } from "#/components/ui/toast";

import { generateJar } from "../server/generate-jar";
import { buildThemeFormData } from "../shared/theme-form-data";
import { getThemeNameError } from "../shared/validation/theme-name";
import { useEditor } from "../state/editor-context";

/** Exports the theme as a JAR and downloads it. */
export function ExportButton() {
    const { themeName, theme } = useEditor();

    const exportJar = useServerFn(generateJar);

    const { mutate: exportTheme, isPending } = useMutation({
        mutationFn: async () => {
            const response = await exportJar({ data: buildThemeFormData(theme) });
            return { blob: await response.blob(), name: themeName.trim() };
        },
        onSuccess: ({ blob, name }) => {
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${name}.jar`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);

            toast.add({
                description: `Downloaded ${name}.jar`,
                type: "success",
            });
        },
        onError: error => {
            toast.add({
                description: error instanceof Error ? error.message : "Export failed.",
                type: "error",
            });
        },
    });

    function handleExport() {
        const nameError = getThemeNameError(themeName);
        if (nameError)
            return toast.add({
                description: `Invalid theme name: ${nameError}`,
                type: "error",
            });

        exportTheme();
    }

    return (
        <Button size="sm" onClick={handleExport} disabled={isPending}>
            {isPending ? <Spinner /> : <Download />}
            Export
        </Button>
    );
}
