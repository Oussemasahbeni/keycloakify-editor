import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { toast } from "#/components/ui/toast";
import type { SavedThemeRef } from "#/features/themes/model/saved-theme.ts";
import { themesQueryKey } from "#/features/themes/queries.ts";
import { createThemeUploads, saveTheme as saveThemeFn } from "#/features/themes/server/themes.ts";
import { getPendingUploads, uploadThemeFiles } from "#/features/themes/theme-files.ts";

import type { ParsedTheme } from "../shared/theme-document";
import type { ThemeFileSlot } from "../shared/theme-form-data";
import { getThemeNameError } from "../shared/validation/theme-name";
import { useEditor } from "./editor-context";

type SaveInput = {
    theme: ParsedTheme;
    target: SavedThemeRef | null;
    /** Stored files that are still current, so they aren't uploaded again. */
    keep: ThemeFileSlot[];
};

class ThemeConflictError extends Error {}

/**
 * Saves the open document to the user's account: the Save button, and export
 * before it leaves for Stripe. Failures are reported here, so callers only
 * need to know whether it worked.
 */
export function useSaveTheme() {
    const {
        theme,
        persistence: { saved, unchangedFiles, markSaved },
    } = useEditor();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const requestUploads = useServerFn(createThemeUploads);
    const save = useServerFn(saveThemeFn);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: async ({ theme: toSave, target, keep }: SaveInput): Promise<SavedThemeRef> => {
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

            const result = await save({
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
            if (result.status === "conflict") throw new ThemeConflictError();
            return { id: result.id, revision: result.revision };
        },
        onSuccess: (ref, { theme: savedTheme, target }) => {
            markSaved(ref, savedTheme);
            void queryClient.invalidateQueries({ queryKey: themesQueryKey });
            toast.add({ description: `Saved ${savedTheme.themeName.trim()}`, type: "success" });

            // A first save gives the theme its address; a shared link has done its job.
            if (target === null) {
                void navigate({ to: ".", search: { themeId: ref.id }, replace: true });
            }
        },
        onError: error => {
            if (error instanceof ThemeConflictError) {
                return toast.add({
                    title: "This theme was changed somewhere else",
                    description:
                        "Saving now would overwrite those changes. Reload the page to get the latest version; your unsaved edits here will be lost.",
                    type: "error",
                });
            }
            toast.add({
                description: error instanceof Error ? error.message : "Save failed.",
                type: "error",
            });
        },
    });

    /** Saves the document as it is now. Rejects, with the user already told why, when it can't. */
    async function saveTheme(): Promise<SavedThemeRef> {
        const nameError = getThemeNameError(theme.themeName);
        if (nameError) {
            toast.add({ description: `Invalid theme name: ${nameError}`, type: "error" });
            throw new Error(nameError);
        }
        return mutateAsync({ theme, target: saved, keep: unchangedFiles });
    }

    return { saveTheme, isSaving: isPending };
}
