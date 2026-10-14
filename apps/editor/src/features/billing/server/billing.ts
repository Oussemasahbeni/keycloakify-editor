import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

import { serverEnv } from "#/config/env.ts";
import { oidcFnMiddleware } from "#/oidc.ts";

import type { CheckoutResult } from "../model/checkout";
import {
    buildReturnUrls,
    checkoutRequestSchema,
    confirmCheckoutRequestSchema,
    purchaseFromSession,
} from "../model/checkout";
import * as store from "./purchase-store";
import { stripe } from "./stripe";

/**
 * The billing API. Access is decided by the purchases table alone; these
 * functions only read it, start a checkout, or record one that has finished.
 */

const loggedIn = oidcFnMiddleware();

export const getAccessStatus = createServerFn({ method: "GET" })
    .middleware([loggedIn])
    .handler(async ({ context }): Promise<{ hasAccess: boolean }> => {
        return { hasAccess: await store.hasLifetimeAccess(context.oidc.accessTokenClaims.sub) };
    });

export const createCheckoutSession = createServerFn({ method: "POST" })
    .middleware([loggedIn])
    .validator(checkoutRequestSchema)
    .handler(async ({ data, context }): Promise<CheckoutResult> => {
        const { sub, email } = context.oidc.accessTokenClaims;
        if (await store.hasLifetimeAccess(sub)) return { status: "already-paid" };

        const { origin } = getRequestUrl({ xForwardedHost: true, xForwardedProto: true });
        const { successUrl, cancelUrl } = buildReturnUrls(origin, data);
        const customerEmail = z.email().safeParse(email);

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{ price: serverEnv.STRIPE_PRICE_ID, quantity: 1 }],
            // How the purchase is tied back to the user once Stripe reports it paid.
            client_reference_id: sub,
            metadata: { sub },
            payment_intent_data: { metadata: { sub } },
            customer_email: customerEmail.success ? customerEmail.data : undefined,
            allow_promotion_codes: true,
            invoice_creation: { enabled: true },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        if (!session.url) throw new Error("Couldn't start the checkout.");
        return { status: "redirect", url: session.url };
    });

/**
 * Called when the user lands back from Stripe. The webhook records the same
 * purchase, but may arrive after the user does; this keeps them from being
 * locked out in the meantime.
 */
export const confirmCheckout = createServerFn({ method: "POST" })
    .middleware([loggedIn])
    .validator(confirmCheckoutRequestSchema)
    .handler(async ({ data, context }): Promise<{ hasAccess: boolean }> => {
        const { sub } = context.oidc.accessTokenClaims;

        const session = await stripe.checkout.sessions.retrieve(data.sessionId);
        const purchase = purchaseFromSession(session);
        // Someone else's session id must never grant access to this user.
        if (purchase && purchase.ownerSub === sub) await store.recordPurchase(purchase);

        return { hasAccess: await store.hasLifetimeAccess(sub) };
    });
