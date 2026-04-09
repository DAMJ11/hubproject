import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pool from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { createNotificationBulk } from "@/lib/notifications";

// POST /api/admin/rfq/[id]/assign — Super admin assigns project directly to a manufacturer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const rfqId = Number(id);
    if (!Number.isFinite(rfqId)) {
      return NextResponse.json({ success: false, message: "Invalid RFQ ID" }, { status: 400 });
    }

    const body = await request.json();
    const { manufacturerCompanyId, totalAmount, terms } = body;

    if (!manufacturerCompanyId || !Number.isFinite(Number(manufacturerCompanyId))) {
      return NextResponse.json({ success: false, message: "manufacturerCompanyId is required" }, { status: 400 });
    }
    if (!totalAmount || Number(totalAmount) <= 0) {
      return NextResponse.json({ success: false, message: "totalAmount must be positive" }, { status: 400 });
    }

    // Verify RFQ exists and is in assignable status
    const rfq = await queryOne<{ id: number; brand_company_id: number; status: string; title: string; code: string; currency: string }>(
      `SELECT id, brand_company_id, status, title, code, currency FROM rfq_projects WHERE id = ?`,
      [rfqId]
    );
    if (!rfq) {
      return NextResponse.json({ success: false, message: "RFQ not found" }, { status: 404 });
    }
    if (["awarded", "cancelled", "expired"].includes(rfq.status)) {
      return NextResponse.json({ success: false, message: "RFQ cannot be assigned in current status" }, { status: 400 });
    }

    // Verify manufacturer company
    const manufacturer = await queryOne<{ id: number; type: string; name: string }>(
      `SELECT id, type, name FROM companies WHERE id = ? AND is_active = TRUE`,
      [Number(manufacturerCompanyId)]
    );
    if (!manufacturer || manufacturer.type !== "manufacturer") {
      return NextResponse.json({ success: false, message: "Manufacturer company not found" }, { status: 404 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Generate contract code
      const [countResult] = await connection.execute(`SELECT COUNT(*) as c FROM contracts`);
      const count = (countResult as { c: number }[])[0].c + 1;
      const contractCode = `CTR-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;

      // Create contract directly (no proposal)
      const [contractResult] = await connection.execute(
        `INSERT INTO contracts (code, rfq_id, proposal_id, brand_company_id, manufacturer_company_id,
          total_amount, currency, status, terms, start_date, created_at, updated_at)
         VALUES (?, ?, NULL, ?, ?, ?, ?, 'active', ?, CURDATE(), NOW(), NOW())`,
        [contractCode, rfqId, rfq.brand_company_id, Number(manufacturerCompanyId),
          Number(totalAmount), rfq.currency, terms || null]
      );
      const contractId = (contractResult as { insertId: number }).insertId;

      // Create default milestones
      const milestones = [
        { title: "Design Approval", sort: 1 },
        { title: "Sample Production", sort: 2 },
        { title: "Sample Review", sort: 3 },
        { title: "Full Production", sort: 4 },
        { title: "Delivery & Final Review", sort: 5 },
      ];
      for (const ms of milestones) {
        await connection.execute(
          `INSERT INTO contract_milestones (contract_id, title, sort_order, status, payment_status) VALUES (?, ?, ?, 'pending', 'na')`,
          [contractId, ms.title, ms.sort]
        );
      }

      // Update RFQ status to awarded
      await connection.execute(
        `UPDATE rfq_projects SET status = 'awarded', updated_at = NOW() WHERE id = ?`,
        [rfqId]
      );

      // Create conversation between brand and manufacturer
      const [convResult] = await connection.execute(
        `INSERT INTO conversations (rfq_id, contract_id, brand_company_id, manufacturer_company_id,
          initiated_by_user_id, subject, status, accepted_at)
         VALUES (?, ?, ?, ?, ?, ?, 'open', NOW())`,
        [rfqId, contractId, rfq.brand_company_id, Number(manufacturerCompanyId),
          user.id, `Project: ${rfq.title} (${rfq.code})`]
      );
      const conversationId = (convResult as { insertId: number }).insertId;

      // System message
      await connection.execute(
        `INSERT INTO messages (conversation_id, sender_user_id, content, message_type)
         VALUES (?, ?, ?, 'system')`,
        [conversationId, user.id,
          `An administrator has assigned this project. Contract ${contractCode} created with total amount ${totalAmount} ${rfq.currency}.`]
      );
      await connection.execute(
        `UPDATE conversations SET last_message_at = NOW() WHERE id = ?`,
        [conversationId]
      );

      await connection.commit();

      // Notify brand and manufacturer users
      const brandUsers = await query<Array<{ id: number }>>(
        `SELECT id FROM users WHERE company_id = ? AND is_active = TRUE`, [rfq.brand_company_id]
      );
      const mfrUsers = await query<Array<{ id: number }>>(
        `SELECT id FROM users WHERE company_id = ? AND is_active = TRUE`, [Number(manufacturerCompanyId)]
      );

      if (brandUsers.length) {
        await createNotificationBulk(
          brandUsers.map((u) => u.id),
          {
            title: "Project assigned",
            message: `Your project "${rfq.title}" has been assigned to ${manufacturer.name}. Contract: ${contractCode}.`,
            type: "contract",
            referenceType: "contract",
            referenceId: contractId,
          }
        );
      }
      if (mfrUsers.length) {
        await createNotificationBulk(
          mfrUsers.map((u) => u.id),
          {
            title: "New project assigned to you",
            message: `An administrator has assigned you the project: "${rfq.title}" (${rfq.code}). Please review the contract details.`,
            type: "contract",
            referenceType: "contract",
            referenceId: contractId,
          }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Project assigned successfully",
        data: { contractId, contractCode, conversationId },
      }, { status: 201 });
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("POST /api/admin/rfq/[id]/assign error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
