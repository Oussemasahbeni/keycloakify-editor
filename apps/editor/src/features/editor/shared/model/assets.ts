import type { ThemePropertyKey } from "./property-keys";
import { THEME_PROPERTY_KEYS } from "./property-keys";
import type { LoginThemeConfig } from "./theme-config";

type Assets = {
    /** Doubles as the `assets` store key AND the multipart field name on export. */
    key: string;
    property: ThemePropertyKey;
    /** Filename stem written into the JAR's `login/resources/dist/`. */
    baseName: string;
    label: string;
    /** When set, the control only applies to this layout. */
    layout?: LoginThemeConfig["layout"];
};

/**
 * The images that can be set by URL **or** an uploaded file. Single source of
 * truth shared by the export client (`export-button`), the server bake
 * (`generate-jar`), the live preview (`routes/preview`), and the sidebar UI
 * (`images-panel`) — so naming and precedence can't drift across them.
 *
 * Favicon is intentionally absent: it's upload-only and has its own multi-file
 * `generateFaviconSet` pipeline.
 */
export const assetDefinitions = [
    {
        key: "logoUrl",
        property: THEME_PROPERTY_KEYS.logoUrl,
        baseName: "logo",
        label: "Logo",
    },
    {
        key: "logoDarkUrl",
        property: THEME_PROPERTY_KEYS.logoDarkUrl,
        baseName: "logo-dark",
        label: "Dark logo (optional)",
    },
    {
        key: "asideImageUrl",
        property: THEME_PROPERTY_KEYS.asideImageUrl,
        baseName: "aside-image",
        label: "Aside image",
        layout: "image-aside",
    },
    {
        key: "cardImageUrl",
        property: THEME_PROPERTY_KEYS.cardImageUrl,
        baseName: "card-background",
        label: "Card background",
        layout: "centered-card",
    },
    {
        key: "sidePanelImageUrl",
        property: THEME_PROPERTY_KEYS.sidePanelImageUrl,
        baseName: "side-panel-image",
        label: "Side panel image",
        layout: "two-column",
    },
    {
        key: "sidePanelImageDarkUrl",
        property: THEME_PROPERTY_KEYS.sidePanelImageDarkUrl,
        baseName: "side-panel-image-dark",
        label: "Side panel dark image (optional)",
        layout: "two-column",
    },
] as const satisfies readonly Assets[];

export const emptyAssets: Record<ThemeAssetKey, File | null> = {
    logoUrl: null,
    logoDarkUrl: null,
    asideImageUrl: null,
    favicon: null,
    cardImageUrl: null,
    sidePanelImageUrl: null,
    sidePanelImageDarkUrl: null,
};

export type AssetKey = (typeof assetDefinitions)[number]["key"];
export type AssetProperty = (typeof assetDefinitions)[number]["property"];
export type ThemeAssetKey = AssetKey | "favicon";
