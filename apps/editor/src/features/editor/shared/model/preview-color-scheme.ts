import { Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PreviewColorScheme = "light" | "dark";

/**
 * Map the editor chrome theme onto a preview scheme. The chrome theme can be
 * `"system"` (and always is on the first render, before localStorage is read),
 * but the theme presets are keyed only by `"light"` / `"dark"`.
 */
export function resolvePreviewColorScheme(theme: "light" | "dark" | "system"): PreviewColorScheme {
    if (theme !== "system") return theme;
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Set on the editor's `<html>` so a preview frame can read the scheme before its first paint. */
export const PREVIEW_SCHEME_ATTRIBUTE = "data-preview-scheme";

/** The key the theme's own `ThemeProvider` reads on every (re)mount. */
const THEME_STORAGE_KEY = "isDarkMode";

/**
 * Blocking script for the preview documents: marks the scheme on `<html>` before
 * anything paints, so the loading state doesn't flash white in a dark editor.
 * A framed preview asks the editor (same origin): its preview scheme once
 * published, else its chrome scheme, which is what the preview scheme starts as.
 * A standalone tab falls back to the last scheme a preview used, then the system's.
 */
export const previewColorSchemeScript = `(function(){try{var s;try{if(window.parent!==window){var p=window.parent.document.documentElement;s=p.getAttribute(${JSON.stringify(PREVIEW_SCHEME_ATTRIBUTE)})||(p.classList.contains('dark')?'dark':'light')}}catch(e){}if(s!=='light'&&s!=='dark'){s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}if(s!=='light'&&s!=='dark'){s=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.add(s);localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)},s)}catch(e){}})();`;

/** Preview side: the scheme currently marked on this document. */
export function readPreviewColorScheme(): PreviewColorScheme {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Preview side: apply a scheme to this document and to the theme's `ThemeProvider` storage. */
export function applyPreviewColorScheme(scheme: PreviewColorScheme) {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(scheme);

    localStorage.setItem(THEME_STORAGE_KEY, scheme);
}

type SchemeConfig = {
    value: PreviewColorScheme;
    label: string;
    icon: LucideIcon;
};
export const SCHEMES = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
] as const satisfies ReadonlyArray<SchemeConfig>;
