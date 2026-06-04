import Stripe from 'stripe';

// Single Stripe client. Null when unconfigured so the app still builds/runs
// without keys; the checkout/webhook routes return 503 in that case.
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// One-time premium unlock. CZK is charged in haléř (the minor unit), so 29 Kč
// is 2900.
export const PREMIUM_PRICE_CZK = 29;
export const PREMIUM_PRICE_MINOR = PREMIUM_PRICE_CZK * 100;
export const PREMIUM_PRODUCT_CODE = 'premium';
