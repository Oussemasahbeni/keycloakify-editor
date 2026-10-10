import { queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { getSharedTheme, getTheme } from "#/features/themes/server/themes.ts";
import { toParsedTheme } from "#/features/themes/theme-files.ts";
import type { SavedThemeRef } from "#/lib/draft-storage";
import { clearDraft, loadDraft } from "#/lib/draft-storage";
import { useOidc } from "#/oidc.ts";

import type { ParsedTheme } from "../shared/parse-theme-jar";
import { isSameThemeDocument } from "../shared/theme-document";
import type { ThemeFileSlot } from "../shared/theme-form-data";
import { getThemeFile, themeFileSlots } from "../shared/theme-form-data";

/** Where the editor stands on fetching the theme its URL points at. */
export type RemoteThemeStatus =
    | { state: "ready" }
    | { state: "loading" }
    | { state: "sign-in-required" }
    | { state: "error"; message: string };

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
    /** True when the user asked to save and was sent to sign in first. */
    hasPendingSave: boolean;
    clearPendingSave: () => void;
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

type DraftState = "checking" | "none" | "restored";

/**
 * Everything about where the document comes from and whether it matches what
 * is stored. In order:
 *
 * 1. A draft left in this browser before a sign-in redirect is restored. It
 *    holds the user's own edits, so it wins over whatever the URL points at.
 * 2. Otherwise the saved or shared theme named in the URL is fetched, once.
 * 3. From then on the document is compared against the last stored version to
 *    tell whether, and which parts of, it needs saving.
 */
export function useSavedTheme({ themeId, shareToken, theme, applyTheme }: Options): ThemePersistence {
    const { isOidcReady, isUserLoggedIn } = useOidc();

    const [saved, setSaved] = useState<SavedThemeRef | null>(null);
    // What the stored theme looked like when it was last loaded or saved. Null with
    // `saved` set means "unknown" (restored from a draft), which counts as dirty.
    const [savedSnapshot, setSavedSnapshot] = useState<ParsedTheme | null>(null);
    const [draftState, setDraftState] = useState<DraftState>("checking");
    const [hasPendingSave, setHasPendingSave] = useState(false);

    // 1. The sign-in draft.
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const draft = await loadDraft();
                if (cancelled) return;
                if (!draft) return setDraftState("none");
                const { themeName, login, assets, email, emailLogoFile } = draft;
                applyTheme({ themeName, login, assets, email, emailLogoFile });
                setSaved(draft.saved ?? null);
                setHasPendingSave(draft.pendingAction === "save");
                setDraftState("restored");
                void clearDraft();
            } catch {
                // No draft or storage unavailable — start fresh.
                if (!cancelled) setDraftState("none");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [applyTheme]);

    // 2. The theme in the URL. A saved theme is not fetched when it is the one
    // already open, which is the case right after a first save gives it an id.
    const needsSavedTheme = themeId !== undefined && themeId !== saved?.id && draftState !== "restored";
    const needsSharedTheme = themeId === undefined && shareToken !== undefined && draftState !== "restored";

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
        // Client only, and only once we know who is asking: the saved-theme read
        // needs the access token, and this query must never run during SSR.
        enabled: draftState === "none" && (needsSavedTheme ? isUserLoggedIn === true : needsSharedTheme),
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
        if (draftState === "checking" || (needsSavedTheme && !isOidcReady)) remote = { state: "loading" };
        else if (needsSavedTheme && !isUserLoggedIn) remote = { state: "sign-in-required" };
        else if (remoteQuery.isError) remote = { state: "error", message: remoteQuery.error.message };
        else remote = { state: "loading" };
    }

    // 3. The document against what is stored.
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
        hasPendingSave,
        clearPendingSave: () => setHasPendingSave(false),
    };
}
