import { useKcClsx } from "@keycloakify/login-ui/useKcClsx";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { resolveAssetUrl } from "#/lib/resolveAssetUrl";
import { useI18n } from "#/login/i18n";
import { useKcContext } from "#/login/KcContext";
import { useKcEnv } from "#/login/useKcEnv";

import { useApplyThemePreset } from "../../theme/useApplyThemePreset";
import { CenteredCardLayout } from "../layouts/CenteredCardLayout";
import { ImageAsideLayout } from "../layouts/ImageAsideLayout";
import { TwoColumnLayout } from "../layouts/TwoColumnLayout";
import { TemplateContent } from "./TemplateContent";
import { useInitializeTemplate } from "./useInitializeTemplate";

export type TemplateProps = {
    displayInfo?: boolean;
    displayMessage?: boolean;
    displayRequiredFields?: boolean;
    headerNode: ReactNode;
    socialProvidersNode?: ReactNode;
    infoNode?: ReactNode;
    documentTitle?: string;
    bodyClassName?: string;
    children: ReactNode;
};

export function Template(props: TemplateProps) {
    const { documentTitle, bodyClassName } = props;

    const { kcContext } = useKcContext();
    const { msgStr } = useI18n();
    const { kcClsx } = useKcClsx();

    const {
        SHADCN_THEME_LOGO_URL,
        SHADCN_THEME_LOGO_DARK_URL,
        SHADCN_THEME_ASIDE_IMAGE_URL,
        SHADCN_THEME_CARD_IMAGE_URL,
        SHADCN_THEME_SIDE_PANEL_IMAGE_URL,
        SHADCN_THEME_SIDE_PANEL_IMAGE_DARK_URL,
        SHADCN_THEME_SIDE_PANEL_POSITION,
        SHADCN_THEME_LAYOUT,
        SHADCN_THEME_SHOW_REALM_NAME,
        SHADCN_THEME_WELCOME_MESSAGE,
    } = useKcEnv();

    const logoUrl = resolveAssetUrl(SHADCN_THEME_LOGO_URL);
    const logoDarkUrl = resolveAssetUrl(SHADCN_THEME_LOGO_DARK_URL) || logoUrl;
    const asideImageUrl = resolveAssetUrl(SHADCN_THEME_ASIDE_IMAGE_URL);
    const cardImageUrl = resolveAssetUrl(SHADCN_THEME_CARD_IMAGE_URL);
    const sidePanelImageUrl = resolveAssetUrl(SHADCN_THEME_SIDE_PANEL_IMAGE_URL);
    const sidePanelImageDarkUrl = resolveAssetUrl(SHADCN_THEME_SIDE_PANEL_IMAGE_DARK_URL) || sidePanelImageUrl;

    const welcomeMessage = SHADCN_THEME_WELCOME_MESSAGE.trim() || msgStr("welcomeMessage");

    useEffect(() => {
        document.title = documentTitle ?? msgStr("loginTitle", kcContext.realm.displayName || kcContext.realm.name);
    }, []);
    useSetClassName({
        qualifiedName: "html",
        className: kcClsx("kcHtmlClass"),
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? kcClsx("kcBodyClass"),
    });
    useInitializeTemplate();
    useApplyThemePreset();

    switch (SHADCN_THEME_LAYOUT) {
        case "centered-card":
            return (
                <CenteredCardLayout
                    content={<TemplateContent {...props} logoUrl={logoUrl} logoDarkUrl={logoDarkUrl} />}
                    backgroundUrl={cardImageUrl}
                />
            );
        case "image-aside":
            return (
                <ImageAsideLayout
                    content={<TemplateContent {...props} logoUrl={logoUrl} logoDarkUrl={logoDarkUrl} />}
                    imageUrl={asideImageUrl}
                />
            );
        case "two-column":
        default:
            return (
                <TwoColumnLayout
                    content={
                        <TemplateContent
                            {...props}
                            logoUrl={logoUrl}
                            logoDarkUrl={logoDarkUrl}
                            brandingVisibilityClassName="lg:hidden"
                        />
                    }
                    sidePanelImageUrl={sidePanelImageUrl}
                    sidePanelImageDarkUrl={sidePanelImageDarkUrl}
                    sidePanelPosition={SHADCN_THEME_SIDE_PANEL_POSITION}
                    showRealmName={SHADCN_THEME_SHOW_REALM_NAME}
                    welcomeMessage={welcomeMessage}
                    // side panel is a dark surface in both modes
                    logoUrl={logoDarkUrl}
                />
            );
    }
}
