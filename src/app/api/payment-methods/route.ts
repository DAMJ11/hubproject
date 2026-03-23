import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

interface PaymentMethodRow {
  id: number;
  user_id: number;
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
    "SELECT * FROM user_payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
    [user.id]
  );

  return NextResponse.json({ success: true, data: methods });
}

// POST /api/payment-methods — add a fake payment method
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { card_number, brand, expiry_month, expiry_year } = body as {
    card_number: string;
    brand?: string;
    expiry_month?: number;
    expiry_year?: number;
  };

  if (!card_number || card_number.length < 4) {
    return NextResponse.json({ success: false, message: "Numero de tarjeta invalido" }, { status: 400 });
  }

  // Only store last 4 digits (never store full card number)
  const lastFour = card_number.slice(-4);
  const cardBrand = brand || detectCardBrand(card_number);

  let expiresAt: string | null = null;
  if (expiry_month && expiry_year) {
    expiresAt = `${expiry_year}-${String(expiry_month).padStart(2, "0")}-01`;
  }

  // If this is the first method, make it default
  const existingCount = await query<{ cnt: number }[]>(
    "SELECT COUNT(*) as cnt FROM user_payment_methods WHERE user_id = ?",
    [user.id]
  );
  const isDefault = Array.isArray(existingCount) && existingCount[0]?.cnt === 0;

  await query(
    `INSERT INTO user_payment_methods (user_id, type, last_four, brand, is_default, expires_at)
     VALUES (?, 'card', ?, ?, ?, ?)`,
    [user.id, lastFour, cardBrand, isDefault, expiresAt]
  );

  return NextResponse.json({
    success: true,
    message: "Metodo de pago agregado (simulado)",
    data: { last_four: lastFour, brand: cardBrand, is_default: isDefault },
  });
}

function detectCardBrand(number: string): string {
  const cleaned = number.replace(/\s/g, "");
  if (cleaned.startsWith("4")) return "Visa";
  if (cleaned.startsWith("5")) return "Mastercard";
  if (cleaned.startsWith("3")) return "Amex";
  return "Card";
}
