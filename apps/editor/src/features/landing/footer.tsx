import { SiDiscord } from "@icons-pack/react-simple-icons";
import { Link } from "@tanstack/react-router";

import { Logo } from "#/components/logo";
import { DISCORD_INVITE_URL, KEYCLOAKIFY_URL, SHADCN_URL, TAILWIND_URL } from "#/config/constants.ts";

import { Band, Eyebrow } from "./band";
import { IconLink } from "./icon-link";

const COLUMNS = [
    {
        heading: "Product",
        links: [
            { name: "Before & after", href: "#compare" },
            { name: "Features", href: "#features" },
            { name: "FAQ", href: "#faq" },
            { name: "Open the editor", href: "/editor" },
        ],
    },
    {
        heading: "Support",
        links: [{ name: "Discord", href: DISCORD_INVITE_URL }],
    },
    {
        heading: "Built with",
        links: [
            { name: "Keycloakify", href: KEYCLOAKIFY_URL },
            { name: "shadcn/ui", href: SHADCN_URL },
            { name: "Tailwind CSS", href: TAILWIND_URL },
        ],
    },
];

/** The link kind follows from the href: external URL, in-page anchor, or app route. */
function FooterLink({ name, href }: { name: string; href: string }) {
    const className = "text-muted-foreground hover:text-foreground text-sm transition-colors duration-200 ease-out";

    if (href.startsWith("http")) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                {name}
            </a>
        );
    }

    if (href.startsWith("#")) {
        return (
            <a href={href} className={className}>
                {name}
            </a>
        );
    }

    return (
        <Link to={href} className={className}>
            {name}
        </Link>
    );
}

export function LandingFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer>
            <Band className="grid gap-10 px-5 py-12 sm:px-10 sm:py-16 lg:grid-cols-[2fr_1fr_1fr_1fr]">
                <div className="flex max-w-sm flex-col gap-4">
                    <Link to="/" className="flex w-fit items-center gap-2">
                        <Logo size={28} />
                        <span className="font-medium tracking-tight">Keycloakify Editor</span>
                    </Link>
                    <p className="text-sm text-pretty text-muted-foreground">
                        A visual editor for Keycloak login themes. Customize colors, type and layout, preview every page
                        live, and export a deploy-ready theme.
                    </p>
                    <div className="flex gap-1">
                        <IconLink href={DISCORD_INVITE_URL} label="Discord server">
                            <SiDiscord />
                        </IconLink>
                    </div>
                </div>

                {COLUMNS.map(column => (
                    <div key={column.heading} className="flex flex-col gap-3">
                        <Eyebrow>{column.heading}</Eyebrow>
                        <ul className="flex flex-col gap-2.5">
                            {column.links.map(link => (
                                <li key={link.name}>
                                    <FooterLink {...link} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </Band>

            <Band ticks={false} className="px-5 py-5 text-center text-xs text-muted-foreground sm:px-10">
                © {currentYear} Keycloakify Editor. All rights reserved.
            </Band>
        </footer>
    );
}
