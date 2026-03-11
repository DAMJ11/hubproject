// =============================================
// RFQ (Request for Quote) Types
// =============================================

export type RFQStatus = "draft" | "open" | "evaluating" | "awarded" | "cancelled" | "expired";

export interface RFQProject {
  id: number;
  code: string;
  brand_company_id: number;
  created_by_user_id: number;
  category_id: number;
  title: string;
  description: string;
  quantity: number;
  budget_min: number | null;
  budget_max: number | null;
  currency: string;
  deadline: string | null;
  proposals_deadline: string | null;
  status: RFQStatus;
  requires_sample: boolean;
  preferred_materials: string | null;
  sustainability_priority: boolean;
  proposals_count: number;
  awarded_proposal_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface RFQCreateInput {
  categoryId: number;
  title: string;
  description: string;
  quantity: number;
  budgetMin?: number;
  budgetMax?: number;
  deadline?: string;
  proposalsDeadline?: string;
  requiresSample?: boolean;
  preferredMaterials?: string;
  sustainabilityPriority?: boolean;
  materials?: RFQMaterialInput[];
}

export interface RFQMaterialInput {
  materialType: string;
  composition?: string;
  recycledPercentage?: number;
  specifications?: string;
}

export interface RFQMaterial {
  id: number;
  rfq_id: number;
  material_type: string;
  composition: string | null;
  recycled_percentage: number;
  specifications: string | null;
}

export interface RFQAttachment {
  id: number;
  rfq_id: number;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

/** Respuesta ligera para listados (sin joins pesados) */
export interface RFQListItem {
  id: number;
  code: string;
  title: string;
  categoryName: string;
  quantity: number;
  budgetMin: number | null;
  budgetMax: number | null;
  deadline: string | null;
  proposalsDeadline: string | null;
  status: RFQStatus;
  proposalsCount: number;
  sustainabilityPriority: boolean;
  brandName: string;
  brandCity: string | null;
  createdAt: string;
}

/** Respuesta detallada para vista individual */
export interface RFQDetail extends RFQListItem {
  description: string;
  requiresSample: boolean;
  preferredMaterials: string | null;
  materials: RFQMaterial[];
  attachments: RFQAttachment[];
  brandLatitude: number | null;
  brandLongitude: number | null;
}
