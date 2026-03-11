// =============================================
// Green Score Types
// =============================================

export interface GreenScoreBreakdown {
  total: number;
  proximity: { score: number; weight: number; distanceKm: number | null };
  materials: { score: number; weight: number; recycledPercentage: number };
  certifications: { score: number; weight: number; count: number; details: string[] };
  history: { score: number; weight: number; avgRating: number };
}

export interface ManufacturerCapability {
  id: number;
  companyId: number;
  categoryId: number;
  categoryName: string;
  minOrderQty: number;
  maxMonthlyCapacity: number | null;
  leadTimeDays: number | null;
  description: string | null;
}

export interface ManufacturerCertification {
  id: number;
  companyId: number;
  name: string;
  issuedBy: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  isVerified: boolean;
  isExpired: boolean;
}

/** Fabricante rankeado para un RFQ específico */
export interface RankedManufacturer {
  companyId: number;
  companyName: string;
  city: string | null;
  isVerified: boolean;
  greenScore: GreenScoreBreakdown;
  hasCapability: boolean;
  leadTimeDays: number | null;
  minOrderQty: number;
}
