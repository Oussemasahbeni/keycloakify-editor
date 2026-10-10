import { createFileRoute } from "@tanstack/react-router";

import { serverEnv } from "#/config/env.ts";
import { accessChangeFromEvent } from "#/features/billing/model/checkout.ts";
import { recordPurchase, setPurchaseRevoked } from "#/features/billing/server/purchase-store.ts";
import { stripe } from "#/features/billing/server/stripe.ts";

/**
 * Where Stripe reports payments, refunds and disputes. Nothing here is
 * authenticated by a user session: the signature on the raw body is what proves
 * the request came from Stripe.
 */
export const Route = createFileRoute("/api/stripe/webhook")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const signature = request.headers.get("stripe-signature");
                if (!signature) return new Response("Missing signature.", { status: 400 });

                let event;
                try {
                    // The signature covers the exact bytes sent, so the body must not be parsed first.
                    event = await stripe.webhooks.constructEventAsync(
                        await request.text(),
                        signature,
                        serverEnv.STRIPE_WEBHOOK_SECRET,
                    );
                } catch {
                    return new Response("Invalid signature.", { status: 400 });
                }

                const change = accessChangeFromEvent(event);
                // A failure below is left to throw: Stripe retries anything that isn't a 2xx.
                if (change?.type === "grant") await recordPurchase(change.purchase);
                else if (change) await setPurchaseRevoked(change.paymentIntentId, change.type === "revoke");

                return new Response(null, { status: 200 });
            },
        },
    },
});
