import { queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import type { SavedThemeRef } from "#/features/themes/model/saved-theme.ts";
import { getSharedTheme, getTheme } from "#/features/themes/server/themes.ts";
import { toParsedTheme } from "#/features/themes/theme-files.ts";

import type { ParsedTheme } from "../shared/theme-document";
import { isSameThemeDocument } from "../shared/theme-document";
import type { ThemeFileSlot } from "../shared/theme-form-data";
import { getThemeFile, themeFileSlots } from "../shared/theme-form-data";

/** Where the editor stands on fetching the theme its URL points at. */
export type RemoteThemeStatus = { state: "ready" } | { state: "loading" } | { state: "error"; message: string };

export type ThemePersistence = {
    /** The stored theme being edited, or null while the document has never been saved. */
    saved: SavedThemeRef | null;
    /** True when a stored theme has edits that haven't been saved. */
    isDirty: boolean;
    /** True while showing someone else's shared theme that hasn't been saved as a copy. */
    isSharedCopy: boolean;
    /** Stored files the document still uses as they are, so a save needn't upload them again. */
    unchangedFiles: ThemeFileSlot[];
    /** Records a successful save: the theme's new revision and the document that was written. */
    markSaved: (ref: SavedThemeRef, theme: ParsedTheme) => void;
    remote: RemoteThemeStatus;
};

type Options = {
    /** A saved theme to open (`?themeId=`). */
    themeId: string | undefined;
    /** A share link to open as an unsaved copy (`?share=`). */
    shareToken: string | undefined;
    /** The document as it is right now. */
    theme: ParsedTheme;
    applyTheme: (theme: ParsedTheme) => void;
};

/**
 * Everything about where the document comes from and whether it matches what
 * is stored. In order:
 *
 * 1. The saved or shared theme named in the URL is fetched, once.
 * 2. From then on the document is compared against the last stored version to
 *    tell whether, and which parts of, it needs saving.
 */
export function useSavedTheme({ themeId, shareToken, theme, applyTheme }: Options): ThemePersistence {
    const [saved, setSaved] = useState<SavedThemeRef | null>(null);
    // What the stored theme looked like when it was last loaded or saved.
    const [savedSnapshot, setSavedSnapshot] = useState<ParsedTheme | null>(null);

    // 1. The theme in the URL. A saved theme is not fetched when it is the one
    // already open, which is the case right after a first save gives it an id.
    const needsSavedTheme = themeId !== undefined && themeId !== saved?.id;
    const needsSharedTheme = themeId === undefined && shareToken !== undefined;

    const fetchTheme = useServerFn(getTheme);
    const fetchSharedTheme = useServerFn(getSharedTheme);

    const remoteThemeOptions = queryOptions({
        queryKey: ["editor-theme", themeId ?? null, shareToken ?? null, fetchTheme, fetchSharedTheme],
        queryFn: async () => {
            const loaded =
                themeId !== undefined
                    ? await fetchTheme({ data: { id: themeId } })
                    : await fetchSharedTheme({ data: { token: shareToken ?? "" } });
            // The images come straight from object storage, not through the server.
            return { theme: await toParsedTheme(loaded), meta: loaded.saved ?? null };
        },
        // Pages are client-only (see the root route), so this never runs during SSR.
        enabled: needsSavedTheme || needsSharedTheme,
        // Fetched once per visit: never refreshed under the user's edits, and not
        // kept around to be served stale the next time the editor opens.
        staleTime: Infinity,
        gcTime: 0,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
    const remoteQuery = useQuery(remoteThemeOptions);

    const [appliedRemote, setAppliedRemote] = useState<typeof remoteQuery.data>();

    if (remoteQuery.data && remoteQuery.data !== appliedRemote) {
        const { theme: remoteTheme, meta } = remoteQuery.data;
        setAppliedRemote(remoteQuery.data);
        applyTheme(remoteTheme);
        setSaved(meta);
        setSavedSnapshot(meta && remoteTheme);
    }

    let remote: RemoteThemeStatus = { state: "ready" };
    if (needsSavedTheme || (needsSharedTheme && appliedRemote === undefined)) {
        if (remoteQuery.isError) remote = { state: "error", message: remoteQuery.error.message };
        else remote = { state: "loading" };
    }

    // 2. The document against what is stored.
    const isDirty = saved !== null && (savedSnapshot === null || !isSameThemeDocument(theme, savedSnapshot));

    useEffect(() => {
        if (!isDirty) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [isDirty]);

    return {
        saved,
        isDirty,
        isSharedCopy: shareToken !== undefined && saved === null && remote.state === "ready",
        unchangedFiles:
            saved !== null && savedSnapshot !== null
                ? themeFileSlots.filter(slot => {
                      const file = getThemeFile(theme, slot);
                      return file !== null && file === getThemeFile(savedSnapshot, slot);
                  })
                : [],
        markSaved: (ref, savedTheme) => {
            setSaved(ref);
            setSavedSnapshot(savedTheme);
        },
        remote,
    };
}
