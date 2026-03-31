import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

interface PaymentMethodRow {
  id: number;
  user_id: number;
  stripe_payment_method_id: string | null;
  type: string;
  last_four: string;
  brand: string | null;
  is_default: boolean;
  expires_at: string | null;
  created_at: string;
}

// GET /api/payment-methods — list user's payment methods
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const methods = await query<PaymentMethodRow[]>(
    "SELECT id, user_id, type, last_four, brand, is_default, expires_at, created_at FROM user_payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
    [user.id]
  );

  return NextResponse.json({ success: true, data: methods });
}

/**
 * POST /api/payment-methods
 * Los métodos de pago ahora se agregan principalmente a través de Stripe Checkout.
 * Este endpoint se mantiene para compatibilidad pero indica al frontend que use Stripe.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  return NextResponse.json({
    success: false,
    message: "Los métodos de pago se gestionan a través de Stripe. Usa el portal de facturación para agregar o cambiar tu tarjeta.",
    data: { use_stripe_portal: true, portal_endpoint: "/api/stripe/portal" },
  }, { status: 400 });
}
