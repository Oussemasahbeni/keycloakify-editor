import { Stripe } from "stripe";

import { serverEnv } from "#/config/env.ts";

export const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY);
