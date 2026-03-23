import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

// DELETE /api/payment-methods/[id] — remove a payment method
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const methodId = parseInt(id, 10);
  if (isNaN(methodId)) {
    return NextResponse.json({ success: false, message: "ID invalido" }, { status: 400 });
  }

  const method = await queryOne<{ id: number; user_id: number }>(
    "SELECT id, user_id FROM user_payment_methods WHERE id = ?",
    [methodId]
  );

  if (!method || method.user_id !== user.id) {
    return NextResponse.json({ success: false, message: "Metodo de pago no encontrado" }, { status: 404 });
  }

  // Check if user has active trial/subscription that requires payment method
  const activeSub = await queryOne<{ id: number; status: string }>(
    `SELECT s.id, s.status FROM subscriptions s
     JOIN subscription_plans sp ON s.plan_id = sp.id
     WHERE s.user_id = ? AND s.status IN ('trial', 'active') AND sp.price_usd > 0
     LIMIT 1`,
    [user.id]
  );

  const methodCount = await query<{ cnt: number }[]>(
    "SELECT COUNT(*) as cnt FROM user_payment_methods WHERE user_id = ?",
    [user.id]
  );

  if (activeSub && Array.isArray(methodCount) && methodCount[0]?.cnt <= 1) {
    return NextResponse.json({
      success: false,
      message: "No puedes eliminar tu unico metodo de pago con una suscripcion activa",
    }, { status: 400 });
  }

  await query("DELETE FROM user_payment_methods WHERE id = ?", [methodId]);

  return NextResponse.json({ success: true, message: "Metodo de pago eliminado" });
}
