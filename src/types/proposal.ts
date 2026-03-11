// =============================================
// Proposal Types
// =============================================

export type ProposalStatus = "submitted" | "shortlisted" | "accepted" | "rejected" | "withdrawn";

export interface Proposal {
  id: number;
  rfq_id: number;
  manufacturer_company_id: number;
  submitted_by_user_id: number;
  unit_price: number;
  total_price: number;
  currency: string;
  lead_time_days: number;
  proposed_materials: string | null;
  recycled_percentage: number;
  notes: string | null;
  status: ProposalStatus;
  green_score: number;
  distance_km: number | null;
  submitted_at: Date;
  responded_at: Date | null;
  created_at: Date;
}

export interface ProposalCreateInput {
  rfqId: number;
  unitPrice: number;
  leadTimeDays: number;
  proposedMaterials?: string;
  recycledPercentage?: number;
  notes?: string;
}

/** Respuesta para listado (vista marca) */
export interface ProposalListItem {
  id: number;
  rfqId: number;
  rfqTitle: string;
  manufacturerName: string;
  manufacturerCity: string | null;
  manufacturerIsVerified: boolean;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  recycledPercentage: number;
  status: ProposalStatus;
  greenScore: number;
  distanceKm: number | null;
  submittedAt: string;
  certificationsCount: number;
}

/** Propuesta con detalle completo */
export interface ProposalDetail extends ProposalListItem {
  proposedMaterials: string | null;
  notes: string | null;
  manufacturerDescription: string | null;
  certifications: { name: string; isVerified: boolean }[];
}
