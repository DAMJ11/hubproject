import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

interface SubscriptionPlan {
  id: number;
  slug: string;
  name: string;
  target_role: string;
  price_usd: number;
  stripe_price_id: string | null;
  max_active_projects: number;
  priority_matching: boolean;
  verified_badge: boolean;
  production_tracking: boolean;
  dedicated_support: boolean;
}

interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  cancelled_at: string | null;
  plan_slug: string;
  plan_name: string;
  price_usd: number;
  max_active_projects: number;
  priority_matching: boolean;
  verified_badge: boolean;
  production_tracking: boolean;
  dedicated_support: boolean;
}

// GET /api/subscriptions — get current user subscription + all plans
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const plans = await query<SubscriptionPlan[]>(
    "SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY price_usd ASC"
  );

  const subscription = await queryOne<Subscription>(
    `SELECT s.*, s.stripe_subscription_id, sp.slug as plan_slug, sp.name as plan_name, sp.price_usd,
            sp.max_active_projects, sp.priority_matching, sp.verified_badge,
            sp.production_tracking, sp.dedicated_support
     FROM subscriptions s
     JOIN subscription_plans sp ON s.plan_id = sp.id
     WHERE s.user_id = ?
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [user.id]
  );

  return NextResponse.json({
    success: true,
    data: { plans, subscription },
  });
}

/**
 * POST /api/subscriptions
 * - Planes gratuitos: se activan directamente sin Stripe.
 * - Planes de pago: redirige a POST /api/stripe/checkout para crear Checkout Session.
 *   Este endpoint retorna { redirect: "/api/stripe/checkout" } para guiar al frontend.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { plan_slug } = body as { plan_slug: string };

  if (!plan_slug) {
    return NextResponse.json({ success: false, message: "plan_slug requerido" }, { status: 400 });
  }

  const plan = await queryOne<SubscriptionPlan>(
    "SELECT * FROM subscription_plans WHERE slug = ? AND is_active = TRUE",
    [plan_slug]
  );

  if (!plan) {
    return NextResponse.json({ success: false, message: "Plan no encontrado" }, { status: 404 });
  }

  // Validar rol
  if (
    (user.role === "brand" && !plan.slug.startsWith("brand_")) ||
    (user.role === "manufacturer" && !plan.slug.startsWith("supplier_"))
  ) {
    return NextResponse.json({ success: false, message: "Plan no disponible para tu rol" }, { status: 403 });
  }

  // Planes de pago → redirigir a Stripe Checkout
  if (plan.price_usd > 0) {
    return NextResponse.json({
      success: true,
      message: "Usa Stripe Checkout para planes de pago",
      data: {
        requires_checkout: true,
        checkout_endpoint: "/api/stripe/checkout",
        plan_slug: plan.slug,
      },
    });
  }

  // Plan gratuito — activar directamente
  const existing = await queryOne<{ id: number; status: string }>(
    "SELECT id, status FROM subscriptions WHERE user_id = ? AND status IN ('trial', 'active') LIMIT 1",
    [user.id]
  );

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  if (existing) {
    await query(
      `UPDATE subscriptions SET plan_id = ?, status = 'active', trial_ends_at = NULL,
       current_period_start = ?, current_period_end = ?, cancelled_at = NULL, updated_at = NOW()
       WHERE id = ?`,
      [plan.id, now.toISOString(), periodEnd.toISOString(), existing.id]
    );
  } else {
    await query(
      `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
       VALUES (?, ?, 'active', ?, ?)`,
      [user.id, plan.id, now.toISOString(), periodEnd.toISOString()]
    );
  }

  return NextResponse.json({
    success: true,
    message: "Plan gratuito activado",
    data: { status: "active", current_period_end: periodEnd.toISOString() },
  });
}
