import { animate, m, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import type { CarouselApi } from "#/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "#/components/ui/carousel";
import { cn } from "#/lib/utils";

import { Band } from "./band";
import { Screenshot } from "./screenshot";

/** Every capture shares this frame — `scripts/encode-gallery.mjs` enforces it. */
const FRAME = { width: 1991, height: 1271 } as const;

/**
 * One capture per entry. `label` is the button, `caption` is the alt text, and
 * the `.png` is `id` — see `public/images/gallery/`.
 */
const GALLERY = [
    { id: "side-panel-image", label: "Side panel", caption: "Recovery codes beside a photographic side panel" },
    { id: "sign-in", label: "Sign in", caption: "A sign-in page with social providers" },
    { id: "light-mode", label: "Light mode", caption: "The same sign-in page in light mode" },
    { id: "monospace", label: "Monospace", caption: "A sign-in page set entirely in a monospace face" },
    {
        id: "select-authenticator",
        label: "Authenticator",
        caption: "Choosing between an authenticator app and a passkey",
    },
    { id: "centered-card", label: "Centered card", caption: "A sign-in page on a single centred card" },
    { id: "side-image", label: "Side image", caption: "A one-time code prompt with the image inside the card" },
    { id: "delete-account", label: "Delete account", caption: "A destructive confirmation, styled with the rest" },
] as const;

const AUTOPLAY_INTERVAL_MS = 5000;
const PILL_SPRING = { type: "spring", stiffness: 500, damping: 40 } as const;

export function ThemeGallery() {
    const [api, setApi] = useState<CarouselApi>();
    const [active, setActive] = useState(0);

    const carouselRef = useRef<HTMLDivElement>(null);
    const stripRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    /** The highlight behind the active label, slid between buttons by measurement. */
    const pillLeft = useMotionValue(0);
    const pillWidth = useMotionValue(0);

    const isInView = useInView(carouselRef, { amount: 0.4 });
    const prefersReducedMotion = useReducedMotion();

    /** True once the user touches the gallery — autoplay ends for good. */
    const [engaged, setEngaged] = useState(false);

    useEffect(() => {
        if (!api) return;

        const sync = () => setActive(api.selectedScrollSnap());
        sync();
        api.on("select", sync);
        api.on("reInit", sync);

        return () => {
            api.off("select", sync);
            api.off("reInit", sync);
        };
    }, [api]);

    /* Gentle auto-advance: only while visible, never after the user has taken
       over, and not for reduced motion. No pause-on-hover — wheel-scrolling
       parks the cursor over the carousel, which made autoplay look broken. */
    useEffect(() => {
        if (!api || !isInView || engaged || prefersReducedMotion) return;
        const id = setInterval(() => api.scrollNext(), AUTOPLAY_INTERVAL_MS);
        return () => clearInterval(id);
    }, [api, isInView, engaged, prefersReducedMotion]);

    /* Slide the pill under the active label and keep it visible in the strip. */
    useEffect(() => {
        const button = buttonRefs.current[active];
        const strip = stripRef.current;
        if (!button || !strip) return;

        const left = button.offsetLeft;
        const width = button.offsetWidth;
        if (pillWidth.get() === 0 || prefersReducedMotion) {
            pillLeft.jump(left);
            pillWidth.jump(width);
        } else {
            animate(pillLeft, left, PILL_SPRING);
            animate(pillWidth, width, PILL_SPRING);
        }

        strip.scrollTo({
            left: left - (strip.clientWidth - width) / 2,
            behavior: prefersReducedMotion ? "auto" : "smooth",
        });
    }, [active, prefersReducedMotion, pillLeft, pillWidth]);

    return (
        // Any pointer-down or keyboard focus inside the gallery — a drag, an
        // arrow, a label, a tab stop — hands control to the user permanently.
        <Band onPointerDownCapture={() => setEngaged(true)} onFocusCapture={() => setEngaged(true)}>
            <div ref={carouselRef}>
                <Carousel
                    setApi={setApi}
                    opts={{ loop: true }}
                    aria-label="Screens built with the editor"
                    className="mx-auto w-full max-w-6xl p-5 sm:p-10"
                >
                    <CarouselContent>
                        {GALLERY.map(entry => (
                            <CarouselItem key={entry.id}>
                                <Screenshot
                                    src={`/images/gallery/${entry.id}.png`}
                                    alt={entry.caption}
                                    width={FRAME.width}
                                    height={FRAME.height}
                                    className="size-full rounded-lg border object-cover"
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>

            <div
                ref={stripRef}
                className="relative flex items-center gap-2 overflow-x-auto border-t px-4 py-2 max-sm:[scrollbar-width:none]"
            >
                <m.span
                    aria-hidden
                    className="absolute top-2 h-8 rounded-lg bg-primary"
                    style={{ left: pillLeft, width: pillWidth }}
                />
                {GALLERY.map((entry, index) => (
                    <Button
                        onClick={() => api?.scrollTo(index, prefersReducedMotion ?? false)}
                        aria-current={index === active ? "true" : undefined}
                        key={entry.id}
                        ref={element => {
                            buttonRefs.current[index] = element;
                        }}
                        variant="ghost"
                        className={cn(
                            "relative shrink-0 transition-colors",
                            index === active &&
                                "text-primary-foreground hover:bg-transparent hover:text-primary-foreground dark:hover:bg-transparent",
                        )}
                    >
                        {entry.label}
                    </Button>
                ))}
            </div>
        </Band>
    );
}
