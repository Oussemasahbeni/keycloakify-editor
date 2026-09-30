/**
 * This file has been claimed for ownership from @keycloakify/keycloak-ui-shared version 260700.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/masthead/Masthead.tsx" --revert
 *
 * Rewritten with shadcn/ui: sidebar trigger, optional brand, toolbar items,
 * theme toggle and a user menu (avatar + name + sign out). Must be rendered
 * inside a `SidebarProvider`.
 */

import type { TFunction } from "i18next";
import { LogOutIcon, UserRoundIcon } from "lucide-react";
import type { Keycloak, KeycloakTokenParsed } from "oidc-spa/keycloak-js";
import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { SidebarTrigger } from "#/components/ui/sidebar";
import { cn } from "#/lib/utils";
import { ModeToggle } from "#/login/components/ui/ThemeToggle.tsx";

function loggedInUserName(token: KeycloakTokenParsed | undefined, t: TFunction) {
    if (!token) {
        return t("unknownUser");
    }

    const givenName = token.given_name as string | undefined;
    const familyName = token.family_name as string | undefined;
    const preferredUsername = token.preferred_username as string | undefined;

    if (givenName && familyName) {
        return t("fullName", { givenName, familyName });
    }

    return givenName || familyName || preferredUsername || t("unknownUser");
}

function initialsOf(token: KeycloakTokenParsed | undefined) {
    const names = [token?.given_name, token?.family_name].filter(
        (name): name is string => typeof name === "string" && name.length > 0,
    );

    if (names.length > 0) {
        return names
            .map(name => name.charAt(0))
            .join("")
            .toUpperCase();
    }

    const username = token?.preferred_username;

    return typeof username === "string" && username.length > 0 ? username.charAt(0).toUpperCase() : "?";
}

type BrandLogo = {
    href?: string;
    logo: ReactNode;
    className?: string;
};

type KeycloakMastheadProps = Omit<ComponentProps<"header">, "children"> & {
    keycloak: Keycloak;
    brand?: BrandLogo;
    avatar?: { src?: string; alt?: string };
    features?: {
        hasLogout?: boolean;
        hasManageAccount?: boolean;
        hasUsername?: boolean;
    };
    /** Extra entries rendered at the top of the user menu (`DropdownMenuItem`s). */
    dropdownItems?: ReactNode[];
    /** Upstream mobile-only kebab entries; rendered in the same user menu here. */
    kebabDropdownItems?: ReactNode[];
    /** Elements placed before the theme toggle (e.g. a "back to app" link). */
    toolbarItems?: ReactNode[];
    toolbar?: ReactNode;
};

const KeycloakMasthead = ({
    keycloak,
    brand,
    avatar,
    features: { hasLogout = true, hasManageAccount = true } = {},
    kebabDropdownItems,
    dropdownItems = [],
    toolbarItems,
    toolbar,
    className,
    ...rest
}: KeycloakMastheadProps) => {
    const { t } = useTranslation();

    const token = keycloak.idTokenParsed;
    const displayName = loggedInUserName(token, t);
    const email = typeof token?.email === "string" ? token.email : undefined;
    const picture = (typeof token?.picture === "string" ? token.picture : undefined) ?? avatar?.src;
    const menuItems = [...dropdownItems, ...(kebabDropdownItems ?? [])];

    return (
        <header
            className={cn(
                "flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:px-4",
                className,
            )}
            {...rest}
        >
            <SidebarTrigger aria-label={t("navigation")} />

            {brand && (
                <a
                    href={brand.href}
                    className={cn(
                        "flex items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        brand.className,
                    )}
                >
                    {brand.logo}
                </a>
            )}

            <div className="ms-auto flex items-center gap-1 sm:gap-2">
                {toolbar}
                {toolbarItems}
                <ModeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger
                        data-testid="options-toggle"
                        render={
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={picture} alt={avatar?.alt ?? t("avatar")} />
                                    <AvatarFallback className="text-xs font-medium">{initialsOf(token)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-60">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="flex flex-col gap-0.5">
                                <span className="truncate font-medium text-foreground">{displayName}</span>
                                {email && (
                                    <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
                                )}
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        {menuItems.length > 0 && (
                            <>
                                <DropdownMenuGroup>{menuItems}</DropdownMenuGroup>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        {hasManageAccount && (
                            <DropdownMenuItem onClick={() => keycloak.accountManagement()}>
                                <UserRoundIcon />
                                {t("manageAccount")}
                            </DropdownMenuItem>
                        )}
                        {hasLogout && (
                            <DropdownMenuItem variant="destructive" onClick={() => keycloak.logout()}>
                                <LogOutIcon />
                                {t("signOut")}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default KeycloakMasthead;
