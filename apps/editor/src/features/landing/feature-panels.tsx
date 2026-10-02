import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { LOCALE_COUNT, LOCALES } from "#/lib/locales";
import { cn } from "#/lib/utils";

import { Band, Eyebrow } from "./band";
import { Reveal } from "./reveal";
import { Screenshot } from "./screenshot";

/**
 * Feature panels.
 *
 * The grid draws the rules (`divide-x divide-y`) and each edge cell zeroes its
 * outer border, rather than stacking four separately-bordered cards. That keeps
 * the page reading as one ruled document and lets each panel's media bleed
 * flush to the rule instead of floating inside a rounded box.
 */
export function FeaturePanels() {
    return (
        <Band className="grid divide-y divide-border lg:grid-cols-2 lg:divide-x">
            <Panel
                eyebrow="Live preview"
                title="See the real page, not an approximation"
                body="The editor renders the actual theme in an isolated frame — the same code Keycloak will serve. Change a token and every page updates instantly, across all three layouts."
            >
                <Screenshot
                    src="/images/editor-preview-white.png"
                    alt="The editor with its configuration sidebar beside a live login page preview"
                    width={2560}
                    height={1271}
                    className="w-full rounded-lg border object-cover shadow-sm dark:hidden"
                />
                <Screenshot
                    src="/images/editor-preview-dark.png"
                    alt=""
                    width={2560}
                    height={1271}
                    className="hidden w-full rounded-lg border object-cover shadow-sm dark:block"
                />
            </Panel>

            <Panel
                eyebrow="Internationalisation"
                title={`${LOCALE_COUNT} languages, already translated`}
                body="Every string on every page ships translated, right-to-left included. Preview any locale without leaving the editor."
                className="lg:border-b-0"
            >
                <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] overflow-hidden rounded-lg border">
                    {LOCALES.map(locale => (
                        <span
                            key={locale}
                            className="-ms-px -mt-px border-s border-t border-border/60 px-2 py-2 text-center font-mono text-[0.6875rem] text-muted-foreground transition-colors duration-200 hover:bg-muted/50 hover:text-foreground"
                        >
                            {locale}
                        </span>
                    ))}
                </div>
            </Panel>

            <Panel
                eyebrow="Email templates"
                title="The emails match the login page"
                body="Verification, password reset and the rest are themed from the same palette, so a user who leaves for their inbox comes back to something that still looks like you."
                className="lg:border-b-0"
            >
                {/* Native size is 845×514 — sharp up to ~max-w-sm on 2× screens, so
                    don't display it larger without recapturing. */}
                <Screenshot
                    src="/images/email-preview.png"
                    alt="A themed email sent by Keycloak, styled from the same palette as the login pages"
                    width={845}
                    height={514}
                    className="w-full max-w-sm rounded-lg border shadow-sm"
                />
            </Panel>

            <Panel
                eyebrow="Export"
                title="Leaves as a deploy-ready .jar"
                body="Export bundles your login and email themes into a Keycloak provider JAR. Drop it in providers/, restart, pick the theme. Nothing to build, nothing to wire up."
                className="lg:border-b-0"
            >
                <TerminalDemo />
            </Panel>
        </Band>
    );
}

const EXPORT_LINES = ["cp my-theme.jar keycloak/providers/", "./kc.sh start-dev"] as const;

/**
 * The export panel's fake terminal. Server-renders the finished session (for
 * crawlers and no-JS), then replays it once on first view: each command types
 * itself out, then the confirmation line fades in. All writes go straight to
 * the DOM, and the `$` prompts stay in place so nothing shifts.
 */
function TerminalDemo() {
    const rootRef = useRef<HTMLDivElement>(null);
    const line1Ref = useRef<HTMLSpanElement>(null);
    const line2Ref = useRef<HTMLSpanElement>(null);
    const checkRef = useRef<HTMLDivElement>(null);
    const lineRefs = [line1Ref, line2Ref];
    const isInView = useInView(rootRef, { once: true, amount: 0.6 });
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const lines = [line1Ref.current, line2Ref.current];
        const check = checkRef.current;
        if (!isInView || prefersReducedMotion || !check || lines.some(line => !line)) return;

        let stopped = false;
        let controls: ReturnType<typeof animate> | undefined;

        const typeInto = (node: HTMLElement, text: string, delay: number) => {
            controls = animate(0, text.length, {
                delay,
                duration: text.length * 0.035,
                ease: "linear",
                onUpdate: latest => {
                    const count = Math.round(latest);
                    node.textContent = text.slice(0, count) + (count < text.length ? "▍" : "");
                },
            });
            return controls;
        };

        const run = async () => {
            for (const line of lines) line!.textContent = "";
            check.style.opacity = "0";
            await typeInto(lines[0]!, EXPORT_LINES[0], 0.2);
            if (stopped) return;
            await typeInto(lines[1]!, EXPORT_LINES[1], 0.3);
            if (stopped) return;
            controls = animate(0, 1, {
                delay: 0.25,
                duration: 0.4,
                onUpdate: latest => {
                    check.style.opacity = String(latest);
                },
            });
        };
        void run();

        return () => {
            stopped = true;
            controls?.stop();
        };
    }, [isInView, prefersReducedMotion]);

    return (
        <div
            ref={rootRef}
            className="w-full max-w-sm space-y-1 rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs"
        >
            {EXPORT_LINES.map((line, index) => (
                <div key={line} className="text-muted-foreground">
                    <span className="select-none">$ </span>
                    <span ref={lineRefs[index]}>{line}</span>
                </div>
            ))}
            <div ref={checkRef} className="pt-1 text-success">
                ✓ theme available in the admin console
            </div>
        </div>
    );
}

function Panel({
    eyebrow,
    title,
    body,
    children,
    className,
}: {
    eyebrow: string;
    title: string;
    body: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <Reveal className="flex flex-col gap-3 p-5 pb-0 sm:p-10 sm:pb-0">
                <Eyebrow>{eyebrow}</Eyebrow>
                <h3 className="text-xl leading-snug font-medium tracking-tight text-balance">{title}</h3>
                <p className="max-w-120 text-sm text-pretty text-muted-foreground">{body}</p>
            </Reveal>
            <div className="flex flex-1 items-center justify-center p-5 pt-0 sm:p-10 sm:pt-0">{children}</div>
        </div>
    );
}
