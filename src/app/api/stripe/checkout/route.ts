import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { stripe, getStripePriceId } from "@/lib/stripe";

interface SubscriptionPlan {
  id: number;
  slug: string;
  name: string;
  target_role: string;
  price_usd: number;
  stripe_price_id: string | null;
}

/**
 * POST /api/stripe/checkout
 * Crea una Stripe Checkout Session para suscripción.
 * Body: { plan_slug: string }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { plan_slug } = body as { plan_slug: string };

    if (!plan_slug || typeof plan_slug !== "string") {
      return NextResponse.json({ success: false, message: "plan_slug requerido" }, { status: 400 });
    }

    // Buscar plan en BD
    const plan = await queryOne<SubscriptionPlan>(
      "SELECT * FROM subscription_plans WHERE slug = ? AND is_active = TRUE",
      [plan_slug]
    );

    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan no encontrado" }, { status: 404 });
    }

    // Planes gratuitos no pasan por Stripe
    if (plan.price_usd <= 0) {
      return NextResponse.json({
        success: false,
        message: "Los planes gratuitos no requieren checkout. Usa POST /api/subscriptions.",
      }, { status: 400 });
    }

    // Validar rol
    if (
      (user.role === "brand" && !plan.slug.startsWith("brand_")) ||
      (user.role === "manufacturer" && !plan.slug.startsWith("supplier_"))
    ) {
      return NextResponse.json({ success: false, message: "Plan no disponible para tu rol" }, { status: 403 });
    }

    // Obtener el Stripe Price ID (de BD o env var)
    const stripePriceId = plan.stripe_price_id || getStripePriceId(plan.slug);
    if (!stripePriceId) {
      return NextResponse.json({
        success: false,
        message: "Este plan no tiene un precio configurado en Stripe. Contacta soporte.",
      }, { status: 500 });
    }

    // Obtener o crear Stripe Customer
    const userData = await queryOne<{ id: number; email: string; first_name: string; last_name: string; stripe_customer_id: string | null }>(
      "SELECT id, email, first_name, last_name, stripe_customer_id FROM users WHERE id = ?",
      [user.id]
    );

    if (!userData) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    let stripeCustomerId = userData.stripe_customer_id;

    if (!stripeCustomerId) {
      // Crear customer en Stripe
      const customer = await stripe.customers.create({
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        metadata: {
          user_id: String(userData.id),
          role: user.role,
        },
      });

      stripeCustomerId = customer.id;

      // Guardar en BD
      await query(
        "UPDATE users SET stripe_customer_id = ?, updated_at = NOW() WHERE id = ?",
        [stripeCustomerId, user.id]
      );
    }

    // Verificar si ya tiene una suscripción activa en Stripe
    const existingSub = await queryOne<{ stripe_subscription_id: string | null }>(
      "SELECT stripe_subscription_id FROM subscriptions WHERE user_id = ? AND status IN ('trial', 'active') AND stripe_subscription_id IS NOT NULL LIMIT 1",
      [user.id]
    );

    if (existingSub?.stripe_subscription_id) {
      // Redirigir al portal para cambiar plan, no crear otra sesión
      return NextResponse.json({
        success: false,
        message: "Ya tienes una suscripción activa. Usa el portal de billing para cambiar de plan.",
      }, { status: 409 });
    }

    // Crear Checkout Session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: String(user.id),
          plan_slug: plan.slug,
          plan_id: String(plan.id),
        },
      },
      success_url: `${appUrl}/es/dashboard/settings?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/es/dashboard/settings?subscription=cancelled`,
      metadata: {
        user_id: String(user.id),
        plan_slug: plan.slug,
        plan_id: String(plan.id),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        checkout_url: session.url,
        session_id: session.id,
      },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ success: false, message: "Error al crear sesión de pago" }, { status: 500 });
  }
}
