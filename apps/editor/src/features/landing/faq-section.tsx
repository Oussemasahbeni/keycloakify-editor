import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "#/components/ui/accordion";
import { buttonVariants } from "#/components/ui/button";
import { DISCORD_INVITE_URL } from "#/config/constants.ts";
import { cn } from "#/lib/utils";

import { Band } from "./band";

type FaqItem = {
    value: string;
    question: string;
    answer: string;
};

/**
 * Also the source for the page's JSON-LD `FAQPage` (see `routes/index.tsx`), so
 * these answers are indexed verbatim — keep the facts in them accurate.
 */
export const faqItems: FaqItem[] = [
    {
        value: "item-1",
        question: "What is the Keycloakify Editor?",
        answer: "It's a visual editor for Keycloak login themes. Instead of hand-writing FreeMarker templates and CSS, you tweak colors, fonts, radius, and layout in a live editor that renders the real theme, then export a ready-to-deploy theme for your Keycloak instance.",
    },
    {
        value: "item-2",
        question: "What does it cost?",
        answer: "Designing is free. You can use every control, preview all 38 pages and check your email templates without paying. Exporting a deploy-ready theme requires a paid plan.",
    },
    {
        value: "item-3",
        question: "How do I deploy the generated theme to Keycloak?",
        answer: "The editor exports a Keycloakify JAR. Drop that JAR into your Keycloak server's providers/ directory, restart Keycloak, then select the theme under Realm settings → Themes → Login theme. Your customized login and registration pages go live immediately.",
    },
    {
        value: "item-4",
        question: "Can I customize colors, fonts, layouts, and radius?",
        answer: "Yes. Choose from 18 color presets and 7 neutral base palettes, 9 font families, 5 radius presets, and 3 layouts (two-column, centered card, and image-aside). Everything is built on OKLCH color tokens so light and dark mode stay consistent.",
    },
    {
        value: "item-5",
        question: "Does it support multiple languages?",
        answer: "The theme ships with built-in internationalization for 40 languages, including right-to-left locales. You can preview any login page in any supported language directly in the editor.",
    },
    {
        value: "item-6",
        question: "Which pages does it cover?",
        answer: "All 38 pages Keycloak can serve during authentication — sign-in, registration, password reset, OTP and recovery codes, WebAuthn and passkeys, identity-provider linking, consent, logout, and the error and status screens. Email templates are themed from the same palette.",
    },
    {
        value: "item-7",
        question: "Which Keycloak versions are supported?",
        answer: "Themes built with Keycloakify work with Keycloak 11 and up, including 26. Keycloakify polyfills features missing from older servers, so you build against the latest version and it degrades gracefully.",
    },
    {
        value: "item-8",
        question: "What is it built with?",
        answer: "The editor is a TanStack Start app, and the theme is built with Keycloakify, React 19, TypeScript, Tailwind CSS v4, and shadcn/ui. It renders the real theme in an isolated preview, so what you see is exactly what Keycloak will serve.",
    },
];

export function FaqSection() {
    return (
        <Band id="faq" className="px-5 py-14 sm:px-10 sm:py-20">
            <div className="mx-auto max-w-3xl">
                <Accordion>
                    {faqItems.map(item => (
                        <AccordionItem key={item.value} value={item.value} className="py-1">
                            <AccordionTrigger>{item.question}</AccordionTrigger>
                            <AccordionContent>{item.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="mt-10 flex flex-col items-center gap-3 text-center">
                    <p className="text-sm text-muted-foreground">Still have questions?</p>
                    <a
                        href={DISCORD_INVITE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline" }))}
                    >
                        Ask on Discord
                    </a>
                </div>
            </div>
        </Band>
    );
}
