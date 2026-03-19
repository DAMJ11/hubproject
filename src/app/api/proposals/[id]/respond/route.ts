import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pool from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { proposalRespondSchema } from "@/lib/validations/proposals";

// PUT /api/proposals/[id]/respond - Marca acepta o rechaza propuesta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    const isAdmin = hasRole(user, "admin");
    if (!isAdmin && !user.companyId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const proposalId = Number(id);

    const body = await request.json();
    const parsed = proposalRespondSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "action debe ser 'accept', 'reject' o 'shortlist'" }, { status: 400 });
    }
    const { action } = parsed.data;

    // Verificar propuesta y propiedad del RFQ
    const proposal = await queryOne<{
      id: number;
      rfq_id: number;
      brand_company_id: number;
      manufacturer_company_id: number;
      total_price: number;
      lead_time_days: number;
      status: string;
    }>(
      isAdmin
        ? `SELECT p.id, p.rfq_id, r.brand_company_id, p.manufacturer_company_id, p.total_price, p.lead_time_days, p.status
           FROM proposals p
           JOIN rfq_projects r ON p.rfq_id = r.id
           WHERE p.id = ?`
        : `SELECT p.id, p.rfq_id, r.brand_company_id, p.manufacturer_company_id, p.total_price, p.lead_time_days, p.status
           FROM proposals p
           JOIN rfq_projects r ON p.rfq_id = r.id
           WHERE p.id = ? AND r.brand_company_id = ?`,
      isAdmin ? [proposalId] : [proposalId, user.companyId!]
    );

    if (!proposal) {
      return NextResponse.json({ success: false, message: "Proposal not found or unauthorized" }, { status: 404 });
    }

    const p = proposal;

    // Validar que la propuesta esté en estado válido para responder
    if (action === "accept" || action === "shortlist") {
      if (!['submitted', 'shortlisted'].includes(p.status)) {
        return NextResponse.json({ success: false, message: `No se puede ${action === 'accept' ? 'aceptar' : 'preseleccionar'} una propuesta en estado '${p.status}'` }, { status: 400 });
      }
    }
    if (action === "reject" && !['submitted', 'shortlisted'].includes(p.status)) {
      return NextResponse.json({ success: false, message: `No se puede rechazar una propuesta en estado '${p.status}'` }, { status: 400 });
    }

    // Validar que el RFQ no esté ya adjudicado (prevenir doble adjudicación)
    if (action === "accept") {
      const rfq = await queryOne<{ status: string; awarded_proposal_id: number | null }>(
        `SELECT status, awarded_proposal_id FROM rfq_projects WHERE id = ?`,
        [p.rfq_id]
      );
      if (!rfq || !['open', 'evaluating'].includes(rfq.status)) {
        return NextResponse.json({ success: false, message: `No se puede adjudicar: el RFQ está en estado '${rfq?.status || 'desconocido'}'` }, { status: 400 });
      }
      if (rfq.awarded_proposal_id) {
        return NextResponse.json({ success: false, message: "Este RFQ ya fue adjudicado a otra propuesta" }, { status: 409 });
      }
    }

    if (action === "accept") {
      // Aceptar propuesta → crear contrato → rechazar las demás
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Actualizar propuesta
        await connection.execute(
          `UPDATE proposals SET status = 'accepted', responded_at = NOW(), updated_at = NOW() WHERE id = ?`,
          [proposalId]
        );

        // Rechazar las demás propuestas del mismo RFQ
        await connection.execute(
          `UPDATE proposals SET status = 'rejected', responded_at = NOW(), updated_at = NOW()
           WHERE rfq_id = ? AND id != ? AND status IN ('submitted', 'shortlisted')`,
          [p.rfq_id, proposalId]
        );

        // Marcar RFQ como awarded
        await connection.execute(
          `UPDATE rfq_projects SET status = 'awarded', awarded_proposal_id = ?, updated_at = NOW() WHERE id = ?`,
          [proposalId, p.rfq_id]
        );

        // Generar código de contrato
        const [countResult] = await connection.execute(`SELECT COUNT(*) as c FROM contracts`);
        const count = (countResult as { c: number }[])[0].c + 1;
        const code = `CTR-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;

        // Crear contrato
        const [contractResult] = await connection.execute(
          `INSERT INTO contracts (code, rfq_id, proposal_id, brand_company_id, manufacturer_company_id,
            total_amount, status, start_date, expected_end_date)
           VALUES (?, ?, ?, ?, ?, ?, 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))`,
          [code, p.rfq_id, proposalId, p.brand_company_id, p.manufacturer_company_id,
            p.total_price, p.lead_time_days]
        );
        const contractId = (contractResult as { insertId: number }).insertId;

        // Crear milestones por defecto
        const milestones = [
          { title: "Muestra aprobada", order: 1, pct: 0.20 },
          { title: "Materiales adquiridos", order: 2, pct: 0.15 },
          { title: "50% producción completada", order: 3, pct: 0.25 },
          { title: "Control de calidad", order: 4, pct: 0.10 },
          { title: "Entrega final", order: 5, pct: 0.30 },
        ];
        for (const m of milestones) {
          await connection.execute(
            `INSERT INTO contract_milestones (contract_id, title, sort_order, payment_amount, status, payment_status)
             VALUES (?, ?, ?, ?, 'pending', 'pending')`,
            [contractId, m.title, m.order, Math.round(p.total_price * m.pct)]
          );
        }

        await connection.commit();

        return NextResponse.json({
          success: true,
          message: "Proposal accepted, contract created",
          data: { contractId, contractCode: code },
        });
      } catch (txError) {
        await connection.rollback();
        throw txError;
      } finally {
        connection.release();
      }
    }

    if (action === "reject") {
      await query(
        `UPDATE proposals SET status = 'rejected', responded_at = NOW(), updated_at = NOW() WHERE id = ?`,
        [proposalId]
      );
      return NextResponse.json({ success: true, message: "Proposal rejected" });
    }

    if (action === "shortlist") {
      await query(
        `UPDATE proposals SET status = 'shortlisted', updated_at = NOW() WHERE id = ?`,
        [proposalId]
      );
      return NextResponse.json({ success: true, message: "Proposal shortlisted" });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PUT proposal respond error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
