import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

async function resolveStrategyCallPriceId(rawId: string): Promise<string | null> {
  if (rawId.startsWith("price_")) {
    return rawId;
  }

  if (!rawId.startsWith("prod_")) {
    return null;
  }

  const product = await stripe.products.retrieve(rawId, { expand: ["default_price"] });

  if (product.default_price && typeof product.default_price !== "string") {
    return product.default_price.id;
  }

  const prices = await stripe.prices.list({ product: rawId, active: true, limit: 1 });
  return prices.data[0]?.id ?? null;
}

/**
 * POST /api/stripe/strategy-call
 * Crea una Stripe Checkout Session para el pago único de la Project Strategy Call.
 * - $150 USD (precio inicial, luego $250). Se controla con STRIPE_PRICE_STRATEGY_CALL env var.
 * - mode: "payment" (pago único, no suscripción)
 * - Solo una compra por usuario.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    // Verificar si ya compró la llamada
    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM strategy_call_purchases WHERE user_id = ? AND status = 'paid'",
      [user.id]
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Ya tienes una Strategy Call reservada." },
        { status: 409 }
      );
    }

    const stripePriceOrProductId = process.env.STRIPE_PRICE_STRATEGY_CALL;
    if (!stripePriceOrProductId) {
      return NextResponse.json(
        { success: false, message: "Precio no configurado. Contacta soporte." },
        { status: 500 }
      );
    }

    const priceId = await resolveStrategyCallPriceId(stripePriceOrProductId);
    if (!priceId) {
      console.error(
        "Invalid STRIPE_PRICE_STRATEGY_CALL. Expected a Stripe Price ID (price_*) or Product ID (prod_*), received:",
        stripePriceOrProductId
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "Configuracion de Stripe invalida: STRIPE_PRICE_STRATEGY_CALL debe ser un Price ID (price_*) o Product ID (prod_*) con un precio activo.",
        },
        { status: 500 }
      );
    }

    // Obtener o crear Stripe Customer
    const userData = await queryOne<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      stripe_customer_id: string | null;
    }>(
      "SELECT id, email, first_name, last_name, stripe_customer_id FROM users WHERE id = ?",
      [user.id]
    );

    if (!userData) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    let stripeCustomerId = userData.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        metadata: { user_id: String(userData.id), role: user.role },
      });
      stripeCustomerId = customer.id;
      await query(
        "UPDATE users SET stripe_customer_id = ?, updated_at = NOW() WHERE id = ?",
        [stripeCustomerId, user.id]
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        user_id: String(user.id),
        user_role: user.role,
        purchase_type: "strategy_call",
      },
      success_url: `${appUrl}/dashboard?strategy_call=success`,
      cancel_url: `${appUrl}/dashboard?strategy_call=cancelled`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error creating strategy call checkout session:", error);
    return NextResponse.json({ success: false, message: "Error al procesar el pago" }, { status: 500 });
  }
}

/**
 * GET /api/stripe/strategy-call
 * Retorna si el usuario ya tiene una Strategy Call pagada.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const purchase = await queryOne<{ id: number; status: string; created_at: string }>(
      "SELECT id, status, created_at FROM strategy_call_purchases WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [user.id]
    );

    return NextResponse.json({ success: true, purchase: purchase ?? null });
  } catch (error) {
    console.error("Error fetching strategy call status:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
