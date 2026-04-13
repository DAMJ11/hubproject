import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { createNotificationBulk } from "@/lib/notifications";

const VALID_CATEGORIES = [
  "collections", "tech_packs", "patterns", "illustration", "branding", "consulting",
];
const VALID_STATUSES = ["draft", "open", "in_progress", "review", "completed", "cancelled"];

// GET /api/design-projects/[id] — get single design project with proposals
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
    const projectId = Number(id);
    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ success: false, message: "Invalid project ID" }, { status: 400 });
    }

    const project = await queryOne(
      `SELECT dp.*, c.name as brand_name, c.logo_url as brand_logo, c.city as brand_city, c.country as brand_country,
              u.first_name as creator_first_name, u.last_name as creator_last_name,
              (SELECT dpr.display_name FROM designer_profiles dpr WHERE dpr.id = dp.designer_profile_id) as assigned_designer_name,
              (SELECT dpr.slug FROM designer_profiles dpr WHERE dpr.id = dp.designer_profile_id) as assigned_designer_slug
       FROM design_projects dp
       JOIN companies c ON dp.brand_company_id = c.id
       JOIN users u ON dp.created_by_user_id = u.id
       WHERE dp.id = ?`,
      [projectId]
    );

    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    // Access control
    const proj = project as { brand_company_id: number; status: string; designer_profile_id: number | null };
    if (hasRole(user, "brand") && proj.brand_company_id !== user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    if (hasRole(user, "designer") && proj.status !== "open") {
      // Designers can see open projects + projects assigned to them
      const designerProfile = await queryOne<{ id: number }>(
        `SELECT id FROM designer_profiles WHERE user_id = ?`, [user.id]
      );
      if (!designerProfile || proj.designer_profile_id !== designerProfile.id) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
      }
    }

    // Fetch proposals (brand sees all, designer sees own)
    let proposals: unknown[] = [];
    if (hasRole(user, "brand", "admin")) {
      proposals = await query(
        `SELECT dpr.id, dpr.price, dpr.estimated_days, dpr.concept_notes,
                dpr.status, dpr.submitted_at, dpr.responded_at,
                dp.display_name as designer_name, dp.slug as designer_slug,
                dp.avatar_url as designer_avatar, dp.rating_avg, dp.projects_completed,
                dp.location_country as designer_country, dp.specialties as designer_specialties
         FROM design_proposals dpr
         JOIN designer_profiles dp ON dpr.designer_profile_id = dp.id
         WHERE dpr.design_project_id = ?
         ORDER BY dpr.submitted_at DESC`,
        [projectId]
      );
    } else if (hasRole(user, "designer")) {
      const designerProfile = await queryOne<{ id: number }>(
        `SELECT id FROM designer_profiles WHERE user_id = ?`, [user.id]
      );
      if (designerProfile) {
        proposals = await query(
          `SELECT dpr.id, dpr.price, dpr.estimated_days, dpr.concept_notes,
                  dpr.status, dpr.submitted_at, dpr.responded_at
           FROM design_proposals dpr
           WHERE dpr.design_project_id = ? AND dpr.designer_profile_id = ?`,
          [projectId, designerProfile.id]
        );
      }
    }

    return NextResponse.json({ success: true, data: { ...project, proposals } });
  } catch (error) {
    console.error("GET design-project detail error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT /api/design-projects/[id] — update design project (brand owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "brand") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Only brands can update design projects" }, { status: 403 });
    }

    const { id } = await params;
    const projectId = Number(id);

    // Verify ownership
    const project = await queryOne<{ brand_company_id: number; status: string }>(
      `SELECT brand_company_id, status FROM design_projects WHERE id = ?`, [projectId]
    );
    if (!project || project.brand_company_id !== user.companyId) {
      return NextResponse.json({ success: false, message: "Project not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title, description, category, season, budgetMin, budgetMax, currency,
      deadline, proposalsDeadline, referenceImages, status: newStatus,
    } = body;

    // Validate fields if provided
    if (title !== undefined && (!title || title.trim().length < 3)) {
      return NextResponse.json({ success: false, message: "Title must be at least 3 chars" }, { status: 400 });
    }
    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ success: false, message: "Invalid category" }, { status: 400 });
    }
    if (newStatus !== undefined && !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    const refImagesStr = Array.isArray(referenceImages) ? JSON.stringify(referenceImages) : referenceImages;

    await query(
      `UPDATE design_projects SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        season = COALESCE(?, season),
        budget_min = COALESCE(?, budget_min),
        budget_max = COALESCE(?, budget_max),
        currency = COALESCE(?, currency),
        deadline = COALESCE(?, deadline),
        proposals_deadline = COALESCE(?, proposals_deadline),
        reference_images = COALESCE(?, reference_images),
        status = COALESCE(?, status),
        updated_at = NOW()
       WHERE id = ?`,
      [
        title?.trim() ?? null, description?.trim() ?? null, category ?? null,
        season ?? null, budgetMin ?? null, budgetMax ?? null, currency ?? null,
        deadline ?? null, proposalsDeadline ?? null, refImagesStr ?? null,
        newStatus ?? null, projectId,
      ]
    );

    // If transitioning to 'open', notify designers
    if (newStatus === "open" && project.status === "draft") {
      const proj = await queryOne<{ title: string }>(`SELECT title FROM design_projects WHERE id = ?`, [projectId]);
      const designers = await query<Array<{ user_id: number }>>(
        `SELECT user_id FROM designer_profiles WHERE availability_status != 'unavailable'`
      );
      if (Array.isArray(designers) && designers.length > 0) {
        createNotificationBulk(
          designers.map((d) => d.user_id),
          {
            title: "New Design Project",
            message: `A new design project "${proj?.title}" is looking for designers.`,
            type: "design_project",
            referenceType: "design_project",
            referenceId: projectId,
          }
        ).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, message: "Project updated" });
  } catch (error) {
    console.error("PUT design-project error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/design-projects/[id] — delete draft project (brand owner only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "brand") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const projectId = Number(id);

    const project = await queryOne<{ brand_company_id: number; status: string }>(
      `SELECT brand_company_id, status FROM design_projects WHERE id = ?`, [projectId]
    );
    if (!project || project.brand_company_id !== user.companyId) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }
    if (project.status !== "draft") {
      return NextResponse.json({ success: false, message: "Only draft projects can be deleted" }, { status: 400 });
    }

    await query(`DELETE FROM design_proposals WHERE design_project_id = ?`, [projectId]);
    await query(`DELETE FROM design_projects WHERE id = ?`, [projectId]);

    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("DELETE design-project error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
