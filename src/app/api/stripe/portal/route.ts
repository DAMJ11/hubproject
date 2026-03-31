import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/portal
 * Crea una sesión del Customer Portal de Stripe.
 * Permite al usuario gestionar su suscripción, métodos de pago y facturas.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    // Obtener stripe_customer_id del usuario
    const userData = await queryOne<{ stripe_customer_id: string | null }>(
      "SELECT stripe_customer_id FROM users WHERE id = ?",
      [user.id]
    );

    if (!userData?.stripe_customer_id) {
      return NextResponse.json({
        success: false,
        message: "No tienes una cuenta de facturación. Suscríbete a un plan primero.",
      }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${appUrl}/es/dashboard/settings`,
    });

    return NextResponse.json({
      success: true,
      data: { portal_url: portalSession.url },
    });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json({ success: false, message: "Error al crear portal de facturación" }, { status: 500 });
  }
}
