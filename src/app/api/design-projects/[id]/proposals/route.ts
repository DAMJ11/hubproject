import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSessionUser, hasRole } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

// GET /api/design-projects/[id]/proposals — list proposals for a project
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

    const project = await queryOne<{ brand_company_id: number }>(
      `SELECT brand_company_id FROM design_projects WHERE id = ?`, [projectId]
    );
    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found" }, { status: 404 });
    }

    // Brand sees all proposals, designer sees only their own
    let sql = `SELECT dpr.id, dpr.price, dpr.estimated_days, dpr.concept_notes,
                      dpr.sample_attachments, dpr.status, dpr.submitted_at, dpr.responded_at,
                      dp.display_name as designer_name, dp.slug as designer_slug,
                      dp.avatar_url as designer_avatar, dp.rating_avg, dp.projects_completed,
                      dp.location_country as designer_country, dp.specialties as designer_specialties
               FROM design_proposals dpr
               JOIN designer_profiles dp ON dpr.designer_profile_id = dp.id
               WHERE dpr.design_project_id = ?`;
    const queryParams: (string | number)[] = [projectId];

    if (hasRole(user, "designer")) {
      const designerProfile = await queryOne<{ id: number }>(
        `SELECT id FROM designer_profiles WHERE user_id = ?`, [user.id]
      );
      if (!designerProfile) {
        return NextResponse.json({ success: true, data: [] });
      }
      sql += ` AND dpr.designer_profile_id = ?`;
      queryParams.push(designerProfile.id);
    } else if (hasRole(user, "brand") && project.brand_company_id !== user.companyId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    sql += ` ORDER BY dpr.submitted_at DESC`;
    const proposals = await query(sql, queryParams);

    return NextResponse.json({ success: true, data: proposals });
  } catch (error) {
    console.error("GET design proposals error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// POST /api/design-projects/[id]/proposals — designer submits a proposal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "designer")) {
      return NextResponse.json({ success: false, message: "Only designers can submit proposals" }, { status: 403 });
    }

    const { id } = await params;
    const projectId = Number(id);

    // Verify project exists and is open
    const project = await queryOne<{ status: string; brand_company_id: number; title: string; created_by_user_id: number }>(
      `SELECT status, brand_company_id, title, created_by_user_id FROM design_projects WHERE id = ?`, [projectId]
    );
    if (!project || project.status !== "open") {
      return NextResponse.json({ success: false, message: "Project not open for proposals" }, { status: 400 });
    }

    // Get designer profile
    const designerProfile = await queryOne<{ id: number; display_name: string }>(
      `SELECT id, display_name FROM designer_profiles WHERE user_id = ?`, [user.id]
    );
    if (!designerProfile) {
      return NextResponse.json({ success: false, message: "Designer profile not found" }, { status: 404 });
    }

    // Check if already submitted
    const existing = await queryOne(
      `SELECT id FROM design_proposals WHERE design_project_id = ? AND designer_profile_id = ?`,
      [projectId, designerProfile.id]
    );
    if (existing) {
      return NextResponse.json({ success: false, message: "You already submitted a proposal for this project" }, { status: 409 });
    }

    const body = await request.json();
    const { price, estimatedDays, conceptNotes, sampleAttachments } = body;

    if (!price || Number(price) <= 0) {
      return NextResponse.json({ success: false, message: "Price is required and must be positive" }, { status: 400 });
    }
    if (!estimatedDays || Number(estimatedDays) <= 0) {
      return NextResponse.json({ success: false, message: "Estimated days is required and must be positive" }, { status: 400 });
    }

    const attachmentsStr = Array.isArray(sampleAttachments) ? JSON.stringify(sampleAttachments) : sampleAttachments || null;

    await query(
      `INSERT INTO design_proposals (design_project_id, designer_profile_id, price, estimated_days, concept_notes, sample_attachments)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, designerProfile.id, Number(price), Number(estimatedDays), conceptNotes?.trim() || null, attachmentsStr]
    );

    // Increment proposals_count
    await query(`UPDATE design_projects SET proposals_count = proposals_count + 1 WHERE id = ?`, [projectId]);

    // Notify the brand owner
    createNotification({
      userId: project.created_by_user_id,
      title: "New Design Proposal",
      message: `${designerProfile.display_name} submitted a proposal for "${project.title}".`,
      type: "design_proposal",
      referenceType: "design_project",
      referenceId: projectId,
    }).catch(console.error);

    return NextResponse.json({ success: true, message: "Proposal submitted" }, { status: 201 });
  } catch (error) {
    console.error("POST design proposal error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// PUT /api/design-projects/[id]/proposals — brand updates proposal status (accept/reject/shortlist)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user, "brand") || !user.companyId) {
      return NextResponse.json({ success: false, message: "Only brands can manage proposals" }, { status: 403 });
    }

    const { id } = await params;
    const projectId = Number(id);

    // Verify ownership
    const project = await queryOne<{ brand_company_id: number; title: string }>(
      `SELECT brand_company_id, title FROM design_projects WHERE id = ?`, [projectId]
    );
    if (!project || project.brand_company_id !== user.companyId) {
      return NextResponse.json({ success: false, message: "Not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const { proposalId, status: newStatus } = body;

    if (!proposalId || !Number.isFinite(Number(proposalId))) {
      return NextResponse.json({ success: false, message: "proposalId is required" }, { status: 400 });
    }

    const validStatuses = ["shortlisted", "accepted", "rejected"];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return NextResponse.json({ success: false, message: "Invalid status. Must be shortlisted, accepted, or rejected" }, { status: 400 });
    }

    // Get the proposal + designer user_id
    const proposal = await queryOne<{ id: number; designer_profile_id: number; status: string }>(
      `SELECT dpr.id, dpr.designer_profile_id, dpr.status
       FROM design_proposals dpr
       WHERE dpr.id = ? AND dpr.design_project_id = ?`,
      [Number(proposalId), projectId]
    );
    if (!proposal) {
      return NextResponse.json({ success: false, message: "Proposal not found" }, { status: 404 });
    }

    await query(
      `UPDATE design_proposals SET status = ?, responded_at = NOW() WHERE id = ?`,
      [newStatus, proposal.id]
    );

    // If accepted, assign designer to project and set status to in_progress
    if (newStatus === "accepted") {
      await query(
        `UPDATE design_projects SET designer_profile_id = ?, status = 'in_progress', updated_at = NOW() WHERE id = ?`,
        [proposal.designer_profile_id, projectId]
      );

      // Reject other proposals
      await query(
        `UPDATE design_proposals SET status = 'rejected', responded_at = NOW()
         WHERE design_project_id = ? AND id != ? AND status NOT IN ('withdrawn', 'rejected')`,
        [projectId, proposal.id]
      );
    }

    // Notify the designer
    const designerUser = await queryOne<{ user_id: number }>(
      `SELECT user_id FROM designer_profiles WHERE id = ?`, [proposal.designer_profile_id]
    );
    if (designerUser) {
      const statusMessages: Record<string, string> = {
        shortlisted: `Your proposal for "${project.title}" has been shortlisted!`,
        accepted: `Congratulations! Your proposal for "${project.title}" has been accepted!`,
        rejected: `Your proposal for "${project.title}" was not selected.`,
      };
      createNotification({
        userId: designerUser.user_id,
        title: `Proposal ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: statusMessages[newStatus],
        type: "design_proposal",
        referenceType: "design_project",
        referenceId: projectId,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, message: `Proposal ${newStatus}` });
  } catch (error) {
    console.error("PUT design proposal error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
