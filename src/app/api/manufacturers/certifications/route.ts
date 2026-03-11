import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";

// GET /api/manufacturers/certifications?companyId=X
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

    const certs = await query(
      `SELECT id, company_id, name, issued_by, certificate_url, issued_at, expires_at, is_verified,
              CASE WHEN expires_at IS NOT NULL AND expires_at < CURDATE() THEN TRUE ELSE FALSE END as is_expired
       FROM manufacturer_certifications
       WHERE company_id = ?
       ORDER BY is_verified DESC, expires_at DESC`,
      [companyId]
    );

    return NextResponse.json({ success: true, data: certs });
  } catch (error) {
    console.error("GET certifications error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/manufacturers/certifications
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "manufacturer", "admin") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, issuedBy, certificateUrl, issuedAt, expiresAt } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ success: false, message: "Certification name is required" }, { status: 400 });
    }

    await query(
      `INSERT INTO manufacturer_certifications (company_id, name, issued_by, certificate_url, issued_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.companyId, name.trim(), issuedBy || null, certificateUrl || null, issuedAt || null, expiresAt || null]
    );

    return NextResponse.json({ success: true, message: "Certification added" }, { status: 201 });
  } catch (error) {
    console.error("POST certifications error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/manufacturers/certifications?id=X
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
      `DELETE FROM manufacturer_certifications WHERE id = ? AND company_id = ?`,
      [id, user.companyId]
    );

    return NextResponse.json({ success: true, message: "Certification removed" });
  } catch (error) {
    console.error("DELETE certifications error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
