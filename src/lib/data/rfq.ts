import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface RFQItem {
  id: number;
  code: string;
  title: string;
  category_name: string;
  quantity: number;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: string;
  proposals_count: number;
  sustainability_priority: boolean;
  brand_name: string;
  brand_city: string;
  created_at: string;
}

export async function getRfqList(status?: string): Promise<RFQItem[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  let fromWhere = `FROM rfq_projects r
    JOIN companies c ON r.brand_company_id = c.id
    JOIN service_categories sc ON r.category_id = sc.id
    WHERE 1=1`;
  const params: (string | number)[] = [];

  if (user.role === "brand" && user.companyId) {
    fromWhere += ` AND r.brand_company_id = ?`;
    params.push(user.companyId);
  } else if (user.role !== "admin" && user.role !== "super_admin") {
    return [];
  }

  if (status && ["draft", "open", "evaluating", "awarded", "cancelled", "expired"].includes(status)) {
    fromWhere += ` AND r.status = ?`;
    params.push(status);
  }

  const sql = `SELECT r.id, r.code, r.title, sc.name as category_name, r.quantity,
       r.budget_min, r.budget_max, r.deadline, r.status, r.proposals_count,
       r.sustainability_priority, c.name as brand_name, c.city as brand_city, r.created_at
     ${fromWhere}
     ORDER BY r.created_at DESC`;

  return query<RFQItem[]>(sql, params);
}
