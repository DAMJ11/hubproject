import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface OpportunityItem {
  id: number;
  code: string;
  title: string;
  description: string;
  category_name: string;
  quantity: number;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  proposals_deadline: string | null;
  proposals_count: number;
  sustainability_priority: boolean;
  created_at: string;
}

export async function getOpportunities(): Promise<OpportunityItem[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  let fromWhereSql = `FROM rfq_projects r
    JOIN companies c ON r.brand_company_id = c.id
    JOIN service_categories sc ON r.category_id = sc.id
    WHERE r.status = 'open'`;
  const params: (string | number)[] = [];

  if (user.role === "manufacturer" && user.companyId) {
    fromWhereSql += `
      AND (
        EXISTS (
          SELECT 1 FROM manufacturer_capabilities mc
          WHERE mc.company_id = ? AND mc.is_active = TRUE
            AND mc.category_id = r.category_id
            AND (mc.min_order_qty IS NULL OR r.quantity >= mc.min_order_qty)
            AND (mc.max_monthly_capacity IS NULL OR r.quantity <= mc.max_monthly_capacity)
        )
        OR EXISTS (
          SELECT 1 FROM proposals p
          WHERE p.rfq_id = r.id AND p.manufacturer_company_id = ?
        )
      )`;
    params.push(user.companyId, user.companyId);
  }

  const sql = `SELECT r.id, r.code, r.title, r.description, sc.name as category_name, r.quantity,
       r.budget_min, r.budget_max, r.deadline, r.proposals_deadline,
       r.proposals_count, r.sustainability_priority, r.created_at
     ${fromWhereSql}
     ORDER BY r.created_at DESC LIMIT 20`;

  return query<OpportunityItem[]>(sql, params);
}
