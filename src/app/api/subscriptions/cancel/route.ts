import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

// POST /api/subscriptions/cancel — cancel current subscription
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const subscription = await queryOne<{ id: number; status: string; plan_slug: string; stripe_subscription_id: string | null }>(
    `SELECT s.id, s.status, sp.slug as plan_slug, s.stripe_subscription_id
     FROM subscriptions s
     JOIN subscription_plans sp ON s.plan_id = sp.id
     WHERE s.user_id = ? AND s.status IN ('trial', 'active')
     ORDER BY s.created_at DESC LIMIT 1`,
    [user.id]
  );

  if (!subscription) {
    return NextResponse.json({ success: false, message: "No hay suscripcion activa" }, { status: 404 });
  }

  // Free plans can't be cancelled
  if (subscription.plan_slug === "supplier_standard") {
    return NextResponse.json({ success: false, message: "El plan gratuito no se puede cancelar" }, { status: 400 });
  }

  // Si tiene suscripción en Stripe, cancelar allá también (al final del periodo)
  if (subscription.stripe_subscription_id) {
    try {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    } catch (stripeError) {
      console.error("Error cancelling Stripe subscription:", stripeError);
      // Continuar con la cancelación local aunque Stripe falle
    }
  }

  await query(
    "UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE id = ?",
    [subscription.id]
  );

  return NextResponse.json({
    success: true,
    message: "Suscripcion cancelada. Mantendras acceso hasta el final del periodo actual.",
  });
}
