import { getCurrentUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export interface CompanyDetail {
  id: number;
  name: string;
  slug: string;
  type: string;
  legal_id: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  country: string;
  employee_count: string | null;
  founded_year: number | null;
  is_verified: boolean;
}

export async function getCurrentCompany(): Promise<CompanyDetail | null> {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return null;

  return queryOne<CompanyDetail>(
    `SELECT id, name, slug, type, legal_id, description, logo_url, website,
            phone, email, address_line1, city, state, country,
            employee_count, founded_year, is_verified
     FROM companies
     WHERE id = ? AND is_active = TRUE`,
    [user.companyId]
  );
}

export interface CompanyItem {
  id: number;
  name: string;
  slug: string;
  type: "brand" | "manufacturer";
  description: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  country: string;
  is_verified: boolean;
  employee_count: string | null;
  founded_year: number | null;
  created_at: string;
}

export async function getCompanies(type?: string): Promise<CompanyItem[] | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;

  let sql = `SELECT id, name, slug, type, description, logo_url, city, state, country,
             is_verified, employee_count, founded_year, created_at
             FROM companies WHERE is_active = TRUE`;
  const params: string[] = [];

  if (type && (type === "brand" || type === "manufacturer")) {
    sql += ` AND type = ?`;
    params.push(type);
  }

  sql += ` ORDER BY created_at DESC`;

  return query<CompanyItem[]>(sql, params);
}
