import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

const OFFER_META_MARKER = "__OFFER_META__";

type OfferMeta = {
  unitPriceFrom: number | null;
  wholesalePriceFrom: number | null;
  commercialNotes: string | null;
};

function extractOfferMeta(description: string | null): {
  cleanDescription: string | null;
  offerMeta: OfferMeta;
} {
  const fallback: OfferMeta = {
    unitPriceFrom: null,
    wholesalePriceFrom: null,
    commercialNotes: null,
  };

  if (!description) {
    return { cleanDescription: null, offerMeta: fallback };
  }

  const markerIndex = description.indexOf(OFFER_META_MARKER);
  if (markerIndex === -1) {
    return { cleanDescription: description, offerMeta: fallback };
  }

  const cleanDescription = description.slice(0, markerIndex).trim() || null;
  const rawMeta = description.slice(markerIndex + OFFER_META_MARKER.length).trim();

  try {
    const parsed = JSON.parse(rawMeta) as Partial<OfferMeta>;
    return {
      cleanDescription,
      offerMeta: {
        unitPriceFrom: typeof parsed.unitPriceFrom === "number" ? parsed.unitPriceFrom : null,
        wholesalePriceFrom: typeof parsed.wholesalePriceFrom === "number" ? parsed.wholesalePriceFrom : null,
        commercialNotes: typeof parsed.commercialNotes === "string" ? parsed.commercialNotes : null,
      },
    };
  } catch {
    return { cleanDescription: description, offerMeta: fallback };
  }
}

function buildDescriptionWithMeta(
  description: string | null,
  meta: OfferMeta
): string | null {
  const cleanDescription = (description || "").trim();
  const hasMeta = meta.unitPriceFrom !== null || meta.wholesalePriceFrom !== null || Boolean(meta.commercialNotes?.trim());

  if (!hasMeta) {
    return cleanDescription || null;
  }

  const safeMeta: OfferMeta = {
    unitPriceFrom: meta.unitPriceFrom,
    wholesalePriceFrom: meta.wholesalePriceFrom,
    commercialNotes: meta.commercialNotes?.trim() || null,
  };

  const base = cleanDescription ? `${cleanDescription}\n\n` : "";
  return `${base}${OFFER_META_MARKER}${JSON.stringify(safeMeta)}`;
}

// GET /api/manufacturers/capabilities?companyId=X
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = Number(searchParams.get("companyId")) || user.companyId;

    if (!companyId) {
      return NextResponse.json({ success: false, message: "companyId required" }, { status: 400 });
    }

    const capabilities = await query(
      `SELECT mc.id, mc.company_id, mc.category_id, sc.name as category_name,
              mc.min_order_qty, mc.max_monthly_capacity, mc.lead_time_days, mc.description, mc.is_active
       FROM manufacturer_capabilities mc
       JOIN service_categories sc ON mc.category_id = sc.id
       WHERE mc.company_id = ? AND mc.is_active = TRUE
       ORDER BY sc.sort_order`,
      [companyId]
    );

    const normalized = (capabilities as Array<{
      id: number;
      company_id: number;
      category_id: number;
      category_name: string;
      min_order_qty: number;
      max_monthly_capacity: number | null;
      lead_time_days: number | null;
      description: string | null;
      is_active: boolean;
    }>).map((cap) => {
      const { cleanDescription, offerMeta } = extractOfferMeta(cap.description);
      return {
        ...cap,
        description: cleanDescription,
        unit_price_from: offerMeta.unitPriceFrom,
        wholesale_price_from: offerMeta.wholesalePriceFrom,
        commercial_notes: offerMeta.commercialNotes,
      };
    });

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error("GET capabilities error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/manufacturers/capabilities
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "manufacturer", "admin") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      categoryId,
      minOrderQty,
      maxMonthlyCapacity,
      leadTimeDays,
      description,
      unitPriceFrom,
      wholesalePriceFrom,
      commercialNotes,
    } = body;

    if (!categoryId) {
      return NextResponse.json({ success: false, message: "categoryId is required" }, { status: 400 });
    }

    const parsedUnitPriceFrom = unitPriceFrom !== undefined && unitPriceFrom !== null && unitPriceFrom !== ""
      ? Number(unitPriceFrom)
      : null;
    const parsedWholesalePriceFrom = wholesalePriceFrom !== undefined && wholesalePriceFrom !== null && wholesalePriceFrom !== ""
      ? Number(wholesalePriceFrom)
      : null;

    if (parsedUnitPriceFrom !== null && (!Number.isFinite(parsedUnitPriceFrom) || parsedUnitPriceFrom < 0)) {
      return NextResponse.json({ success: false, message: "unitPriceFrom invalido" }, { status: 400 });
    }

    if (parsedWholesalePriceFrom !== null && (!Number.isFinite(parsedWholesalePriceFrom) || parsedWholesalePriceFrom < 0)) {
      return NextResponse.json({ success: false, message: "wholesalePriceFrom invalido" }, { status: 400 });
    }

    const descriptionWithMeta = buildDescriptionWithMeta(description || null, {
      unitPriceFrom: parsedUnitPriceFrom,
      wholesalePriceFrom: parsedWholesalePriceFrom,
      commercialNotes: typeof commercialNotes === "string" ? commercialNotes : null,
    });

    await query(
      `INSERT INTO manufacturer_capabilities (company_id, category_id, min_order_qty, max_monthly_capacity, lead_time_days, description)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE min_order_qty = VALUES(min_order_qty), max_monthly_capacity = VALUES(max_monthly_capacity),
                                lead_time_days = VALUES(lead_time_days), description = VALUES(description), is_active = TRUE`,
      [user.companyId, categoryId, minOrderQty || 1, maxMonthlyCapacity || null, leadTimeDays || null, descriptionWithMeta]
    );

    return NextResponse.json({ success: true, message: "Capability saved" }, { status: 201 });
  } catch (error) {
    console.error("POST capabilities error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/manufacturers/capabilities?id=X
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "manufacturer", "admin") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required" }, { status: 400 });
    }

    await query(
      `UPDATE manufacturer_capabilities SET is_active = FALSE WHERE id = ? AND company_id = ?`,
      [id, user.companyId]
    );

    return NextResponse.json({ success: true, message: "Capability removed" });
  } catch (error) {
    console.error("DELETE capabilities error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
