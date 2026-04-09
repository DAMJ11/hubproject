import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/invoices/[id] — Get invoice detail
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
    const invoiceId = Number(id);

    const invoice = await queryOne(
      `SELECT i.*, 
        CONCAT(u.first_name, ' ', u.last_name) as proposed_by_name,
        c.brand_company_id, c.manufacturer_company_id, c.code as contract_code,
        r.title as rfq_title, r.code as rfq_code,
        bc.name as brand_name, mc.name as manufacturer_name
       FROM invoices i
       JOIN users u ON u.id = i.proposed_by
       JOIN contracts c ON c.id = i.contract_id
       JOIN rfq_projects r ON r.id = c.rfq_id
       JOIN companies bc ON bc.id = c.brand_company_id
       JOIN companies mc ON mc.id = c.manufacturer_company_id
       WHERE i.id = ?`,
      [invoiceId]
    );

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    const inv = invoice as { brand_company_id: number; manufacturer_company_id: number };
    const isParticipant = user.companyId === inv.brand_company_id || user.companyId === inv.manufacturer_company_id;
    if (!isParticipant && !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT /api/invoices/[id] — Edit invoice amounts (only draft or revision_requested)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const invoiceId = Number(id);

    const invoice = await queryOne<{
      id: number; status: string; proposed_by: number; contract_id: number;
    }>(
      `SELECT i.id, i.status, i.proposed_by, i.contract_id
       FROM invoices i WHERE i.id = ?`,
      [invoiceId]
    );
    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }

    if (!["draft", "revision_requested"].includes(invoice.status)) {
      return NextResponse.json({ success: false, message: "Invoice cannot be edited in current status" }, { status: 400 });
    }

    // Check authorization
    const contract = await queryOne<{ brand_company_id: number; manufacturer_company_id: number }>(
      `SELECT brand_company_id, manufacturer_company_id FROM contracts WHERE id = ?`,
      [invoice.contract_id]
    );
    if (!contract) {
      return NextResponse.json({ success: false, message: "Contract not found" }, { status: 404 });
    }
    const isParticipant = user.companyId === contract.brand_company_id || user.companyId === contract.manufacturer_company_id;
    if (!isParticipant && !hasRole(user, "admin")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { productionCost, shippingCost, otherCosts, taxRate, platformFeeRate, notes } = body;

    const prodCost = Number(productionCost ?? 0);
    const shipCost = Number(shippingCost ?? 0);
    const othCost = Number(otherCosts ?? 0);
    const subtotal = prodCost + shipCost + othCost;
    const taxAmt = subtotal * (Number(taxRate ?? 0) / 100);
    const pfRate = Number(platformFeeRate ?? 3);
    const pfAmt = subtotal * (pfRate / 100);
    const total = subtotal + taxAmt + pfAmt;

    await query(
      `UPDATE invoices SET production_cost = ?, shipping_cost = ?, other_costs = ?,
        subtotal = ?, tax_rate = ?, tax_amount = ?, platform_fee_rate = ?, platform_fee = ?,
        total = ?, notes = ?, proposed_by = ?, updated_at = NOW()
       WHERE id = ?`,
      [prodCost, shipCost, othCost, subtotal, Number(taxRate ?? 0), taxAmt, pfRate, pfAmt,
        total, notes ?? null, user.id, invoiceId]
    );

    return NextResponse.json({ success: true, message: "Invoice updated", data: { total } });
  } catch (error) {
    console.error("PUT /api/invoices/[id] error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
