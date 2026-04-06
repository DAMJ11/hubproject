import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/setup
 * Creates a Stripe Checkout Session in "setup" mode so manufacturers
 * can add a payment method without being charged.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    if (user.role !== "manufacturer") {
      return NextResponse.json({ success: false, message: "Solo para manufacturers" }, { status: 403 });
    }

    // Get or create Stripe Customer
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
        metadata: {
          user_id: String(userData.id),
          role: "manufacturer",
        },
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
      mode: "setup",
      payment_method_types: ["card"],
      success_url: `${appUrl}/dashboard/setup-payment?success=true`,
      cancel_url: `${appUrl}/dashboard/setup-payment?cancelled=true`,
      metadata: {
        user_id: String(user.id),
        purpose: "manufacturer_onboarding",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        checkout_url: session.url,
      },
    });
  } catch (error) {
    console.error("Stripe setup error:", error);
    return NextResponse.json({ success: false, message: "Error al crear sesión de setup" }, { status: 500 });
  }
}
