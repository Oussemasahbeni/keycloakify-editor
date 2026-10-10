import type { EmailTemplate } from "@keycloakify-editor/shadcn-theme/email";
import { emailTemplates } from "@keycloakify-editor/shadcn-theme/email";
import { createContext, use, useState } from "react";
import type { Layout } from "react-resizable-panels";

import { useTheme } from "#/components/theme-provider";
import type { Locale } from "#/lib/locales";
import { DEFAULT_LOCALE } from "#/lib/locales";

import type { ThemeAssetKey } from "../shared/model/assets";
import type { PreviewColorScheme } from "../shared/model/preview-color-scheme";
import { resolvePreviewColorScheme } from "../shared/model/preview-color-scheme";
import type { EmailThemeConfig, LoginThemeConfig } from "../shared/model/theme-config";
import type { Viewport } from "../shared/model/viewport";
import type { ParsedTheme } from "../shared/theme-document";
import type { ThemePersistence } from "./use-saved-theme";
import { useSavedTheme } from "./use-saved-theme";
import { useThemeDocument } from "./use-theme-document";

type EditorContextValue = {
    themeName: string;
    setThemeName: (name: string) => void;
    panelLayout: Layout | undefined;
    setPanelLayout: (layout: Layout) => void;
    readonly resetConfig: () => void;
    locale: Locale;
    readonly setLocale: (locale: Locale) => void;
    readonly theme: ParsedTheme;
    readonly persistence: ThemePersistence;
    login: {
        config: LoginThemeConfig;
        updateConfig: (patch: Partial<LoginThemeConfig>) => void;
        previewColorScheme: PreviewColorScheme;
        setPreviewColorScheme: (scheme: PreviewColorScheme) => void;
        togglePreviewColorScheme: () => void;
        viewport: Viewport;
        setViewport: (viewport: Viewport) => void;
        assets: Record<ThemeAssetKey, File | null>;
        setAssets: (assets: Record<ThemeAssetKey, File | null>) => void;
    };
    email: {
        config: EmailThemeConfig;
        updateConfig: (patch: Partial<EmailThemeConfig>) => void;
        template: EmailTemplate;
        setTemplate: (template: EmailTemplate) => void;
        emailLogoFile: File | null;
        setEmailLogoFile: (file: File | null) => void;
    };
};

type EditorProviderProps = {
    /** A saved theme to open (`?themeId=`). */
    themeId?: string;
    /** A share link to open as an unsaved copy (`?share=`). */
    shareToken?: string;
    children: React.ReactNode;
};

const EditorContext = createContext<EditorContextValue | null>(null);

/**
 * Composes the editor's state: the document (`useThemeDocument`), where it
 * comes from and whether it is saved (`useSavedTheme`), and the view settings
 * held here, which are never part of what gets saved or exported.
 */
export function EditorProvider({ themeId, shareToken, children }: EditorProviderProps) {
    const { theme: chromeTheme } = useTheme();

    const themeDocument = useThemeDocument();
    const { theme } = themeDocument;
    const persistence = useSavedTheme({ themeId, shareToken, theme, applyTheme: themeDocument.applyTheme });

    const [viewport, setViewport] = useState<Viewport>("desktop");
    const [previewColorScheme, setPreviewColorScheme] = useState<PreviewColorScheme>(() =>
        resolvePreviewColorScheme(chromeTheme),
    );
    const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>(emailTemplates[0]);
    const [panelLayout, setPanelLayout] = useState<Layout>();
    const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

    const [followedTheme, setFollowedTheme] = useState(chromeTheme);

    if (chromeTheme !== followedTheme) {
        setFollowedTheme(chromeTheme);
        setPreviewColorScheme(resolvePreviewColorScheme(chromeTheme));
    }

    const value: EditorContextValue = {
        themeName: theme.themeName,
        setThemeName: themeDocument.setThemeName,
        panelLayout,
        setPanelLayout,
        locale,
        setLocale,
        theme,
        persistence,
        resetConfig: () => {
            themeDocument.resetConfig();
            setLocale(DEFAULT_LOCALE);
        },
        login: {
            viewport,
            setViewport,
            previewColorScheme,
            setPreviewColorScheme,
            config: theme.login,
            updateConfig: themeDocument.updateLoginConfig,
            togglePreviewColorScheme: () => setPreviewColorScheme(scheme => (scheme === "light" ? "dark" : "light")),
            assets: theme.assets,
            setAssets: themeDocument.setAssets,
        },
        email: {
            config: theme.email,
            updateConfig: themeDocument.updateEmailConfig,
            template: emailTemplate,
            setTemplate: setEmailTemplate,
            emailLogoFile: theme.emailLogoFile,
            setEmailLogoFile: themeDocument.setEmailLogoFile,
        },
    };

    return <EditorContext value={value}>{children}</EditorContext>;
}

export function useEditor() {
    const context = use(EditorContext);
    if (context === null) {
        throw new Error("useEditor must be used within an EditorProvider");
    }
    return context;
}
