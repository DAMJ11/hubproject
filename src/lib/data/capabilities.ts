import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface CapabilityItem {
  id: number;
  company_id: number;
  category_id: number;
  category_name: string;
  min_order_qty: number;
  max_monthly_capacity: number | null;
  lead_time_days: number | null;
  description: string | null;
  unit_price_from: number | null;
  wholesale_price_from: number | null;
  commercial_notes: string | null;
  is_active: boolean;
}

export interface CategoryItem {
  id: number;
  name: string;
}

export async function getCapabilitiesWithCategories(): Promise<{
  capabilities: CapabilityItem[];
  categories: CategoryItem[];
} | null> {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return null;

  const [capabilities, categories] = await Promise.all([
    query<CapabilityItem[]>(
      `SELECT mc.id, mc.company_id, mc.category_id, sc.name as category_name,
              mc.min_order_qty, mc.max_monthly_capacity, mc.lead_time_days,
              mc.description, mc.is_active
       FROM manufacturer_capabilities mc
       JOIN service_categories sc ON mc.category_id = sc.id
       WHERE mc.company_id = ?
       ORDER BY sc.name`,
      [user.companyId]
    ),
    query<CategoryItem[]>(
      `SELECT id, name FROM service_categories WHERE is_active = TRUE ORDER BY sort_order, name`
    ),
  ]);

  return {
    capabilities: capabilities || [],
    categories: categories || [],
  };
}
