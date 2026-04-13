// =============================================
// Designer Types
// =============================================

export interface DesignerProfile {
  id: number;
  user_id: number;
  company_id: number | null;
  display_name: string;
  bio: string | null;
  specialties: string | null; // JSON array string: ["collections", "tech_packs", ...]
  years_experience: number | null;
  portfolio_url: string | null;
  instagram_handle: string | null;
  behance_url: string | null;
  location_city: string | null;
  location_country: string;
  availability_status: DesignerAvailability;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  currency: string;
  is_verified: boolean;
  rating_avg: number;
  projects_completed: number;
  is_freelance: boolean;
  created_at: Date;
  updated_at: Date;
}

export type DesignerAvailability = "available" | "busy" | "unavailable";

export type DesignerSpecialty =
  | "collections"
  | "tech_packs"
  | "patterns"
  | "illustration"
  | "trend_consulting"
  | "branding";

export const DESIGNER_SPECIALTIES: { value: DesignerSpecialty; labelKey: string }[] = [
  { value: "collections", labelKey: "specialties.collections" },
  { value: "tech_packs", labelKey: "specialties.techPacks" },
  { value: "patterns", labelKey: "specialties.patterns" },
  { value: "illustration", labelKey: "specialties.illustration" },
  { value: "trend_consulting", labelKey: "specialties.trendConsulting" },
  { value: "branding", labelKey: "specialties.branding" },
];
