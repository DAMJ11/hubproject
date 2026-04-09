import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import pool from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { createNotificationBulk } from "@/lib/notifications";

// POST /api/contracts/[id]/invoices — Create invoice for contract
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const contractId = Number(id);
    if (!Number.isFinite(contractId)) {
      return NextResponse.json({ success: false, message: "Invalid contract ID" }, { status: 400 });
    }

    // Verify contract and user authorization
    const contract = await queryOne<{
      id: number; brand_company_id: number; manufacturer_company_id: number;
      status: string; currency: string; code: string;
    }>(
      `SELECT id, brand_company_id, manufacturer_company_id, status, currency, code FROM contracts WHERE id = ?`,
      [contractId]
    );
    if (!contract) {
      return NextResponse.json({ success: false, message: "Contract not found" }, { status: 404 });
    }

    // Only contract participants or admin can create invoices
    const isParticipant = user.companyId === contract.brand_company_id || user.companyId === contract.manufacturer_company_id;
    if (!isParticipant && !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { productionCost, shippingCost = 0, otherCosts = 0, taxRate = 0, platformFeeRate = 3, notes, conversationId } = body;

    if (!productionCost || Number(productionCost) <= 0) {
      return NextResponse.json({ success: false, message: "productionCost must be positive" }, { status: 400 });
    }

    const prodCost = Number(productionCost);
    const shipCost = Number(shippingCost);
    const othCost = Number(otherCosts);
    const subtotal = prodCost + shipCost + othCost;
    const taxAmt = subtotal * (Number(taxRate) / 100);
    const pfRate = Number(platformFeeRate);
    const pfAmt = subtotal * (pfRate / 100);
    const total = subtotal + taxAmt + pfAmt;

    // Generate sequential invoice code
    const countRows = await query<Array<{ c: number }>>(`SELECT COUNT(*) as c FROM invoices`);
    const count = (countRows[0]?.c ?? 0) + 1;
    const code = `INV-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;

    const result = await query<{ insertId: number }>(
      `INSERT INTO invoices (code, contract_id, conversation_id, production_cost, shipping_cost, other_costs,
        subtotal, tax_rate, tax_amount, platform_fee_rate, platform_fee, total, currency,
        status, proposed_by, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
      [code, contractId, conversationId || null, prodCost, shipCost, othCost,
        subtotal, Number(taxRate), taxAmt, pfRate, pfAmt, total, contract.currency,
        user.id, notes || null]
    );
    const invoiceId = (result as unknown as { insertId: number }).insertId;

    return NextResponse.json({
      success: true,
      data: { id: invoiceId, code, total, currency: contract.currency },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contracts/[id]/invoices error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// GET /api/contracts/[id]/invoices — List invoices for contract
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const contractId = Number(id);

    const contract = await queryOne<{ id: number; brand_company_id: number; manufacturer_company_id: number }>(
      `SELECT id, brand_company_id, manufacturer_company_id FROM contracts WHERE id = ?`,
      [contractId]
    );
    if (!contract) {
      return NextResponse.json({ success: false, message: "Contract not found" }, { status: 404 });
    }

    const isParticipant = user.companyId === contract.brand_company_id || user.companyId === contract.manufacturer_company_id;
    if (!isParticipant && !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const invoices = await query(
      `SELECT i.*, CONCAT(u.first_name, ' ', u.last_name) as proposed_by_name
       FROM invoices i
       JOIN users u ON u.id = i.proposed_by
       WHERE i.contract_id = ?
       ORDER BY i.created_at DESC`,
      [contractId]
    );

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error("GET /api/contracts/[id]/invoices error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
