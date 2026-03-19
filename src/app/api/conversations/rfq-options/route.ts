import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/conversations/rfq-options?targetCompanyId=123
// - brand: devuelve sus proyectos activos para ofrecer a un fabricante
// - manufacturer: devuelve proyectos activos de la marca destino para iniciar contacto
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || (!user.companyId && !hasRole(user, "admin"))) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 });
    }

    if (hasRole(user, "admin")) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { searchParams } = new URL(request.url);
    const targetCompanyId = Number(searchParams.get("targetCompanyId"));

    if (!targetCompanyId || Number.isNaN(targetCompanyId)) {
      return NextResponse.json({ success: false, message: "targetCompanyId inválido" }, { status: 400 });
    }

    const isBrand = hasRole(user, "brand");

    const sql = isBrand
      ? `SELECT id, code, title, status, created_at
         FROM rfq_projects
         WHERE brand_company_id = ?
           AND status IN ('draft', 'open', 'evaluating')
         ORDER BY created_at DESC
         LIMIT 30`
      : `SELECT id, code, title, status, created_at
         FROM rfq_projects
         WHERE brand_company_id = ?
           AND status IN ('open', 'evaluating')
         ORDER BY created_at DESC
         LIMIT 30`;

    // En ambos casos el targetCompanyId debe corresponder a la marca de la conversación.
    const brandCompanyId = isBrand ? user.companyId : targetCompanyId;

    const data = await query<Array<{
      id: number;
      code: string;
      title: string;
      status: string;
      created_at: string;
    }>>(sql, [brandCompanyId]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/conversations/rfq-options error:", error);
    return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
  }
}
