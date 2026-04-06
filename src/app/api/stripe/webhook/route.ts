import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanSlugFromPriceId } from "@/lib/stripe";
import { query, queryOne } from "@/lib/db";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * Recibe eventos de Stripe y actualiza la BD local.
 *
 * Eventos manejados:
 * - checkout.session.completed → crear suscripción local
 * - customer.subscription.updated → actualizar estado
 * - customer.subscription.deleted → marcar cancelada
 * - invoice.paid → registrar factura
 * - invoice.payment_failed → marcar pago fallido
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        // Evento no manejado — ignorar silenciosamente
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    // Retornar 200 para que Stripe no reintente (el error está de nuestro lado)
    return NextResponse.json({ received: true, error: "Handler error" });
  }
}

// =============================================
// Handlers de eventos
// =============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // ── Pago único: Strategy Call ──────────────────────────────────────────
  if (session.mode === "payment" && session.metadata?.purchase_type === "strategy_call") {
    const userId = session.metadata?.user_id;
    if (!userId) return;
    const stripeCustomerId = session.customer as string;

    await query(
      "UPDATE users SET stripe_customer_id = COALESCE(stripe_customer_id, ?), updated_at = NOW() WHERE id = ?",
      [stripeCustomerId, parseInt(userId, 10)]
    );

    // Insertar o actualizar compra
    await query(
      `INSERT INTO strategy_call_purchases (user_id, stripe_session_id, status, amount_usd)
       VALUES (?, ?, 'paid', 150.00)
       ON DUPLICATE KEY UPDATE status = 'paid', updated_at = NOW()`,
      [parseInt(userId, 10), session.id]
    );

    return;
  }

  // ── Setup mode: manufacturer payment method onboarding ──────────────
  if (session.mode === "setup") {
    const userId = session.metadata?.user_id;
    if (!userId) return;

    const stripeCustomerId = session.customer as string;

    await query(
      "UPDATE users SET stripe_customer_id = COALESCE(stripe_customer_id, ?), updated_at = NOW() WHERE id = ?",
      [stripeCustomerId, parseInt(userId, 10)]
    );

    // Retrieve the SetupIntent to get the payment method
    const setupIntentId = session.setup_intent as string;
    if (setupIntentId) {
      const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      const pmId = typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id;

      if (pmId) {
        await syncPaymentMethod(parseInt(userId, 10), pmId);

        // Set as default payment method on the Stripe Customer
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: { default_payment_method: pmId },
        });
      }
    }

    return;
  }

  // ── Suscripción (flujo original) ──────────────────────────────────────
  if (session.mode !== "subscription") return;

  const userId = session.metadata?.user_id;
  const planSlug = session.metadata?.plan_slug;
  const planIdStr = session.metadata?.plan_id;
  const stripeSubscriptionId = session.subscription as string;
  const stripeCustomerId = session.customer as string;

  if (!userId || !planSlug || !planIdStr || !stripeSubscriptionId) {
    console.error("Checkout session missing metadata:", session.id);
    return;
  }

  const planId = parseInt(planIdStr, 10);

  // Actualizar stripe_customer_id si no estaba guardado
  await query(
    "UPDATE users SET stripe_customer_id = COALESCE(stripe_customer_id, ?), updated_at = NOW() WHERE id = ?",
    [stripeCustomerId, parseInt(userId, 10)]
  );

  // Obtener detalles de la suscripción de Stripe
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  const status = mapStripeStatus(stripeSub.status);
  const trialEnd = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : null;
  const firstItem = stripeSub.items.data[0];
  const periodStart = firstItem ? new Date(firstItem.current_period_start * 1000).toISOString() : new Date().toISOString();
  const periodEnd = firstItem ? new Date(firstItem.current_period_end * 1000).toISOString() : new Date().toISOString();

  // Cancelar suscripciones locales previas
  await query(
    "UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE user_id = ? AND status IN ('trial', 'active')",
    [parseInt(userId, 10)]
  );

  // Crear nueva suscripción local
  await query(
    `INSERT INTO subscriptions (user_id, plan_id, status, stripe_subscription_id, trial_ends_at, current_period_start, current_period_end)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [parseInt(userId, 10), planId, status, stripeSubscriptionId, trialEnd, periodStart, periodEnd]
  );

  // Guardar método de pago del checkout
  if (stripeSub.default_payment_method) {
    const pmId = typeof stripeSub.default_payment_method === "string"
      ? stripeSub.default_payment_method
      : stripeSub.default_payment_method.id;

    await syncPaymentMethod(parseInt(userId, 10), pmId);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeSubId = subscription.id;
  const status = mapStripeStatus(subscription.status);
  const firstItem = subscription.items.data[0];
  const periodStart = firstItem ? new Date(firstItem.current_period_start * 1000).toISOString() : new Date().toISOString();
  const periodEnd = firstItem ? new Date(firstItem.current_period_end * 1000).toISOString() : new Date().toISOString();
  const cancelledAt = subscription.canceled_at
    ? new Date(subscription.canceled_at * 1000).toISOString()
    : null;

  // Detectar cambio de plan
  const priceId = subscription.items.data[0]?.price.id;
  let planUpdate = "";
  const params: (string | number | null)[] = [status, periodStart, periodEnd, cancelledAt];

  if (priceId) {
    const planSlug = getPlanSlugFromPriceId(priceId);
    if (planSlug) {
      const plan = await queryOne<{ id: number }>(
        "SELECT id FROM subscription_plans WHERE slug = ?",
        [planSlug]
      );
      if (plan) {
        planUpdate = ", plan_id = ?";
        params.push(plan.id);
      }
    }
  }

  params.push(stripeSubId);

  await query(
    `UPDATE subscriptions SET status = ?, current_period_start = ?, current_period_end = ?,
     cancelled_at = ?, updated_at = NOW()${planUpdate}
     WHERE stripe_subscription_id = ?`,
    params
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await query(
    "UPDATE subscriptions SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE stripe_subscription_id = ?",
    [subscription.id]
  );
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const stripeSubId = typeof invoice.parent?.subscription_details?.subscription === "string"
    ? invoice.parent.subscription_details.subscription
    : invoice.parent?.subscription_details?.subscription?.id ?? null;
  if (!stripeSubId) return;

  const localSub = await queryOne<{ id: number }>(
    "SELECT id FROM subscriptions WHERE stripe_subscription_id = ?",
    [stripeSubId]
  );

  if (!localSub) return;

  // Evitar duplicados
  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM subscription_invoices WHERE stripe_invoice_id = ?",
    [invoice.id]
  );

  if (existing) return;

  const amount = (invoice.amount_paid || 0) / 100; // Stripe usa centavos
  const currency = (invoice.currency || "usd").toUpperCase();

  await query(
    `INSERT INTO subscription_invoices (subscription_id, stripe_invoice_id, amount, currency, status, description, paid_at)
     VALUES (?, ?, ?, ?, 'completed', ?, NOW())`,
    [localSub.id, invoice.id, amount, currency, invoice.description || "Pago de suscripción"]
  );
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const stripeSubId = typeof invoice.parent?.subscription_details?.subscription === "string"
    ? invoice.parent.subscription_details.subscription
    : invoice.parent?.subscription_details?.subscription?.id ?? null;
  if (!stripeSubId) return;

  // Marcar suscripción como past_due
  await query(
    "UPDATE subscriptions SET status = 'past_due', updated_at = NOW() WHERE stripe_subscription_id = ?",
    [stripeSubId]
  );

  const localSub = await queryOne<{ id: number }>(
    "SELECT id FROM subscriptions WHERE stripe_subscription_id = ?",
    [stripeSubId]
  );

  if (!localSub) return;

  const amount = (invoice.amount_due || 0) / 100;
  const currency = (invoice.currency || "usd").toUpperCase();

  // Registrar intento fallido
  const existing = await queryOne<{ id: number }>(
    "SELECT id FROM subscription_invoices WHERE stripe_invoice_id = ?",
    [invoice.id]
  );

  if (existing) {
    await query(
      "UPDATE subscription_invoices SET status = 'failed' WHERE stripe_invoice_id = ?",
      [invoice.id]
    );
  } else {
    await query(
      `INSERT INTO subscription_invoices (subscription_id, stripe_invoice_id, amount, currency, status, description)
       VALUES (?, ?, ?, ?, 'failed', ?)`,
      [localSub.id, invoice.id, amount, currency, "Pago fallido"]
    );
  }
}

// =============================================
// Helpers
// =============================================

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  const statusMap: Record<string, string> = {
    trialing: "trial",
    active: "active",
    past_due: "past_due",
    canceled: "cancelled",
    unpaid: "past_due",
    incomplete: "past_due",
    incomplete_expired: "expired",
    paused: "cancelled",
  };
  return statusMap[stripeStatus] || "active";
}

async function syncPaymentMethod(userId: number, stripePaymentMethodId: string) {
  try {
    const pm = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

    if (pm.type !== "card" || !pm.card) return;

    // Verificar si ya existe
    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM user_payment_methods WHERE stripe_payment_method_id = ?",
      [stripePaymentMethodId]
    );

    if (existing) return;

    // Marcar todos los existentes como no-default
    await query(
      "UPDATE user_payment_methods SET is_default = FALSE WHERE user_id = ?",
      [userId]
    );

    await query(
      `INSERT INTO user_payment_methods (user_id, stripe_payment_method_id, type, last_four, brand, is_default, expires_at)
       VALUES (?, ?, 'card', ?, ?, TRUE, ?)`,
      [
        userId,
        stripePaymentMethodId,
        pm.card.last4,
        pm.card.brand || "Card",
        pm.card.exp_year && pm.card.exp_month
          ? `${pm.card.exp_year}-${String(pm.card.exp_month).padStart(2, "0")}-01`
          : null,
      ]
    );
  } catch (err) {
    console.error("Error syncing payment method:", err);
  }
}
