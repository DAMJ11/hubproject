import { getCurrentUser } from "@/lib/auth";
import { query, queryOne, getTableColumns } from "@/lib/db";

export interface CompanyDetail {
  id: number;
  name: string;
  slug: string;
  type: string;
  legal_id: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  website: string | null;
  instagram_handle: string | null;
  brand_categories: string | null;
  brand_tagline: string | null;
  ships_worldwide: boolean;
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

const COMPANY_DETAIL_FIELDS: Array<keyof CompanyDetail> = [
  "id",
  "name",
  "slug",
  "type",
  "legal_id",
  "description",
  "logo_url",
  "cover_image_url",
  "website",
  "instagram_handle",
  "brand_categories",
  "brand_tagline",
  "ships_worldwide",
  "phone",
  "email",
  "address_line1",
  "city",
  "state",
  "country",
  "employee_count",
  "founded_year",
  "is_verified",
];

const DEFAULT_COMPANY_DETAIL: CompanyDetail = {
  id: 0,
  name: "",
  slug: "",
  type: "brand",
  legal_id: null,
  description: null,
  logo_url: null,
  cover_image_url: null,
  website: null,
  instagram_handle: null,
  brand_categories: null,
  brand_tagline: null,
  ships_worldwide: false,
  phone: null,
  email: null,
  address_line1: null,
  city: null,
  state: null,
  country: "Colombia",
  employee_count: null,
  founded_year: null,
  is_verified: false,
};

export async function getCompanyById(companyId: number): Promise<CompanyDetail | null> {
  const availableColumns = await getTableColumns("companies");
  const selectFields = COMPANY_DETAIL_FIELDS.filter((field) => availableColumns.includes(field.toLowerCase()));

  if (selectFields.length === 0) return null;

  const company = await queryOne<Partial<CompanyDetail>>(
    `SELECT ${selectFields.join(", ")} FROM companies WHERE id = ? AND is_active = TRUE`,
    [companyId]
  );

  if (!company) return null;
  return {
    ...DEFAULT_COMPANY_DETAIL,
    ...company,
  };
}

export async function getCurrentCompany(): Promise<CompanyDetail | null> {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return null;

  return getCompanyById(user.companyId);
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
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) return null;

  let sql = `SELECT id, name, slug, type, description, logo_url, city, state, country,
             is_verified, employee_count, founded_year, created_at
             FROM companies`;
  const params: string[] = [];

  if (type && (type === "brand" || type === "manufacturer")) {
    sql += ` WHERE type = ?`;
    params.push(type);
  }

  sql += ` ORDER BY created_at DESC`;

  return query<CompanyItem[]>(sql, params);
}
