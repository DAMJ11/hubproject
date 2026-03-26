import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { calculateGreenScore } from "@/lib/green-score";

interface Certification {
  id: number;
  certification_name: string;
  issued_by: string;
  expires_at: string | null;
}

interface Capability {
  id: number;
  capability_name: string;
  min_order_quantity: number;
  max_order_quantity: number;
}

export interface GreenScoreBreakdown {
  proximity: number;
  materials: number;
  certifications: number;
  history: number;
}

export interface GreenScoreData {
  certifications: Certification[];
  capabilities: Capability[];
  avgScore: number;
  totalProposals: number;
  breakdown: GreenScoreBreakdown;
}

export async function getGreenScoreData(): Promise<GreenScoreData | null> {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return null;

  const [certs, caps, proposals, avgDistance, avgRecycled, avgRating] = await Promise.all([
    query<Certification[]>(
      `SELECT id, name as certification_name, issued_by, expires_at
       FROM manufacturer_certifications
       WHERE company_id = ?
       ORDER BY is_verified DESC, expires_at DESC`,
      [user.companyId]
    ),
    query<Capability[]>(
      `SELECT mc.id, sc.name as capability_name, mc.min_order_qty as min_order_quantity,
              mc.max_monthly_capacity as max_order_quantity
       FROM manufacturer_capabilities mc
       JOIN service_categories sc ON mc.category_id = sc.id
       WHERE mc.company_id = ? AND mc.is_active = TRUE
       ORDER BY sc.sort_order`,
      [user.companyId]
    ),
    query<Array<{ green_score: number }>>(
      `SELECT p.green_score
       FROM proposals p
       WHERE p.manufacturer_company_id = ?`,
      [user.companyId]
    ),
    query<Array<{ avg_distance: number | null }>>(
      `SELECT AVG(distance_km) as avg_distance
       FROM proposals
       WHERE manufacturer_company_id = ? AND distance_km IS NOT NULL`,
      [user.companyId]
    ),
    query<Array<{ avg_recycled: number | null }>>(
      `SELECT AVG(recycled_percentage) as avg_recycled
       FROM proposals
       WHERE manufacturer_company_id = ?`,
      [user.companyId]
    ),
    query<Array<{ avg_rating: number | null }>>(
      `SELECT AVG(r.rating) as avg_rating
       FROM reviews r
       WHERE r.reviewed_company_id = ?`,
      [user.companyId]
    ),
  ]);

  const proposalsList = proposals ?? [];
  const scores = proposalsList.map((p) => p.green_score).filter((s) => s > 0);
  const avgScore =
    scores.length > 0 && scores.every((s) => !isNaN(s))
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const certNames = (certs ?? []).map((c) => c.certification_name);
  const distanceKm = avgDistance?.[0]?.avg_distance ?? null;
  const recycledPct = avgRecycled?.[0]?.avg_recycled ?? 0;
  const ratingVal = avgRating?.[0]?.avg_rating ?? 0;

  const result = calculateGreenScore({
    distanceKm,
    recycledPercentage: recycledPct,
    certifications: certNames,
    avgRating: ratingVal,
  });

  const breakdown: GreenScoreBreakdown = {
    proximity: Math.round(result.proximity.score * result.proximity.weight),
    materials: Math.round(result.materials.score * result.materials.weight),
    certifications: Math.round(result.certifications.score * result.certifications.weight),
    history: Math.round(result.history.score * result.history.weight),
  };

  return {
    certifications: certs ?? [],
    capabilities: caps ?? [],
    avgScore,
    totalProposals: proposalsList.length,
    breakdown,
  };
}
