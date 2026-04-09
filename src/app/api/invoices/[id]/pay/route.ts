import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { createNotificationBulk } from "@/lib/notifications";

// POST /api/invoices/[id]/pay — Create Stripe Payment Intent for approved invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const invoiceId = Number(id);

    const invoice = await queryOne<{
      id: number; status: string; total: number; currency: string;
      contract_id: number; code: string; stripe_payment_intent_id: string | null;
      conversation_id: number | null;
    }>(
      `SELECT id, status, total, currency, contract_id, code, stripe_payment_intent_id, conversation_id
       FROM invoices WHERE id = ?`,
      [invoiceId]
    );
    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status !== "approved") {
      return NextResponse.json({ success: false, message: "Invoice must be approved before payment" }, { status: 400 });
    }

    // Only the brand (payer) can initiate payment
    const contract = await queryOne<{
      brand_company_id: number; manufacturer_company_id: number; code: string;
    }>(
      `SELECT brand_company_id, manufacturer_company_id, code FROM contracts WHERE id = ?`,
      [invoice.contract_id]
    );
    if (!contract) {
      return NextResponse.json({ success: false, message: "Contract not found" }, { status: 404 });
    }

    if (user.companyId !== contract.brand_company_id && !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Only the brand can pay" }, { status: 403 });
    }

    // If already has a payment intent, return it
    if (invoice.stripe_payment_intent_id) {
      const existing = await stripe.paymentIntents.retrieve(invoice.stripe_payment_intent_id);
      if (existing.status !== "canceled") {
        return NextResponse.json({
          success: true,
          data: { clientSecret: existing.client_secret, paymentIntentId: existing.id },
        });
      }
    }

    // Create new payment intent
    const amountInCents = Math.round(Number(invoice.total) * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: invoice.currency.toLowerCase(),
      metadata: {
        invoice_id: String(invoice.id),
        invoice_code: invoice.code,
        contract_id: String(invoice.contract_id),
        contract_code: contract.code,
        brand_company_id: String(contract.brand_company_id),
        manufacturer_company_id: String(contract.manufacturer_company_id),
      },
      description: `Payment for invoice ${invoice.code} — contract ${contract.code}`,
    });

    // Update invoice with payment intent ID and set to processing
    await query(
      `UPDATE invoices SET stripe_payment_intent_id = ?, status = 'payment_processing', updated_at = NOW() WHERE id = ?`,
      [paymentIntent.id, invoiceId]
    );

    // System message in conversation
    if (invoice.conversation_id) {
      await query(
        `INSERT INTO messages (conversation_id, sender_user_id, content, message_type, metadata)
         VALUES (?, ?, ?, 'invoice', ?)`,
        [invoice.conversation_id, user.id,
          `Payment initiated for invoice ${invoice.code}. Amount: ${invoice.total} ${invoice.currency}`,
          JSON.stringify({ invoiceId: invoice.id, action: "payment_initiated", status: "payment_processing" })]
      );
      await query(`UPDATE conversations SET last_message_at = NOW() WHERE id = ?`, [invoice.conversation_id]);
    }

    return NextResponse.json({
      success: true,
      data: { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id },
    });
  } catch (error) {
    console.error("POST /api/invoices/[id]/pay error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
