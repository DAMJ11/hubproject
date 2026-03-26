import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface CertificationItem {
  id: number;
  company_id: number;
  name: string;
  issued_by: string | null;
  certificate_url: string | null;
  issued_at: string | null;
  expires_at: string | null;
  is_verified: boolean;
  is_expired: boolean;
}

export async function getCertifications(): Promise<CertificationItem[] | null> {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return null;

  const certs = await query<CertificationItem[]>(
    `SELECT id, company_id, name, issued_by, certificate_url, issued_at, expires_at, is_verified,
            CASE WHEN expires_at IS NOT NULL AND expires_at < CURDATE() THEN TRUE ELSE FALSE END as is_expired
     FROM manufacturer_certifications
     WHERE company_id = ?
     ORDER BY is_verified DESC, expires_at DESC`,
    [user.companyId]
  );

  return certs || [];
}
