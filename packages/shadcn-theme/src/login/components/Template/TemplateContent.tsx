import { kcSanitize } from "@keycloakify/login-ui/kcSanitize";
import { CircleAlert, CircleCheck, Info, RotateCcw, TriangleAlert, User } from "lucide-react";
import { type ReactNode } from "react";

import { Alert, AlertDescription } from "#/components/ui/alert";
import { buttonVariants } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "#/components/ui/tooltip";
import { cn } from "#/lib/utils";
import { useI18n } from "#/login/i18n";
import { useKcContext } from "#/login/KcContext";
import { useKcEnv } from "#/login/useKcEnv";

import type { TemplateProps } from "./Template";

const messageIcons = {
    success: CircleCheck,
    warning: TriangleAlert,
    error: CircleAlert,
    info: Info,
} as const;

type TemplateContentProps = TemplateProps & {
    logoUrl: string | undefined;
    logoDarkUrl: string | undefined;
    brandingVisibilityClassName?: string;
};

export function TemplateContent(props: TemplateContentProps) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        children,
        logoUrl,
        logoDarkUrl,
        brandingVisibilityClassName,
    } = props;

    const { kcContext } = useKcContext();
    const { auth, url, message, isAppInitiatedAction, realm } = kcContext;
    const { msg, msgStr } = useI18n();

    const { SHADCN_THEME_SHOW_REALM_NAME: showRealmName } = useKcEnv();
    const logoAlt = realm.displayName || realm.name || "Logo";

    const titleNode: ReactNode = !(auth !== undefined && auth.showUsername && !auth.showResetCredentials) ? (
        <h1 className="text-lg">{headerNode}</h1>
    ) : (
        <div id="kc-username" className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-4">
                <User className="size-6 text-muted-foreground" />

                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-normal text-muted-foreground">
                        {msgStr("attemptedUsernameLoggingInAs")}
                    </span>
                    <span className="text-lg font-semibold" id="kc-attempted-username">
                        {auth.attemptedUsername}
                    </span>
                </div>
            </div>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <a
                                id="reset-login"
                                className={buttonVariants({
                                    variant: "outline",
                                    size: "icon",
                                })}
                                href={url.loginRestartFlowUrl}
                                aria-label={msgStr("restartLoginTooltip")}
                            >
                                <RotateCcw className="size-4" />
                            </a>
                        }
                    />
                    <TooltipContent>
                        <p>{msg("restartLoginTooltip")}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <div className={cn("flex flex-col items-center justify-center gap-3", brandingVisibilityClassName)}>
                    <div className="mb-4 flex items-center gap-3">
                        {logoUrl && (
                            <img src={logoUrl} alt={logoAlt} className="h-12 w-auto object-contain dark:hidden" />
                        )}
                        {logoDarkUrl && (
                            <img
                                src={logoDarkUrl}
                                alt={logoAlt}
                                className="hidden h-12 w-auto object-contain dark:inline-block"
                            />
                        )}

                        {showRealmName &&
                            (realm.displayNameHtml ? (
                                <span
                                    className="text-xl"
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(realm.displayNameHtml),
                                    }}
                                />
                            ) : (
                                <span className="text-xl">{realm.displayName || realm.name}</span>
                            ))}
                    </div>
                </div>

                <CardTitle>
                    {displayRequiredFields ? (
                        <div className="flex items-center justify-between gap-2">
                            <div>{titleNode}</div>
                            <div>
                                <span className="text-sm">
                                    <span className="text-red-500" aria-hidden="true">
                                        *
                                    </span>
                                    {msg("requiredFields")}
                                </span>
                            </div>
                        </div>
                    ) : (
                        titleNode
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div id="kc-content" className="flex flex-col gap-4">
                    {displayMessage &&
                        message !== undefined &&
                        (message.type !== "warning" || !isAppInitiatedAction) && (
                            <Alert variant={message.type}>
                                {(() => {
                                    const Icon = messageIcons[message.type];
                                    return <Icon aria-hidden="true" />;
                                })()}
                                <AlertDescription>
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: kcSanitize(message.summary),
                                        }}
                                    />
                                </AlertDescription>
                            </Alert>
                        )}

                    {socialProvidersNode}
                    {children}

                    {auth !== undefined && auth.showTryAnotherWayLink && (
                        <form id="kc-select-try-another-way-form" action={url.loginAction} method="post">
                            <div>
                                <input type="hidden" name="tryAnotherWay" value="on" />
                                <button
                                    type="submit"
                                    id="try-another-way"
                                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                                >
                                    {msg("doTryAnotherWay")}
                                </button>
                            </div>
                        </form>
                    )}

                    {displayInfo && <div className="text-center text-sm">{infoNode}</div>}
                </div>
            </CardContent>
        </Card>
    );
}
