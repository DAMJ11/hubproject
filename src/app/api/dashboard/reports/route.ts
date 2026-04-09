import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [monthlyData, topManufacturers, rfqByCategory, totals] = await Promise.all([
      query<Array<{
        month: string;
        projects: number;
        revenue: number;
      }>>(
        `SELECT
         DATE_FORMAT(rp.created_at, '%Y-%m') as month,
         COUNT(*) as projects,
         COALESCE(SUM(ct.total_amount), 0) as revenue
         FROM rfq_projects rp
         LEFT JOIN contracts ct ON ct.rfq_id = rp.id
         WHERE rp.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(rp.created_at, '%Y-%m')
         ORDER BY month`
      ),
      query<Array<{
        name: string;
        contracts_count: number;
        revenue: number;
        avg_green_score: number;
      }>>(
        `SELECT c.name,
         COUNT(ct.id) as contracts_count,
         COALESCE(SUM(ct.total_amount), 0) as revenue,
         COALESCE(AVG(p.green_score), 0) as avg_green_score
         FROM companies c
         LEFT JOIN contracts ct ON ct.manufacturer_company_id = c.id
         LEFT JOIN proposals p ON ct.proposal_id = p.id
         WHERE c.type = 'manufacturer' AND c.is_active = TRUE
         GROUP BY c.id
         ORDER BY revenue DESC
         LIMIT 5`
      ),
      query<Array<{
        category: string;
        projects: number;
      }>>(
        `SELECT sc.name as category, COUNT(rp.id) as projects
         FROM rfq_projects rp
         JOIN service_categories sc ON rp.category_id = sc.id
         GROUP BY sc.id
         ORDER BY projects DESC`
      ),
      queryOne<{
        total_projects: number;
        total_revenue: number;
        total_companies: number;
        avg_rating: number;
      }>(
        `SELECT
         (SELECT COUNT(*) FROM rfq_projects) as total_projects,
         (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_revenue,
         (SELECT COUNT(*) FROM companies WHERE is_active = TRUE) as total_companies,
         (SELECT COALESCE(AVG(rating), 0) FROM reviews) as avg_rating`
      ),
    ]);

    return NextResponse.json({ monthlyData, topManufacturers, rfqByCategory, totals });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
