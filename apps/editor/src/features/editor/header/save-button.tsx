import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { toast } from "#/components/ui/toast";
import { themesQueryKey } from "#/features/themes/queries.ts";
import { createThemeUploads, saveTheme } from "#/features/themes/server/themes.ts";
import { getPendingUploads, uploadThemeFiles } from "#/features/themes/theme-files.ts";
import type { SavedThemeRef } from "#/lib/draft-storage";
import { saveDraft } from "#/lib/draft-storage";
import { useOidc } from "#/oidc.ts";

import type { ParsedTheme } from "../shared/parse-theme-jar";
import type { ThemeFileSlot } from "../shared/theme-form-data";
import { getThemeNameError } from "../shared/validation/theme-name";
import { useEditor } from "../state/editor-context";
import { SignInDialog } from "./sign-in-dialog";

type SaveInput = {
    theme: ParsedTheme;
    target: SavedThemeRef | null;
    /** Stored files that are still current, so they aren't uploaded again. */
    keep: ThemeFileSlot[];
};

export function SaveButton() {
    const { theme, persistence } = useEditor();
    const { saved, isDirty, unchangedFiles, markSaved, remote, hasPendingSave, clearPendingSave } = persistence;
    const { isUserLoggedIn, login } = useOidc();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [openSignInDialog, setOpenSignInDialog] = useState(false);

    const requestUploads = useServerFn(createThemeUploads);
    const save = useServerFn(saveTheme);

    const { mutate, isPending } = useMutation({
        mutationFn: async ({ theme: toSave, target, keep }: SaveInput) => {
            // New and changed images go to object storage first; the save itself
            // then only names them.
            const pending = getPendingUploads(toSave, keep);
            const tickets =
                pending.length > 0
                    ? await requestUploads({
                          data: {
                              files: pending.map(({ slot, filename, mimeType, size }) => ({
                                  slot,
                                  filename,
                                  mimeType,
                                  size,
                              })),
                          },
                      })
                    : [];
            await uploadThemeFiles(pending, tickets);

            return save({
                data: {
                    options: { themeName: toSave.themeName, login: toSave.login, email: toSave.email },
                    target,
                    keep,
                    uploads: tickets.map(({ slot, key }) => ({
                        slot,
                        key,
                        filename: pending.find(upload => upload.slot === slot)?.filename ?? slot,
                    })),
                },
            });
        },
        onSuccess: (result, { theme: savedTheme, target }) => {
            if (result.status === "conflict") {
                return toast.add({
                    title: "This theme was changed somewhere else",
                    description:
                        "Saving now would overwrite those changes. Reload the page to get the latest version; your unsaved edits here will be lost.",
                    type: "error",
                });
            }

            markSaved({ id: result.id, revision: result.revision }, savedTheme);
            void queryClient.invalidateQueries({ queryKey: themesQueryKey });
            toast.add({ description: `Saved ${savedTheme.themeName.trim()}`, type: "success" });

            // A first save gives the theme its address; a shared link has done its job.
            if (target === null) {
                void navigate({ to: ".", search: { themeId: result.id }, replace: true });
            }
        },
        onError: error => {
            toast.add({
                description: error instanceof Error ? error.message : "Save failed.",
                type: "error",
            });
        },
    });

    function saveNow() {
        const nameError = getThemeNameError(theme.themeName);
        if (nameError) {
            return toast.add({ description: `Invalid theme name: ${nameError}`, type: "error" });
        }
        mutate({ theme, target: saved, keep: unchangedFiles });
    }

    function handleSave() {
        // Same hand-off as export: keep the edits in a draft across the sign-in
        // redirect, and note that the user was saving so it finishes on return.
        if (!isUserLoggedIn) {
            void saveDraft({ ...theme, saved: saved ?? undefined, pendingAction: "save" })
                .catch(() =>
                    toast.add({
                        description: "Couldn't save your edits before signing in; they may be lost after the redirect.",
                        type: "warning",
                    }),
                )
                .finally(() => setOpenSignInDialog(true));
            return;
        }

        saveNow();
    }

    function handleSignIn() {
        setOpenSignInDialog(false);
        login?.().catch(() => toast.add({ description: "Couldn't reach the sign-in server.", type: "error" }));
    }

    const canResume = isUserLoggedIn === true && remote.state === "ready";

    useEffect(() => {
        if (!canResume || !hasPendingSave) return;
        clearPendingSave();
        saveNow();
        // oxlint-disable-next-line react-hooks/exhaustive-deps -- fires once per pending save, which is cleared right here
    }, [canResume, hasPendingSave]);

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={isPending || remote.state !== "ready" || (saved !== null && !isDirty)}
            >
                {isPending ? <Spinner /> : <Save />}
                {saved !== null && !isDirty ? "Saved" : "Save"}
            </Button>

            <SignInDialog
                title="Sign in to save"
                description="Saving a theme requires an account. Your design is kept in this browser while you sign in, and is saved as soon as you're back."
                open={openSignInDialog}
                onOpenChange={() => setOpenSignInDialog(false)}
                onSignIn={handleSignIn}
            />
        </>
    );
}
