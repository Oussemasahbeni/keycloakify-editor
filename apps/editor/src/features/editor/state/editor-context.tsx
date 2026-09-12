import type { EmailTemplate } from "@kc-studio/shadcn-theme/email";
import { emailTemplates } from "@kc-studio/shadcn-theme/email";
import { createContext, use, useEffect, useState } from "react";
import type { Layout } from "react-resizable-panels";

import { useTheme } from "#/components/theme-provider";
import { clearDraft, loadDraft } from "#/lib/draft-storage.ts";
import { DEFAULT_LOCALE, type Locale } from "#/lib/locales";

import { BASE_THEME_NAME } from "../shared/constants";
import type { ThemeAssetKey } from "../shared/model/assets";
import { emptyAssets } from "../shared/model/assets";
import type { PreviewColorScheme } from "../shared/model/preview-color-scheme";
import { resolvePreviewColorScheme } from "../shared/model/preview-color-scheme";
import type { EmailThemeConfig, LoginThemeConfig } from "../shared/model/theme-config";
import { defaultLoginThemeConfig } from "../shared/model/theme-config";
import type { Viewport } from "../shared/model/viewport";
import type { ParsedTheme } from "../shared/parse-theme-jar";

type EditorContextValue = {
    themeName: string;
    setThemeName: (name: string) => void;
    panelLayout: Layout | undefined;
    setPanelLayout: (layout: Layout) => void;
    readonly resetConfig: () => void;
    readonly importTheme: (state: ParsedTheme) => void;
    locale: Locale;
    readonly setLocale: (locale: Locale) => void;
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

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const [viewport, setViewport] = useState<Viewport>("desktop");
    const [themeName, setThemeName] = useState<string>(BASE_THEME_NAME);
    const [previewColorScheme, setPreviewColorScheme] = useState<PreviewColorScheme>(() =>
        resolvePreviewColorScheme(theme),
    );
    const [loginThemeConfig, setLoginThemeConfig] = useState<LoginThemeConfig>(defaultLoginThemeConfig);
    const [emailThemeConfig, setEmailThemeConfig] = useState<EmailThemeConfig>({});
    const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>(emailTemplates[0]);
    const [assets, setAssets] = useState<Record<ThemeAssetKey, File | null>>(emptyAssets);
    const [emailLogoFile, setEmailLogoFile] = useState<File | null>(null);
    const [panelLayout, setPanelLayout] = useState<Layout>();
    const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

    // Follow the editor chrome theme: it settles to the stored value after
    // mount, and the user can switch it later from the header.
    useEffect(() => {
        setPreviewColorScheme(resolvePreviewColorScheme(theme));
    }, [theme]);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const draft = await loadDraft();
                if (cancelled || !draft) return;
                setThemeName(draft.themeName);
                setLoginThemeConfig(() => draft.login);
                setAssets(draft.assets);
                setEmailThemeConfig(draft.email);
                setEmailLogoFile(draft.emailLogoFile);
                void clearDraft();
            } catch {
                // No draft or storage unavailable — start fresh.
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const value: EditorContextValue = {
        themeName,
        setThemeName,
        panelLayout,
        setPanelLayout,
        locale,
        setLocale,
        resetConfig: () => {
            setLoginThemeConfig(defaultLoginThemeConfig);
            setEmailThemeConfig({});
            setAssets(emptyAssets);
            setEmailLogoFile(null);
            setLocale(DEFAULT_LOCALE);
        },
        importTheme: state => {
            setThemeName(state.themeName);
            setLoginThemeConfig(state.login);
            setAssets(state.assets);
            setEmailThemeConfig(state.email);
            setEmailLogoFile(state.emailLogoFile);
        },
        login: {
            viewport,
            setViewport,
            previewColorScheme,
            setPreviewColorScheme,
            config: loginThemeConfig,
            updateConfig: patch => setLoginThemeConfig(current => ({ ...current, ...patch })),
            togglePreviewColorScheme: () => setPreviewColorScheme(scheme => (scheme === "light" ? "dark" : "light")),
            assets: assets,
            setAssets: setAssets,
        },
        email: {
            config: emailThemeConfig,
            updateConfig: patch => setEmailThemeConfig(current => ({ ...current, ...patch })),
            template: emailTemplate,
            setTemplate: setEmailTemplate,
            emailLogoFile,
            setEmailLogoFile,
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
