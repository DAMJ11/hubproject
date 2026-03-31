import Stripe from "stripe";

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }
  return new Stripe(key, { typescript: true });
}

// Lazy singleton: se inicializa en el primer uso, no al importar el módulo
let _stripe: Stripe | null = null;
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) _stripe = getStripeClient();
    return (_stripe as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Mapeo de slugs internos a Stripe Price IDs.
 * Estos IDs se configuran en el dashboard de Stripe y se guardan como env vars.
 * Formato: STRIPE_PRICE_<SLUG_UPPERCASE>
 */
export function getStripePriceId(planSlug: string): string | null {
  const key = `STRIPE_PRICE_${planSlug.toUpperCase()}`;
  return process.env[key] || null;
}

/**
 * Mapeo inverso: dado un Stripe Price ID, retorna el slug interno del plan.
 */
export function getPlanSlugFromPriceId(priceId: string): string | null {
  const slugs = [
    "brand_starter",
    "brand_scale",
    "brand_enterprise",
    "supplier_standard",
    "supplier_pro",
    "supplier_elite",
  ];

  for (const slug of slugs) {
    const key = `STRIPE_PRICE_${slug.toUpperCase()}`;
    if (process.env[key] === priceId) {
      return slug;
    }
  }
  return null;
}
