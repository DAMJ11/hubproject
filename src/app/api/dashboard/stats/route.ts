import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { queryOne } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (user.role === "admin") {
      const [companies, projects, contracts, revenue] = await Promise.all([
        queryOne<{ count: number }>("SELECT COUNT(*) as count FROM companies WHERE is_active = TRUE"),
        queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rfq_projects WHERE status IN ('open','evaluating')"),
        queryOne<{ count: number }>("SELECT COUNT(*) as count FROM contracts WHERE status IN ('active','in_production')"),
        queryOne<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"),
      ]);

      return NextResponse.json({
        stats: [
          { label: "Empresas Activas", value: companies?.count ?? 0, icon: "Factory" },
          { label: "Proyectos Abiertos", value: projects?.count ?? 0, icon: "FileText" },
          { label: "Contratos Activos", value: contracts?.count ?? 0, icon: "Briefcase" },
          { label: "Ingresos", value: `$${((revenue?.total ?? 0)).toLocaleString("es-CO")}`, icon: "CreditCard" },
        ],
      });
    }

    if (user.role === "brand") {
      const [projects, contracts, messages] = await Promise.all([
        queryOne<{ count: number }>(
          "SELECT COUNT(*) as count FROM rfq_projects rp JOIN companies c ON rp.brand_company_id = c.id JOIN users u ON u.company_id = c.id WHERE u.id = ? AND rp.status IN ('open','evaluating')",
          [user.id]
        ),
        queryOne<{ count: number }>(
          "SELECT COUNT(*) as count FROM contracts ct JOIN companies c ON ct.brand_company_id = c.id JOIN users u ON u.company_id = c.id WHERE u.id = ? AND ct.status IN ('active','in_production')",
          [user.id]
        ),
        queryOne<{ count: number }>(
          "SELECT COUNT(*) as count FROM messages m JOIN conversations cv ON m.conversation_id = cv.id JOIN companies c ON cv.brand_company_id = c.id JOIN users u ON u.company_id = c.id WHERE u.id = ? AND m.is_read = FALSE AND m.sender_user_id != ?",
          [user.id, user.id]
        ),
      ]);

      return NextResponse.json({
        stats: [
          { label: "Proyectos Activos", value: projects?.count ?? 0, icon: "FileText" },
          { label: "Contratos", value: contracts?.count ?? 0, icon: "Briefcase" },
          { label: "Mensajes", value: messages?.count ?? 0, icon: "MessageSquare" },
        ],
      });
    }

    // manufacturer
    const [opportunities, proposals, contracts] = await Promise.all([
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rfq_projects WHERE status = 'open'"),
      queryOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM proposals p JOIN companies c ON p.manufacturer_company_id = c.id JOIN users u ON u.company_id = c.id WHERE u.id = ? AND p.status IN ('submitted','shortlisted')",
        [user.id]
      ),
      queryOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM contracts ct JOIN companies c ON ct.manufacturer_company_id = c.id JOIN users u ON u.company_id = c.id WHERE u.id = ? AND ct.status IN ('active','in_production')",
        [user.id]
      ),
    ]);

    return NextResponse.json({
      stats: [
        { label: "Oportunidades", value: opportunities?.count ?? 0, icon: "Leaf" },
        { label: "Propuestas Activas", value: proposals?.count ?? 0, icon: "Send" },
        { label: "Contratos", value: contracts?.count ?? 0, icon: "Briefcase" },
      ],
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
