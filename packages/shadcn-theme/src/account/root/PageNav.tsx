/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260700.0.3.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/root/PageNav.tsx" --revert
 */

import {
    BadgeCheckIcon,
    Building2Icon,
    ChevronRightIcon,
    CircleDotIcon,
    FolderOpenIcon,
    LayoutGridIcon,
    type LucideIcon,
    ShieldIcon,
    UserRoundIcon,
    UsersIcon,
} from "lucide-react";
import { type MouseEvent as ReactMouseEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { matchPath, useHref, useLinkClickHandler, useLocation } from "react-router-dom";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#/components/ui/collapsible";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "#/components/ui/sidebar";
import { cn } from "#/lib/utils";

import type { AccountEnvironment, Feature } from "..";
import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useContent } from "../api/queries";
import type { TFuncKey } from "../i18n-type";
import { useDocumentDirection } from "../utils/useDocumentDirection";
import { Brand } from "./Brand";
import { useBrand } from "./useBrand";

type RootMenuItem = {
    id?: string;
    label: TFuncKey;
    path: string;
    isVisible?: keyof Feature;
    modulePath?: string;
};

type MenuItemWithChildren = {
    label: TFuncKey;
    children: MenuItem[];
    isVisible?: keyof Feature;
};

export type MenuItem = RootMenuItem | MenuItemWithChildren;

/**
 * Icons for the top-level entries Keycloak ships in `content.json`, keyed by their
 * i18n label (the stable identifier). Realm-provided custom entries get a neutral icon
 * so the column stays aligned.
 */
const menuIcons: Record<string, LucideIcon> = {
    personalInfo: UserRoundIcon,
    accountSecurity: ShieldIcon,
    applications: LayoutGridIcon,
    verifiableCredentials: BadgeCheckIcon,
    groups: UsersIcon,
    organizations: Building2Icon,
    resources: FolderOpenIcon,
};

function MenuIcon({ label }: { label: string }) {
    const Icon = menuIcons[label] ?? CircleDotIcon;

    return <Icon aria-hidden="true" />;
}

function getFullUrl(path: string, baseUrl: string) {
    return `${new URL(baseUrl).pathname}${path}`;
}

function matchMenuItem(currentPath: string, menuItem: MenuItem, baseUrl: string): boolean {
    if ("path" in menuItem) {
        return !!matchPath(getFullUrl(menuItem.path, baseUrl), currentPath);
    }

    return menuItem.children.some(child => matchMenuItem(currentPath, child, baseUrl));
}

function isVisible(menuItem: MenuItem, features: Feature) {
    return menuItem.isVisible ? features[menuItem.isVisible] : true;
}

function useMenuLink(path: string) {
    const { environment } = useEnvironment<AccountEnvironment>();
    const { isMobile, setOpenMobile } = useSidebar();
    const menuItemPath = getFullUrl(path, environment.baseUrl) + location.search;
    const href = useHref(menuItemPath);
    const handleClick = useLinkClickHandler(menuItemPath);

    return {
        href,
        onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => {
            handleClick(event);
            if (isMobile) {
                setOpenMobile(false);
            }
        },
    };
}

function useIsActive(menuItem: MenuItem) {
    const { environment } = useEnvironment<AccountEnvironment>();
    const { pathname } = useLocation();

    return useMemo(
        () => matchMenuItem(pathname, menuItem, environment.baseUrl),
        [pathname, menuItem, environment.baseUrl],
    );
}

function NavLeaf({ menuItem }: { menuItem: RootMenuItem }) {
    const { t } = useTranslation();
    const isActive = useIsActive(menuItem);
    const { href, onClick } = useMenuLink(menuItem.path);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isActive}
                render={<a href={href} onClick={onClick} aria-label={t(menuItem.label)} data-testid={menuItem.path} />}
            >
                <MenuIcon label={menuItem.label} />
                <span>{t(menuItem.label)}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function NavSubLeaf({ menuItem }: { menuItem: RootMenuItem }) {
    const { t } = useTranslation();
    const isActive = useIsActive(menuItem);
    const { href, onClick } = useMenuLink(menuItem.path);

    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton isActive={isActive} href={href} onClick={onClick} data-testid={menuItem.path}>
                <span>{t(menuItem.label)}</span>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}

function NavGroup({ menuItem }: { menuItem: MenuItemWithChildren }) {
    const { t } = useTranslation();
    const { environment } = useEnvironment<AccountEnvironment>();
    const isActive = useIsActive(menuItem);
    const [open, setOpen] = useState(isActive);
    const [wasActive, setWasActive] = useState(isActive);

    if (isActive !== wasActive) {
        setWasActive(isActive);
        if (isActive) setOpen(true);
    }

    return (
        <SidebarMenuItem>
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger
                    render={<SidebarMenuButton isActive={isActive && !open} data-testid={menuItem.label} />}
                >
                    <MenuIcon label={menuItem.label} />
                    <span>{t(menuItem.label)}</span>
                    <ChevronRightIcon
                        className={cn(
                            "ms-auto size-4 text-muted-foreground transition-transform rtl:-scale-x-100",
                            open && "rotate-90",
                        )}
                    />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {menuItem.children
                            .filter(child => isVisible(child, environment.features))
                            .map(child =>
                                "path" in child ? (
                                    <NavSubLeaf key={child.label} menuItem={child} />
                                ) : (
                                    <NavGroup key={child.label} menuItem={child} />
                                ),
                            )}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}

export const PageNav = () => {
    const { t } = useTranslation();
    const context = useEnvironment<AccountEnvironment>();
    const { href } = useBrand();
    const direction = useDocumentDirection();
    const { data: menuItems } = useContent();

    return (
        <Sidebar collapsible="offcanvas" dir={direction} side={direction === "rtl" ? "right" : "left"}>
            <SidebarHeader className="h-14 justify-center px-4">
                <a
                    href={href}
                    className="flex w-fit items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    <Brand alt={t("logo")} />
                </a>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems === undefined
                                ? Array.from({ length: 4 }, (_, index) => (
                                      <SidebarMenuItem key={index}>
                                          <SidebarMenuSkeleton />
                                      </SidebarMenuItem>
                                  ))
                                : menuItems
                                      .filter(menuItem => isVisible(menuItem, context.environment.features))
                                      .map(menuItem =>
                                          "path" in menuItem ? (
                                              <NavLeaf key={menuItem.label} menuItem={menuItem} />
                                          ) : (
                                              <NavGroup key={menuItem.label} menuItem={menuItem} />
                                          ),
                                      )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};
