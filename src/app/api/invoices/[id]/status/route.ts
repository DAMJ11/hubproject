import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { createNotificationBulk } from "@/lib/notifications";

// PATCH /api/invoices/[id]/status — Change invoice status
// Body: { action: "submit" | "approve" | "request_revision" | "cancel", notes?: string }
export async function PATCH(
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
      id: number; status: string; proposed_by: number; contract_id: number;
      code: string; total: number; currency: string; conversation_id: number | null;
    }>(
      `SELECT id, status, proposed_by, contract_id, code, total, currency, conversation_id
       FROM invoices WHERE id = ?`,
      [invoiceId]
    );
    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    const contract = await queryOne<{
      brand_company_id: number; manufacturer_company_id: number; code: string;
    }>(
      `SELECT brand_company_id, manufacturer_company_id, code FROM contracts WHERE id = ?`,
      [invoice.contract_id]
    );
    if (!contract) {
      return NextResponse.json({ success: false, message: "Contract not found" }, { status: 404 });
    }

    const isParticipant = user.companyId === contract.brand_company_id || user.companyId === contract.manufacturer_company_id;
    if (!isParticipant && !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action, notes } = body;

    const validTransitions: Record<string, { from: string[]; to: string }> = {
      submit: { from: ["draft", "revision_requested"], to: "pending_approval" },
      approve: { from: ["pending_approval"], to: "approved" },
      request_revision: { from: ["pending_approval"], to: "revision_requested" },
      cancel: { from: ["draft", "pending_approval", "revision_requested", "approved"], to: "cancelled" },
    };

    const transition = validTransitions[action];
    if (!transition) {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    if (!transition.from.includes(invoice.status)) {
      return NextResponse.json({ success: false, message: `Cannot ${action} invoice in status: ${invoice.status}` }, { status: 400 });
    }

    // approval can only be done by the OTHER party (not the one who proposed)
    if (action === "approve" && invoice.proposed_by === user.id && !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Cannot approve your own invoice" }, { status: 400 });
    }

    await query(
      `UPDATE invoices SET status = ?, notes = COALESCE(?, notes), updated_at = NOW() WHERE id = ?`,
      [transition.to, notes ?? null, invoiceId]
    );

    // Create system message in conversation if linked
    if (invoice.conversation_id) {
      const statusMessages: Record<string, string> = {
        submit: `Invoice ${invoice.code} submitted for approval. Total: ${invoice.total} ${invoice.currency}`,
        approve: `Invoice ${invoice.code} has been approved. Ready for payment.`,
        request_revision: `Revision requested on invoice ${invoice.code}.${notes ? ` Note: ${notes}` : ""}`,
        cancel: `Invoice ${invoice.code} has been cancelled.`,
      };
      await query(
        `INSERT INTO messages (conversation_id, sender_user_id, content, message_type, metadata)
         VALUES (?, ?, ?, 'invoice', ?)`,
        [invoice.conversation_id, user.id, statusMessages[action],
          JSON.stringify({ invoiceId: invoice.id, action, status: transition.to })]
      );
      await query(`UPDATE conversations SET last_message_at = NOW() WHERE id = ?`, [invoice.conversation_id]);
    }

    // Notify the other party
    const otherCompanyId = user.companyId === contract.brand_company_id
      ? contract.manufacturer_company_id
      : contract.brand_company_id;
    const otherUsers = await query<Array<{ id: number }>>(
      `SELECT id FROM users WHERE company_id = ? AND is_active = TRUE`, [otherCompanyId]
    );

    const notifMessages: Record<string, { title: string; message: string; type: "payment" | "contract" }> = {
      submit: { title: "Invoice submitted", message: `New invoice ${invoice.code} for contract ${contract.code} awaiting your approval.`, type: "payment" },
      approve: { title: "Invoice approved", message: `Invoice ${invoice.code} has been approved. Proceed to payment.`, type: "payment" },
      request_revision: { title: "Invoice revision requested", message: `Revision requested on invoice ${invoice.code}.${notes ? ` Reason: ${notes}` : ""}`, type: "payment" },
      cancel: { title: "Invoice cancelled", message: `Invoice ${invoice.code} has been cancelled.`, type: "payment" },
    };

    if (otherUsers.length && notifMessages[action]) {
      const n = notifMessages[action];
      await createNotificationBulk(
        otherUsers.map((u) => u.id),
        { title: n.title, message: n.message, type: n.type, referenceType: "invoice", referenceId: invoice.id }
      );
    }

    return NextResponse.json({ success: true, message: `Invoice ${action} successful`, status: transition.to });
  } catch (error) {
    console.error("PATCH /api/invoices/[id]/status error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
