import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "#/db/index.ts";
import { purchases } from "#/db/schema.ts";

import type { NewPurchase } from "../model/checkout.ts";

/**
 * Storage for purchases. A user has lifetime access while at least one of their
 * purchases is not revoked. Every write is a single statement.
 */

export async function hasLifetimeAccess(ownerSub: string): Promise<boolean> {
    const [purchase] = await db
        .select({ id: purchases.id })
        .from(purchases)
        .where(and(eq(purchases.ownerSub, ownerSub), isNull(purchases.revokedAt)))
        .limit(1);
    return purchase !== undefined;
}

/** Safe to call more than once for the same checkout: the later calls insert nothing. */
export async function recordPurchase(purchase: NewPurchase): Promise<void> {
    await db
        .insert(purchases)
        .values({
            ownerSub: purchase.ownerSub,
            stripeCheckoutSessionId: purchase.checkoutSessionId,
            stripePaymentIntentId: purchase.paymentIntentId,
            amountTotal: purchase.amountTotal,
            currency: purchase.currency,
        })
        .onConflictDoNothing({ target: purchases.stripeCheckoutSessionId });
}

export async function setPurchaseRevoked(paymentIntentId: string, revoked: boolean): Promise<void> {
    await db
        .update(purchases)
        .set({ revokedAt: revoked ? sql`now()` : null })
        .where(eq(purchases.stripePaymentIntentId, paymentIntentId));
}
