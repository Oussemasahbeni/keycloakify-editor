import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { toast } from "#/components/ui/toast";
import { clearDraft, saveDraft } from "#/lib/draft-storage";
import { useOidc } from "#/oidc.ts";

import { generateJar } from "../server/generate-jar";
import { buildThemeFormData } from "../shared/theme-form-data";
import { getThemeNameError } from "../shared/validation/theme-name";
import { useEditor } from "../state/editor-context";
import { SignInDialog } from "./sign-in-dialog";

export function ExportButton() {
    const {
        themeName,
        theme,
        persistence: { saved },
    } = useEditor();

    const { isUserLoggedIn, login } = useOidc();

    const [openSignInDialog, setOpenSignInDialog] = useState(false);

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

            void clearDraft();
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

        // Export needs a session: ask for sign-in up front instead of uploading everything
        // first, and keep the edits in a draft so they survive the sign-in redirect.
        if (!isUserLoggedIn) {
            void saveDraft({ ...theme, saved: saved ?? undefined })
                .catch(() =>
                    toast.add({
                        description: "Couldn't save your edits before signing in; they may be lost after the redirect.",
                        type: "warning",
                    }),
                )
                .finally(() => setOpenSignInDialog(true));
            return;
        }

        exportTheme();
    }

    function handleSignIn() {
        setOpenSignInDialog(false);
        login?.().catch(() => toast.add({ description: "Couldn't reach the sign-in server.", type: "error" }));
    }

    return (
        <>
            <Button size="sm" onClick={handleExport} disabled={isPending}>
                {isPending ? <Spinner /> : <Download />}
                Export
            </Button>

            <SignInDialog
                title="Sign in to export"
                description="Exporting a theme requires an account. Your design is kept in this browser while you sign in, so you'll pick up right where you left off."
                open={openSignInDialog}
                onOpenChange={() => setOpenSignInDialog(false)}
                onSignIn={handleSignIn}
            />
        </>
    );
}
