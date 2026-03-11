// =============================================
// Company Types
// =============================================

export type CompanyType = "brand" | "manufacturer";

export interface Company {
  id: number;
  name: string;
  slug: string;
  type: CompanyType;
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
  latitude: number | null;
  longitude: number | null;
  employee_count: string | null;
  founded_year: number | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyCreateInput {
  name: string;
  type: CompanyType;
  legalId?: string;
  description?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  employeeCount?: string;
  foundedYear?: number;
}

export interface CompanyResponse {
  id: number;
  name: string;
  slug: string;
  type: CompanyType;
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  country: string;
  isVerified: boolean;
  latitude: number | null;
  longitude: number | null;
}
