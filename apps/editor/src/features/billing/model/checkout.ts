import type Stripe from "stripe";
import { z } from "zod";

export type NewPurchase = {
    ownerSub: string;
    checkoutSessionId: string;
    paymentIntentId: string | null;
    amountTotal: number;
    currency: string;
};

export type AccessChange =
    | { type: "grant"; purchase: NewPurchase }
    | { type: "revoke"; paymentIntentId: string }
    | { type: "restore"; paymentIntentId: string };

/** Stripe returns either an id or the expanded object, depending on the request. */
const idOf = (ref: string | { id: string } | null): string | null =>
    typeof ref === "string" ? ref : (ref?.id ?? null);

/** The purchase a finished checkout stands for, or null if it doesn't grant access. */
export function purchaseFromSession(session: Stripe.Checkout.Session): NewPurchase | null {
    if (session.mode !== "payment") return null;
    // A 100%-off promotion code completes with "no_payment_required" and no payment intent.
    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return null;
    if (!session.client_reference_id) return null;

    return {
        ownerSub: session.client_reference_id,
        checkoutSessionId: session.id,
        paymentIntentId: idOf(session.payment_intent),
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
    };
}

/** What a webhook event means for someone's access, or null if it means nothing. */
export function accessChangeFromEvent(event: Stripe.Event): AccessChange | null {
    switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded": {
            const purchase = purchaseFromSession(event.data.object);
            return purchase && { type: "grant", purchase };
        }
        case "charge.refunded": {
            // `refunded` is true only once the whole charge has been refunded.
            const paymentIntentId = idOf(event.data.object.payment_intent);
            if (!event.data.object.refunded || !paymentIntentId) return null;
            return { type: "revoke", paymentIntentId };
        }
        case "charge.dispute.created": {
            const paymentIntentId = idOf(event.data.object.payment_intent);
            return paymentIntentId ? { type: "revoke", paymentIntentId } : null;
        }
        case "charge.dispute.closed": {
            const paymentIntentId = idOf(event.data.object.payment_intent);
            if (event.data.object.status !== "won" || !paymentIntentId) return null;
            return { type: "restore", paymentIntentId };
        }
        default:
            return null;
    }
}

export const checkoutRequestSchema = z.object({
    surface: z.enum(["login", "email", "account"]),
    /** The theme is saved before checkout, so Stripe can send the user back to it. */
    themeId: z.uuid(),
});

export type ReturnTarget = z.infer<typeof checkoutRequestSchema>;

export const confirmCheckoutRequestSchema = z.object({
    sessionId: z.string().min(1).max(255),
});

export type CheckoutResult = { status: "already-paid" } | { status: "redirect"; url: string };

/** Where Stripe sends the user after checkout: back to the editor surface they left. */
export function buildReturnUrls(origin: string, { surface, themeId }: ReturnTarget) {
    const base = `${origin}/${surface}?themeId=${themeId}&`;
    return {
        // Stripe substitutes this placeholder itself, so the braces must not be URL-encoded.
        successUrl: `${base}checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${base}checkout=cancelled`,
    };
}
