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
import { assetDefinitions } from "../shared/model/assets";
import { getThemeNameError } from "../shared/validation/theme-name";
import { useEditor } from "../state/editor-context";
import { SignInDialog } from "./sign-in-dialog";

export function ExportButton() {
    const {
        themeName,
        login: { config, assets },
        email: { config: emailConfig, emailLogoFile },
    } = useEditor();

    const { isUserLoggedIn, login } = useOidc();

    const [openSignInDialog, setOpenSignInDialog] = useState(false);

    const exportJar = useServerFn(generateJar);

    const { mutate: exportTheme, isPending } = useMutation({
        mutationFn: async () => {
            const name = themeName.trim();
            const formData = new FormData();

            formData.append("options", JSON.stringify({ login: config, email: emailConfig, themeName: name }));

            for (const { key } of assetDefinitions) {
                const file = assets[key];
                if (file) formData.append(key, file);
            }
            // Favicon is upload-only and baked via its own multi-file pipeline.
            if (assets.favicon) formData.append("favicon", assets.favicon);

            if (emailLogoFile) formData.append("emailLogoFile", emailLogoFile);

            const response = await exportJar({ data: formData });
            return { blob: await response.blob(), name };
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
        onError: async error => {
            if (!isUserLoggedIn) {
                try {
                    await saveDraft({ themeName, login: config, assets, email: emailConfig, emailLogoFile });
                } catch {}

                setOpenSignInDialog(true);
                return;
            }
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
                open={openSignInDialog}
                onOpenChange={() => setOpenSignInDialog(false)}
                onSignIn={handleSignIn}
            />
        </>
    );
}
