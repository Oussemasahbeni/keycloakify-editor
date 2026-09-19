import { useSyncExternalStore } from "react";

export type BrandOverrides = {
    /** Replaces `SHADCN_THEME_LOGO_URL` when defined (empty string = no logo). */
    logoUrl?: string;
    /** Replaces `SHADCN_THEME_LOGO_DARK_URL` when defined. */
    logoDarkUrl?: string;
};

let overrides: BrandOverrides = {};
const listeners = new Set<() => void>();

/**
 * Runtime override of the logo properties, the counterpart of `applyThemePreset`
 * for images: the presets are CSS variables written at runtime, the logos are
 * `<img src>` values read at render time, so they need a store to re-render from.
 *
 * Nothing writes it on Keycloak; the editor's account preview does, to reflect
 * logo edits without rebuilding the console's context.
 */
export function setBrandOverrides(next: BrandOverrides) {
    overrides = next;
    for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useBrandOverrides(): BrandOverrides {
    return useSyncExternalStore(
        subscribe,
        () => overrides,
        () => overrides,
    );
}
