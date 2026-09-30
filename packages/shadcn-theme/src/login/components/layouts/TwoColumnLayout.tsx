import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import type { ReactNode } from "react";

import { cn } from "#/lib/utils";
import { useKcContext } from "#/login/KcContext.ts";
import type { SidePanelPosition } from "#/login/theme/index.ts";

import shape from "../../assets/img/shape.svg";
import { TemplateTopBar } from "../Template/TemplateTopBar";

export function TwoColumnLayout(props: {
    content: ReactNode;
    logoUrl: string | undefined;
    sidePanelImageUrl?: string;
    sidePanelImageDarkUrl?: string;
    sidePanelPosition?: SidePanelPosition;
    showRealmName: boolean;
    welcomeMessage: string;
}) {
    const {
        content,
        logoUrl,
        sidePanelImageUrl,
        sidePanelImageDarkUrl,
        sidePanelPosition = "right",
        showRealmName,
        welcomeMessage,
    } = props;

    // The form is the first grid column (left) by default. When the side panel is
    // placed on the left, swap the column order at `lg+` (below `lg` the panel is
    // hidden and the grid is single-column, so order is irrelevant).
    const isLeft = sidePanelPosition === "left";
    const formOrderClassName = isLeft ? "lg:order-last" : undefined;
    const panelOrderClassName = isLeft ? "lg:order-first" : undefined;

    const { kcContext } = useKcContext();

    const logoAlt = kcContext.realm.displayName || kcContext.realm.name;

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className={cn("relative flex min-h-screen flex-col lg:min-h-0 lg:p-6 lg:pt-10", formOrderClassName)}>
                <TemplateTopBar align={isLeft ? "end" : "start"} />
                <div className="flex flex-1 items-center justify-center p-6 md:p-10 lg:items-center">
                    <main className="w-full max-w-xl">{content}</main>
                </div>
            </div>

            {sidePanelImageUrl || sidePanelImageDarkUrl ? (
                <div className={cn("relative hidden h-full overflow-hidden lg:block", panelOrderClassName)}>
                    <img
                        src={sidePanelImageUrl || sidePanelImageDarkUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover dark:hidden"
                    />

                    <img
                        src={sidePanelImageDarkUrl || sidePanelImageUrl}
                        alt=""
                        className="absolute inset-0 hidden h-full w-full object-cover dark:block"
                    />
                </div>
            ) : (
                <div
                    className={cn(
                        "relative hidden h-full overflow-hidden bg-side-panel text-side-panel-foreground lg:block",
                        panelOrderClassName,
                    )}
                >
                    <div className="flex h-full items-center justify-center pt-20">
                        <div className="absolute top-0 right-0 w-full max-w-62.5 xl:max-w-112.5">
                            <img src={shape} alt="" />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full max-w-62.5 rotate-180 xl:max-w-112.5">
                            <img src={shape} alt="" />
                        </div>

                        <div className="relative z-10 flex max-w-xs flex-col items-center justify-center text-center">
                            <div className="mb-4 flex items-center gap-3">
                                {logoUrl && <img src={logoUrl} alt={logoAlt} className="h-12 w-auto object-contain" />}

                                {showRealmName &&
                                    (kcContext.realm.displayNameHtml ? (
                                        <span
                                            className="text-xl"
                                            dangerouslySetInnerHTML={{
                                                __html: kcSanitize(kcContext.realm.displayNameHtml),
                                            }}
                                        />
                                    ) : (
                                        <span className="text-xl">
                                            {kcContext.realm.displayName || kcContext.realm.name}
                                        </span>
                                    ))}
                            </div>

                            <p className="text-sm opacity-70">{welcomeMessage}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
