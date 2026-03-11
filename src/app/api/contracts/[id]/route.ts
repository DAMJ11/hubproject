import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/contracts/[id] - Detalle de contrato con milestones
export async function GET(
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
    const contractId = Number(id);

    const contract = await queryOne(
      `SELECT ct.*, r.title as rfq_title, r.code as rfq_code,
              bc.name as brand_name, mc.name as manufacturer_name
       FROM contracts ct
       JOIN rfq_projects r ON ct.rfq_id = r.id
       JOIN companies bc ON ct.brand_company_id = bc.id
       JOIN companies mc ON ct.manufacturer_company_id = mc.id
       WHERE ct.id = ?`,
      [contractId]
    );

    if (!contract) {
      return NextResponse.json({ success: false, message: "Contract not found" }, { status: 404 });
    }

    const c = contract as Record<string, unknown>;

    // Verificar acceso
    if (!hasRole(user, "admin") && c.brand_company_id !== user.companyId && c.manufacturer_company_id !== user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const milestones = await query(
      `SELECT * FROM contract_milestones WHERE contract_id = ? ORDER BY sort_order`,
      [contractId]
    );

    return NextResponse.json({
      success: true,
      data: { ...c, milestones },
    });
  } catch (error) {
    console.error("GET /api/contracts/[id] error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT /api/contracts/[id] - Actualizar estado de contrato
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
    const contractId = Number(id);
    const body = await request.json();

    const contract = await queryOne<{ brand_company_id: number; manufacturer_company_id: number }>(
      `SELECT brand_company_id, manufacturer_company_id FROM contracts WHERE id = ?`,
      [contractId]
    );
    if (!contract) {
      return NextResponse.json({ success: false, message: "Contract not found" }, { status: 404 });
    }

    if (!hasRole(user, "admin") && contract.brand_company_id !== user.companyId && contract.manufacturer_company_id !== user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // Actualizar milestone si se indica
    if (body.milestoneId && body.milestoneStatus) {
      const sets = [`status = ?`];
      const params_q: (string | number | null)[] = [body.milestoneStatus];

      if (body.milestoneStatus === "completed") {
        sets.push(`completed_at = NOW()`);
      }
      if (body.milestonePaymentStatus) {
        sets.push(`payment_status = ?`);
        params_q.push(body.milestonePaymentStatus);
      }

      params_q.push(body.milestoneId, contractId);
      await query(
        `UPDATE contract_milestones SET ${sets.join(", ")} WHERE id = ? AND contract_id = ?`,
        params_q
      );

      // Si todos los milestones están completados, completar contrato
      const pending = await queryOne<{ c: number }>(
        `SELECT COUNT(*) as c FROM contract_milestones WHERE contract_id = ? AND status NOT IN ('completed', 'skipped')`,
        [contractId]
      );
      if (pending && pending.c === 0) {
        await query(
          `UPDATE contracts SET status = 'completed', actual_end_date = CURDATE(), updated_at = NOW() WHERE id = ?`,
          [contractId]
        );
      }

      return NextResponse.json({ success: true, message: "Milestone updated" });
    }

    // Actualizar status del contrato directamente
    if (body.status) {
      await query(
        `UPDATE contracts SET status = ?, updated_at = NOW() WHERE id = ?`,
        [body.status, contractId]
      );
      return NextResponse.json({ success: true, message: "Contract updated" });
    }

    return NextResponse.json({ success: false, message: "No changes specified" }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/contracts/[id] error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
