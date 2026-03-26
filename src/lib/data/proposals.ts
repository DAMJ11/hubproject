import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export interface MyProposal {
  id: number;
  rfq_id: number;
  rfq_code: string;
  rfq_title: string;
  rfq_status: string;
  category_name: string;
  unit_price: number;
  total_price: number;
  lead_time_days: number;
  status: string;
  green_score: number;
  submitted_at: string;
}

export interface CapabilityOffer {
  id: number;
  category_name: string;
  min_order_qty: number;
  max_monthly_capacity: number | null;
  lead_time_days: number | null;
  unit_price_from: number | null;
  wholesale_price_from: number | null;
}

const OFFER_META_MARKER = "__OFFER_META__";

function extractPrices(description: string | null): {
  unitPriceFrom: number | null;
  wholesalePriceFrom: number | null;
} {
  if (!description) return { unitPriceFrom: null, wholesalePriceFrom: null };
  const idx = description.indexOf(OFFER_META_MARKER);
  if (idx === -1) return { unitPriceFrom: null, wholesalePriceFrom: null };
  try {
    const parsed = JSON.parse(description.slice(idx + OFFER_META_MARKER.length).trim());
    return {
      unitPriceFrom: typeof parsed.unitPriceFrom === "number" ? parsed.unitPriceFrom : null,
      wholesalePriceFrom: typeof parsed.wholesalePriceFrom === "number" ? parsed.wholesalePriceFrom : null,
    };
  } catch {
    return { unitPriceFrom: null, wholesalePriceFrom: null };
  }
}

export interface ProposalsData {
  proposals: MyProposal[];
  offers: CapabilityOffer[];
}

export async function getProposalsData(): Promise<ProposalsData | null> {
  const user = await getCurrentUser();
  if (!user || !user.companyId) return null;
  if (user.role !== "manufacturer") return null;

  const [proposals, rawCapabilities] = await Promise.all([
    query<MyProposal[]>(
      `SELECT p.id, p.rfq_id, p.unit_price, p.total_price, p.lead_time_days,
              p.status, p.green_score, p.submitted_at,
              r.code as rfq_code, r.title as rfq_title, r.status as rfq_status,
              sc.name as category_name
       FROM proposals p
       JOIN rfq_projects r ON p.rfq_id = r.id
       JOIN service_categories sc ON r.category_id = sc.id
       WHERE p.manufacturer_company_id = ?
       ORDER BY p.submitted_at DESC`,
      [user.companyId]
    ),
    query<{ id: number; category_name: string; min_order_qty: number; max_monthly_capacity: number | null; lead_time_days: number | null; description: string | null }[]>(
      `SELECT mc.id, sc.name as category_name, mc.min_order_qty, mc.max_monthly_capacity, mc.lead_time_days, mc.description
       FROM manufacturer_capabilities mc
       JOIN service_categories sc ON mc.category_id = sc.id
       WHERE mc.company_id = ? AND mc.is_active = TRUE
       ORDER BY sc.sort_order`,
      [user.companyId]
    ),
  ]);

  const offers: CapabilityOffer[] = (rawCapabilities as { id: number; category_name: string; min_order_qty: number; max_monthly_capacity: number | null; lead_time_days: number | null; description: string | null }[]).map((cap) => {
    const prices = extractPrices(cap.description);
    return {
      id: cap.id,
      category_name: cap.category_name,
      min_order_qty: cap.min_order_qty,
      max_monthly_capacity: cap.max_monthly_capacity,
      lead_time_days: cap.lead_time_days,
      unit_price_from: prices.unitPriceFrom,
      wholesale_price_from: prices.wholesalePriceFrom,
    };
  });

  return { proposals: proposals as MyProposal[], offers };
}
