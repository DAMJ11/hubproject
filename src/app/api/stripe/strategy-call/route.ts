import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

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

    const priceId = process.env.STRIPE_PRICE_STRATEGY_CALL;
    if (!priceId) {
      return NextResponse.json(
        { success: false, message: "Precio no configurado. Contacta soporte." },
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
