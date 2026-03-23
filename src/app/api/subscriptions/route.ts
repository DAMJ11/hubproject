import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

interface SubscriptionPlan {
  id: number;
  slug: string;
  name: string;
  target_role: string;
  price_usd: number;
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
    `SELECT s.*, sp.slug as plan_slug, sp.name as plan_name, sp.price_usd,
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

// POST /api/subscriptions — subscribe to a plan (or start trial)
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { plan_slug, start_trial } = body as { plan_slug: string; start_trial?: boolean };

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

  // Validate role matches plan
  if (
    (user.role === "brand" && !plan.slug.startsWith("brand_")) ||
    (user.role === "manufacturer" && !plan.slug.startsWith("supplier_"))
  ) {
    return NextResponse.json({ success: false, message: "Plan no disponible para tu rol" }, { status: 403 });
  }

  // Check if user already has an active subscription
  const existing = await queryOne<{ id: number; status: string }>(
    "SELECT id, status FROM subscriptions WHERE user_id = ? AND status IN ('trial', 'active') LIMIT 1",
    [user.id]
  );

  const now = new Date();
  const periodEnd = new Date(now);

  if (start_trial && plan.price_usd > 0) {
    // 7-day trial
    periodEnd.setDate(periodEnd.getDate() + 7);

    // Check payment method exists
    const paymentMethod = await queryOne<{ id: number }>(
      "SELECT id FROM user_payment_methods WHERE user_id = ? LIMIT 1",
      [user.id]
    );
    if (!paymentMethod) {
      return NextResponse.json({
        success: false,
        message: "Debes agregar un metodo de pago antes de iniciar el trial",
      }, { status: 400 });
    }

    if (existing) {
      // Update existing subscription
      await query(
        `UPDATE subscriptions SET plan_id = ?, status = 'trial', trial_ends_at = ?,
         current_period_start = ?, current_period_end = ?, cancelled_at = NULL, updated_at = NOW()
         WHERE id = ?`,
        [plan.id, periodEnd.toISOString(), now.toISOString(), periodEnd.toISOString(), existing.id]
      );
    } else {
      await query(
        `INSERT INTO subscriptions (user_id, plan_id, status, trial_ends_at, current_period_start, current_period_end)
         VALUES (?, ?, 'trial', ?, ?, ?)`,
        [user.id, plan.id, periodEnd.toISOString(), now.toISOString(), periodEnd.toISOString()]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Trial de 7 dias iniciado",
      data: { status: "trial", trial_ends_at: periodEnd.toISOString() },
    });
  }

  // Regular subscription (immediate charge via fake payment)
  periodEnd.setDate(periodEnd.getDate() + 30);

  if (plan.price_usd > 0) {
    const paymentMethod = await queryOne<{ id: number }>(
      "SELECT id FROM user_payment_methods WHERE user_id = ? LIMIT 1",
      [user.id]
    );
    if (!paymentMethod) {
      return NextResponse.json({
        success: false,
        message: "Debes agregar un metodo de pago",
      }, { status: 400 });
    }
  }

  let subscriptionId: number;

  if (existing) {
    await query(
      `UPDATE subscriptions SET plan_id = ?, status = 'active', trial_ends_at = NULL,
       current_period_start = ?, current_period_end = ?, cancelled_at = NULL, updated_at = NOW()
       WHERE id = ?`,
      [plan.id, now.toISOString(), periodEnd.toISOString(), existing.id]
    );
    subscriptionId = existing.id;
  } else {
    const result = await query<{ insertId: number }>(
      `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
       VALUES (?, ?, 'active', ?, ?)`,
      [user.id, plan.id, now.toISOString(), periodEnd.toISOString()]
    );
    subscriptionId = (result as unknown as { insertId: number }).insertId;
  }

  // Create invoice for paid plans
  if (plan.price_usd > 0) {
    await query(
      `INSERT INTO subscription_invoices (subscription_id, amount, currency, status, description, paid_at)
       VALUES (?, ?, 'USD', 'completed', ?, NOW())`,
      [subscriptionId, plan.price_usd, `${plan.name} - Pago mensual`]
    );
  }

  return NextResponse.json({
    success: true,
    message: plan.price_usd > 0 ? "Suscripcion activada (pago simulado)" : "Plan gratuito activado",
    data: { status: "active", current_period_end: periodEnd.toISOString() },
  });
}
