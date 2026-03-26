import { getCurrentUser, type JWTPayload } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export interface StatItem {
  label: string;
  value: string | number;
  icon: string;
}

export interface ProjectItem {
  id: number;
  code: string;
  title: string;
  status: string;
  quantity: number;
  budget_max: number;
  proposals_count: number;
  created_at: string;
  brand_name: string;
  category_name: string;
}

export interface DashboardData {
  user: JWTPayload;
  stats: StatItem[];
  projects: ProjectItem[];
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [stats, projects] = await Promise.all([
    getStatsForRole(user),
    getRecentProjects(user),
  ]);

  return { user, stats, projects };
}

async function getStatsForRole(user: JWTPayload): Promise<StatItem[]> {
  if (user.role === "admin") {
    const [companies, projects, contracts, revenue] = await Promise.all([
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM companies WHERE is_active = TRUE"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM rfq_projects WHERE status IN ('open','evaluating')"),
      queryOne<{ count: number }>("SELECT COUNT(*) as count FROM contracts WHERE status IN ('active','in_production')"),
      queryOne<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"),
    ]);

    return [
      { label: "Empresas Activas", value: companies?.count ?? 0, icon: "Factory" },
      { label: "Proyectos Abiertos", value: projects?.count ?? 0, icon: "FileText" },
      { label: "Contratos Activos", value: contracts?.count ?? 0, icon: "Briefcase" },
      { label: "Ingresos", value: `$${((revenue?.total ?? 0)).toLocaleString("es-CO")}`, icon: "CreditCard" },
    ];
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

    return [
      { label: "Proyectos Activos", value: projects?.count ?? 0, icon: "FileText" },
      { label: "Contratos", value: contracts?.count ?? 0, icon: "Briefcase" },
      { label: "Mensajes", value: messages?.count ?? 0, icon: "MessageSquare" },
    ];
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

  return [
    { label: "Oportunidades", value: opportunities?.count ?? 0, icon: "Leaf" },
    { label: "Propuestas Activas", value: proposals?.count ?? 0, icon: "Send" },
    { label: "Contratos", value: contracts?.count ?? 0, icon: "Briefcase" },
  ];
}

async function getRecentProjects(user: JWTPayload): Promise<ProjectItem[]> {
  let fromWhereSql = `FROM rfq_projects r
    JOIN companies c ON r.brand_company_id = c.id
    JOIN service_categories sc ON r.category_id = sc.id
    WHERE 1=1`;
  const params: (string | number)[] = [];

  if (user.role === "brand") {
    if (!user.companyId) return [];
    fromWhereSql += ` AND r.brand_company_id = ?`;
    params.push(user.companyId);
  } else if (user.role === "manufacturer") {
    if (!user.companyId) return [];
    fromWhereSql += `
      AND (
        (r.status = 'open'
         AND EXISTS (
           SELECT 1 FROM manufacturer_capabilities mc
           WHERE mc.company_id = ? AND mc.is_active = TRUE
             AND mc.category_id = r.category_id
             AND (mc.min_order_qty IS NULL OR r.quantity >= mc.min_order_qty)
             AND (mc.max_monthly_capacity IS NULL OR r.quantity <= mc.max_monthly_capacity)
         ))
        OR EXISTS (
          SELECT 1 FROM proposals p
          WHERE p.rfq_id = r.id AND p.manufacturer_company_id = ?
        )
      )`;
    params.push(user.companyId, user.companyId);
  }

  const sql = `SELECT r.id, r.code, r.title, sc.name as category_name, r.quantity,
       r.budget_min, r.budget_max, r.deadline, r.proposals_deadline,
       r.status, r.proposals_count, r.sustainability_priority,
       c.name as brand_name, c.city as brand_city, r.created_at
     ${fromWhereSql}
     ORDER BY r.created_at DESC LIMIT 4`;

  return query<ProjectItem[]>(sql, params);
}
