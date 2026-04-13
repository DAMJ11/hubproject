import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { createNotification, createNotificationBulk } from "@/lib/notifications";

// POST /api/design-projects/[id]/recommend-manufacturer — designer recommends a manufacturer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const { id } = await params;
    const projectId = Number(id);
    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ success: false, message: "Invalid project ID" }, { status: 400 });
    }

    const body = await request.json();
    const { manufacturerCompanyId, reason } = body;

    if (!manufacturerCompanyId || !Number.isFinite(Number(manufacturerCompanyId))) {
      return NextResponse.json({ success: false, message: "manufacturerCompanyId is required" }, { status: 400 });
    }

    // Verify the designer has an accepted proposal on this project
    const myProfile = await queryOne<{ id: number }>(
      `SELECT id FROM designer_profiles WHERE user_id = ?`,
      [user.id]
    );
    if (!myProfile) {
      return NextResponse.json({ success: false, message: "Designer profile not found" }, { status: 404 });
    }

    const project = await queryOne<{
      id: number;
      brand_company_id: number;
      title: string;
    }>(
      `SELECT dp.id, dp.brand_company_id, dp.title
       FROM design_projects dp
       JOIN design_proposals dpr ON dpr.design_project_id = dp.id
       WHERE dp.id = ? AND dpr.designer_profile_id = ? AND dpr.status = 'accepted'`,
      [projectId, myProfile.id]
    );

    if (!project) {
      return NextResponse.json({ success: false, message: "No accepted proposal on this project" }, { status: 403 });
    }

    // Verify the manufacturer exists and is a manufacturer company
    const manufacturer = await queryOne<{ id: number; name: string }>(
      `SELECT id, name FROM companies WHERE id = ? AND type = 'manufacturer'`,
      [Number(manufacturerCompanyId)]
    );
    if (!manufacturer) {
      return NextResponse.json({ success: false, message: "Manufacturer not found" }, { status: 404 });
    }

    // Create a trilateral conversation (brand + designer + manufacturer)
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM conversations 
       WHERE design_project_id = ? AND brand_company_id = ? AND manufacturer_company_id = ? AND designer_profile_id = ?
       LIMIT 1`,
      [projectId, project.brand_company_id, manufacturer.id, myProfile.id]
    );

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { conversationId: existing.id },
        message: "Trilateral conversation already exists",
      });
    }

    const subject = `Design project: ${project.title} — Manufacturer recommendation`;

    const result = await query<{ insertId: number }>(
      `INSERT INTO conversations 
        (design_project_id, brand_company_id, manufacturer_company_id, designer_profile_id,
         initiated_by_user_id, subject, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'open', NOW(), NOW())`,
      [projectId, project.brand_company_id, manufacturer.id, myProfile.id, user.id, subject]
    );

    const conversationId = (result as unknown as { insertId: number }).insertId;

    // Add initial message with recommendation
    const message = reason
      ? `I recommend ${manufacturer.name} for this project. Reason: ${String(reason).substring(0, 1000)}`
      : `I recommend ${manufacturer.name} for manufacturing this design project.`;

    await query(
      `INSERT INTO messages (conversation_id, sender_id, content, created_at)
       VALUES (?, ?, ?, NOW())`,
      [conversationId, user.id, message]
    );

    await query(`UPDATE conversations SET last_message_at = NOW() WHERE id = ?`, [conversationId]);

    // Notify brand users
    const brandUsers = await query<Array<{ id: number }>>(
      `SELECT id FROM users WHERE company_id = ?`,
      [project.brand_company_id]
    );
    if (Array.isArray(brandUsers) && brandUsers.length > 0) {
      createNotificationBulk(
        brandUsers.map((u) => u.id),
        {
          title: "Manufacturer Recommendation",
          message: `Designer recommended ${manufacturer.name} for: ${project.title}`,
          type: "design_project",
          referenceType: "conversation",
          referenceId: conversationId,
        }
      ).catch(() => {});
    }

    // Notify manufacturer users
    const mfgUsers = await query<Array<{ id: number }>>(
      `SELECT id FROM users WHERE company_id = ?`,
      [manufacturer.id]
    );
    if (Array.isArray(mfgUsers) && mfgUsers.length > 0) {
      createNotificationBulk(
        mfgUsers.map((u) => u.id),
        {
          title: "Design Project Opportunity",
          message: `A designer has recommended you for a design project: ${project.title}`,
          type: "design_project",
          referenceType: "conversation",
          referenceId: conversationId,
        }
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: { conversationId },
    }, { status: 201 });
  } catch (error) {
    console.error("POST recommend-manufacturer error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// GET /api/design-projects/[id]/recommend-manufacturer — list manufacturers for recommendation
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit")) || 10));

    let whereClause = "c.type = 'manufacturer'";
    const params: (string | number)[] = [];

    if (search) {
      whereClause += " AND (c.name LIKE ? OR c.country LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like);
    }

    const manufacturers = await query<unknown[]>(
      `SELECT c.id, c.name, c.country, c.city, c.logo_url, c.is_verified,
              (SELECT COUNT(*) FROM contracts ct WHERE ct.manufacturer_company_id = c.id AND ct.status = 'completed') as completed_contracts
       FROM companies c
       WHERE ${whereClause}
       ORDER BY c.is_verified DESC, completed_contracts DESC
       LIMIT ?`,
      [...params, limit]
    );

    return NextResponse.json({ success: true, data: manufacturers });
  } catch (error) {
    console.error("GET recommend-manufacturer error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
