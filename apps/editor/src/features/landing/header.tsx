import { SiDiscord } from "@icons-pack/react-simple-icons";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "#/components/logo";
import { ModeToggle } from "#/components/mode-toggle";
import { Button, buttonVariants } from "#/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "#/components/ui/sheet";
import { DISCORD_INVITE_URL } from "#/config/constants.ts";
import { cn } from "#/lib/utils";

import { IconLink } from "./icon-link";

const NAV_ITEMS = [
    { name: "Compare", href: "#compare" },
    { name: "Features", href: "#features" },
    { name: "FAQ", href: "#faq" },
];

function Brand() {
    return (
        <Link to="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-medium tracking-tight">Keycloak Theme Editor</span>
        </Link>
    );
}

/**
 * Real anchors with real `href`s.
 *
 * The previous implementation attached `onClick` + `preventDefault()` to links
 * that had no `href`, which made them unreachable by keyboard, invisible to
 * crawlers, and impossible to open in a new tab. Native in-page anchors need no
 * JavaScript at all — `scroll-behavior` handles the smoothness, and the global
 * reduced-motion rule turns it off for anyone who asked.
 */
function DesktopNav() {
    return (
        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(item => (
                <a
                    key={item.name}
                    href={item.href}
                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted/60 hover:text-foreground"
                >
                    {item.name}
                </a>
            ))}
        </nav>
    );
}

function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
                render={
                    <Button variant="ghost" size="icon">
                        <Menu />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                }
                className="md:hidden"
            />
            <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:w-100 [&>button]:hidden">
                <SheetHeader className="space-y-0 border-b p-4">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <div className="flex items-center gap-2">
                        <Logo size={28} />
                        <div className="ms-auto flex items-center gap-1">
                            <ModeToggle />
                            <IconLink href={DISCORD_INVITE_URL} label="Discord server">
                                <SiDiscord />
                            </IconLink>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X />
                                <span className="sr-only">Close menu</span>
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                <nav aria-label="Sections" className="flex-1 space-y-1 overflow-y-auto p-4">
                    {NAV_ITEMS.map(item => (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex w-full items-center rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ease-out hover:bg-accent hover:text-accent-foreground"
                        >
                            {item.name}
                        </a>
                    ))}
                </nav>

                <div className="border-t p-4">
                    <Link
                        to="/editor/login"
                        className={cn(buttonVariants({ variant: "default", size: "hero" }), "w-full")}
                    >
                        Open the editor
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function Header() {
    return (
        <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md">
            <div className="wrapper flex items-center justify-between border-b px-5 py-4 sm:px-6">
                <Brand />
                <DesktopNav />
                <div className="hidden items-center gap-1 md:flex">
                    <ModeToggle />
                    <IconLink href={DISCORD_INVITE_URL} label="Discord server">
                        <SiDiscord />
                    </IconLink>
                    <Link to="/editor/login" className={cn(buttonVariants({ variant: "default" }), "ms-2")}>
                        Open the editor
                    </Link>
                </div>
                <MobileMenu />
            </div>
            {/* Draws the corner notches beneath the header's rule. */}
            <div className="wrapper h-0 md:tick-right md:tick-left" aria-hidden />
        </header>
    );
}
